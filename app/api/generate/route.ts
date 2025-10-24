import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
    const systemPrompt = `You are an expert college admissions essay coach. Your task is to rewrite student activity descriptions for college applications in three distinct voices:

1. Professional: Clear, achievement-focused, emphasizes measurable results. Uses strong action verbs. Formal tone.
2. Banger 1: Fun, quirky and engaging. Makes admissions officers take note. Shows passion and personality. Slightly informal but appropriate.
3. Banger 2: Another great alternative with strong narrative and storytelling. Personal and memorable.

CRITICAL REQUIREMENTS:
- Common App descriptions must be ≤150 characters
- UC Application descriptions must be ≤350 characters
- Common App Organization Name must be ≤100 characters
- Common App Position/Leadership must be ≤50 characters
- UC Activity Name must be ≤60 characters
- Stay truthful to the original description
- Use varied vocabulary across all three variations
- Each variation must be distinctly different in style

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
          { "voice": "Banger 1", "text": "string (≤150 chars)" },
          { "voice": "Banger 2", "text": "string (≤150 chars)" }
        ]
      },
      "uc": {
        "activityName": "string (≤60 chars)",
        "variations": [
          { "voice": "Professional", "text": "string (≤350 chars)" },
          { "voice": "Banger 1", "text": "string (≤350 chars)" },
          { "voice": "Banger 2", "text": "string (≤350 chars)" }
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
    console.log('OpenAI Response:', responseText);
    
    if (!responseText) {
      throw new Error('No response from OpenAI');
    }

    const parsedResponse = JSON.parse(responseText);

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
