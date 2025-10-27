"use client"

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export default function BangerListAI() {
  const [activityName, setActivityName] = useState('');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type definitions
interface Activity {
  id: number;
  name: string;
  participationLevel: string;
  hoursPerWeek: string;
  description: string;
  charLimit: number;
}

interface GenerateRequest {
  activities: Activity[];
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: GenerateRequest = await request.json();
    const { activities } = body;

    // Validation
    if (!activities || activities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No activities provided' },
        { status: 400 }
      );
    }

    // Build the prompt for ChatGPT
    const systemPrompt = `You are BangerListAI — an AI trained to create creative, descriptive, and interesting college application activity descriptions.

Your task is to rewrite student activity descriptions in three distinct styles:

1. Professional: Clean, concise, achievement-focused. Emphasizes measurable results and leadership. Formal and polished.

2. Spicy Version A: Playful, descriptive, and interesting. Shows personality while staying appropriate. Makes admissions officers actually want to read it.

3. Spicy Version B: Quirky, bold, personality-rich. Tells a story. Memorable and authentic. Still appropriate for college apps.

CRITICAL CHARACTER LIMITS:
- Common App Activity Description: ≤150 characters (strict)
- Common App Organization Name: ≤100 characters
- Common App Position/Leadership: ≤50 characters
- UC Application Activity Description: ≤350 characters (strict)
- UC Application Activity Name: ≤60 characters

IMPORTANT RULES:
- Stay truthful to the original description - no fabrication
- Use varied vocabulary across all three versions
- Each version must feel distinctly different
- UC versions should be more detailed since they have more space
- Common App versions must be punchy and concise

You must respond with valid JSON only, no other text.`;

    const userPrompt = `Generate variations for these activities:

${activities.map((activity, index) => `
Activity ${index + 1}:
Name: ${activity.name}
Role: ${activity.participationLevel || 'Member'}
Hours/Week: ${activity.hoursPerWeek || 'N/A'}
Description: ${activity.description}
---`).join('\n')}

Return a JSON array with this exact structure for each activity:
{
  "activities": [
    {
      "commonApp": {
        "organizationName": "string (≤100 chars)",
        "position": "string (≤50 chars)",
        "variations": [
          { "voice": "Professional", "text": "string (≤150 chars)" },
          { "voice": "Spicy Version A", "text": "string (≤150 chars)" },
          { "voice": "Spicy Version B", "text": "string (≤150 chars)" }
        ]
      },
      "uc": {
        "activityName": "string (≤60 chars)",
        "variations": [
          { "voice": "Professional", "text": "string (≤350 chars)" },
          { "voice": "Spicy Version A", "text": "string (≤350 chars)" },
          { "voice": "Spicy Version B", "text": "string (≤350 chars)" }
        ]
      }
    }
  ]
}`;

    // Call OpenAI API
    console.log('Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    // Parse response
    const responseText = completion.choices[0].message.content;
    console.log('=== RAW OpenAI Response ===');
    console.log(responseText);
    console.log('=== End Response ===');
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Failed to parse:', responseText);
      throw new Error('OpenAI returned invalid JSON format');
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      data: parsedResponse,
      metadata: {
        tokensUsed: completion.usage?.total_tokens || 0,
        model: completion.model
      }
    });

  } catch (error: any) {
    console.error('API Error:', error);

    // Handle different error types
    if (error.code === 'insufficient_quota') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'OpenAI API quota exceeded. Please check your billing.' 
        },
        { status: 429 }
      );
    }

    if (error.code === 'invalid_api_key') {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid OpenAI API key. Please check your configuration.' 
        },
        { status: 401 }
      );
    }

    // Generic error
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate variations. Please try again.' 
      },
      { status: 500 }
    );
  }
}
