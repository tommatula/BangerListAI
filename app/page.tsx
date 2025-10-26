"use client"

import React, { useState } from 'react';
import { Copy, Sparkles, RefreshCw, CheckCircle } from 'lucide-react';

export default function BangerListAI() {
  const [activityName, setActivityName] = useState('');
  const [participationLevel, setParticipationLevel] = useState('');
  const [hoursPerWeek, setHoursPerWeek] = useState('');
  const [description, setDescription] = useState('');
  const [charLimit, setCharLimit] = useState(150);
  const [activities, setActivities] = useState([]);
  const [currentActivityIndex, setCurrentActivityIndex] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const voiceConfig = [
    {
      id: 'professional',
      label: 'Professional',
      description: 'Clear, achievement-focused, emphasizes results',
      color: 'border-blue-500'
    },
    {
      id: 'banger1',
      label: 'Banger 1',
      description: 'Fun, quirky and engaging descriptions of your activities that will make admissions officers take note',
      color: 'border-purple-500'
    },
    {
      id: 'banger2',
      label: 'Banger 2',
      description: 'Another great banger alternative',
      color: 'border-green-500'
    }
  ];


  const handleAddActivity = () => {
    if (!activityName.trim() || description.length < 50) {
      alert('Please fill in both activity name and description (minimum 50 characters)');
      return;
    }

    const newActivity = {
      id: Date.now(),
      name: activityName,
      participationLevel,
      hoursPerWeek,
      description,
      charLimit,
      variations: null
    };

    setActivities([...activities, newActivity]);
    
    // Clear form for next activity
    setActivityName('');
    setParticipationLevel('');
    setHoursPerWeek('');
    setDescription('');
    
    alert('Activity added! Add more or click "Make It Bang" to generate all variations.');
  };

  const handleGenerate = async () => {
    if (activities.length === 0) {
      alert('Please add at least one activity first');
      return;
    }

    setLoading(true);
    
    try {
      // Call the real API
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          activities: activities
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate variations');
      }

      // Map the API response to our activity structure
      const updatedActivities = activities.map((activity, index) => ({
        ...activity,
        generatedContent: data.data.activities[index]
      }));
      
      setActivities(updatedActivities);
      setCurrentActivityIndex(0);
      setLoading(false);
      
      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error: unknown) {
      setLoading(false);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to generate variations. Please try again.'}`);
      console.error('Generation error:', error);
    }
  };

  const handleSelectActivity = (index) => {
    setCurrentActivityIndex(index);
    
    // Scroll to results
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleDeleteActivity = (index) => {
    const updatedActivities = activities.filter((_, i) => i !== index);
    setActivities(updatedActivities);
    if (currentActivityIndex === index) {
      setCurrentActivityIndex(null);
      setVariations([]);
    } else if (currentActivityIndex > index) {
      setCurrentActivityIndex(currentActivityIndex - 1);
    }
  };

  const handleReset = () => {
    setActivities([]);
    setVariations([]);
    setActivityName('');
    setParticipationLevel('');
    setHoursPerWeek('');
    setDescription('');
    setCurrentActivityIndex(null);
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            BangerListAI
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-3">
            Create Activity Descriptions Admissions Officers Want to Read
          </p>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Created with input from former admissions officers from Stanford, Northwestern and UVA!
          </p>
          <div className="mt-8">
            <button
              onClick={() => document.getElementById('tool')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg text-lg transition duration-200 shadow-lg hover:shadow-xl"
            >
              Try It Free
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Drop Your Story</h3>
            <p className="text-gray-600">Tell us what you did, how you crushed it, and why it matters</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">AI Works Its Magic</h3>
            <p className="text-gray-600">Watch your activity transform into three killer versions that pop off the page</p>
          </div>
          <div className="bg-white rounded-lg p-6 shadow-md">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Pick Your Vibe</h3>
            <p className="text-gray-600">Copy your favorite and drop it straight into your app—done and done</p>
          </div>
        </div>

        {/* Tool Interface */}
        <div id="tool" className="bg-white rounded-2xl shadow-2xl p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Make Your Activities Pop
          </h2>

          {/* Activity List Sidebar */}
          {activities.length > 0 && (
            <div className="mb-8 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Your Activities ({activities.length})</h3>
              <div className="space-y-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.id}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg ${
                      currentActivityIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-700'
                    }`}
                  >
                    <button
                      onClick={() => handleSelectActivity(index)}
                      className="flex-1 text-left"
                    >
                      {activity.name}
                    </button>
                    <button
                      onClick={() => handleDeleteActivity(index)}
                      className="ml-2 text-red-500 hover:text-red-700 font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Activity Name
              </label>
              <input
                type="text"
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g., Debate Team Captain, Volunteer Tutor, Robotics Club"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Participation Level
              </label>
              <select
                value={participationLevel}
                onChange={(e) => setParticipationLevel(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white text-gray-900"
                disabled={loading}
              >
                <option value="">Select your role...</option>
                <option value="founder">Founder</option>
                <option value="president">President</option>
                <option value="vice-president">Vice President</option>
                <option value="captain">Captain</option>
                <option value="leader">Team Leader</option>
                <option value="officer">Officer</option>
                <option value="member">Member</option>
                <option value="participant">Participant</option>
                <option value="volunteer">Volunteer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hours Per Week
              </label>
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                placeholder="e.g., 10"
                min="0"
                max="168"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your role, responsibilities, achievements, and impact. Be specific about what you did and what you accomplished. Minimum 50 characters."
                rows="6"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
              <div className="flex items-center justify-between mt-2">
                <div className="text-sm text-gray-500">
                  {description.length} characters
                  {description.length > 0 && description.length < 50 && (
                    <span className="text-amber-600 ml-2">
                      (Need {50 - description.length} more)
                    </span>
                  )}
                  {description.length >= 50 && (
                    <CheckCircle className="inline ml-2 text-green-500" size={16} />
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Target Character Limit
              </label>
              <div className="flex gap-4">
                {[100, 150, 200, 250].map(limit => (
                  <button
                    key={limit}
                    onClick={() => setCharLimit(limit)}
                    disabled={loading}
                    className={`px-6 py-3 rounded-lg font-semibold transition ${
                      charLimit === limit
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {limit}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddActivity}
                disabled={loading || !activityName.trim() || description.length < 50}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Activity
              </button>
              
              <button
                onClick={handleGenerate}
                disabled={loading || activities.length === 0}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {loading ? (
                  <>
                    <RefreshCw className="animate-spin" size={20} />
                    Creating Your Bangers...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Make It Bang
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {currentActivityIndex !== null && activities[currentActivityIndex]?.generatedContent && (
          <div id="results" className="mt-12 space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">
                {activities[currentActivityIndex].name}
              </h2>
              <button
                onClick={handleReset}
                className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition"
              >
                Start Over
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Common App Column */}
              <div>
                <div className="bg-blue-100 rounded-t-lg p-4 border-b-4 border-blue-600">
                  <h3 className="text-2xl font-bold text-gray-900">Common Application</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="bg-white rounded p-2">
                      <span className="font-semibold">Organization:</span> {activities[currentActivityIndex].generatedContent.commonApp.organizationName}
                      <span className="text-gray-500 ml-2">({activities[currentActivityIndex].generatedContent.commonApp.organizationName.length}/100)</span>
                    </div>
                    <div className="bg-white rounded p-2">
                      <span className="font-semibold">Position:</span> {activities[currentActivityIndex].generatedContent.commonApp.position}
                      <span className="text-gray-500 ml-2">({activities[currentActivityIndex].generatedContent.commonApp.position.length}/50)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  {activities[currentActivityIndex].generatedContent.commonApp.variations.map((variation, index) => {
                    const config = voiceConfig[index];
                    return (
                      <div
                        key={index}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${variation.color}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {config.label}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {config.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(variation.text, `ca-${index}`)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold ml-2"
                          >
                            <Copy size={16} />
                            {copiedIndex === `ca-${index}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        
                        <p className="text-gray-800 leading-relaxed mb-3">
                          {variation.text}
                        </p>
                        
                        <div className="text-sm text-gray-600 pt-2 border-t">
                          {variation.text.length}/150 characters
                          {variation.text.length > 150 && (
                            <span className="text-red-600 ml-2">⚠️ Over limit by {variation.text.length - 150}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* UC Application Column */}
              <div>
                <div className="bg-purple-100 rounded-t-lg p-4 border-b-4 border-purple-600">
                  <h3 className="text-2xl font-bold text-gray-900">UC Application</h3>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="bg-white rounded p-2">
                      <span className="font-semibold">Activity Name:</span> {activities[currentActivityIndex].generatedContent.uc.activityName}
                      <span className="text-gray-500 ml-2">({activities[currentActivityIndex].generatedContent.uc.activityName.length}/60)</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 mt-4">
                  {activities[currentActivityIndex].generatedContent.uc.variations.map((variation, index) => {
                    const config = voiceConfig[index];
                    return (
                      <div
                        key={index}
                        className={`bg-white rounded-xl shadow-lg p-6 border-l-4 ${variation.color}`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">
                              {config.label}
                            </h4>
                            <p className="text-xs text-gray-600 mb-3">
                              {config.description}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopy(variation.text, `uc-${index}`)}
                            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition text-sm font-semibold ml-2"
                          >
                            <Copy size={16} />
                            {copiedIndex === `uc-${index}` ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                        
                        <p className="text-gray-800 leading-relaxed mb-3">
                          {variation.text}
                        </p>
                        
                        <div className="text-sm text-gray-600 pt-2 border-t">
                          {variation.text.length}/350 characters
                          {variation.text.length > 350 && (
                            <span className="text-red-600 ml-2">⚠️ Over limit by {variation.text.length - 350}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Tips Section */}
            <div className="bg-blue-50 rounded-xl p-6 mt-8">
              <h3 className="font-bold text-gray-900 mb-3 text-lg">
                💡 Pro Tips
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• <strong>Professional</strong> works best for Common App and formal applications</li>
                <li>• <strong>Banger variations</strong> shine in supplemental essays and personality-focused prompts</li>
                <li>• Feel free to edit and personalize any variation to match your authentic voice</li>
                <li>• If a variation is over the limit, you can trim a few words or regenerate</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-600 text-sm">
          <p>BangerListAI - Making college applications less painful, one activity at a time.</p>
          <p className="mt-2">AI-powered descriptions • No signup required • Free to try</p>
        </div>
      </div>
    </div>
  );
}
