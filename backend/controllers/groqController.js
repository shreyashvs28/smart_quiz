const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const generateQuestion = async (topic, difficulty, previousQuestions = []) => {
  const difficultyDescriptions = {
    easy: 'basic, fundamental concepts, straightforward recall questions',
    medium: 'intermediate concepts, application of knowledge, analytical thinking',
    hard: 'advanced concepts, complex reasoning, synthesis and evaluation'
  };

  const prevQTexts = previousQuestions.slice(-3).map(q => `- ${q.questionText}`).join('\n');
  const avoidClause = prevQTexts 
    ? `\nAvoid repeating these recent questions:\n${prevQTexts}` 
    : '';

  const prompt = `Generate a multiple choice quiz question about "${topic}" at ${difficulty} difficulty level (${difficultyDescriptions[difficulty]}).${avoidClause}

Return ONLY a valid JSON object with this exact structure (no markdown, no extra text):
{
  "question": "The question text here?",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why the correct answer is right"
}

Rules:
- correctAnswer is the 0-based index of the correct option in the options array
- All 4 options must be plausible but only one correct
- Question must be clear and unambiguous
- Explanation should be 1-2 sentences
- Match the difficulty level strictly`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',  // ✅ Fixed model name
      messages: [
        {
          role: 'system',
          content: 'You are an expert quiz question generator. Always respond with valid JSON only, no markdown formatting.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const content = response.choices[0].message.content.trim();
    
    // Strip markdown code blocks if present
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.question || !Array.isArray(parsed.options) || parsed.options.length !== 4 || 
        typeof parsed.correctAnswer !== 'number' || !parsed.explanation) {
      throw new Error('Invalid question structure from AI');
    }

    return {
      questionText: parsed.question,
      options: parsed.options,
      correctAnswer: parsed.correctAnswer,
      explanation: parsed.explanation,
      difficulty,
      topic
    };
  } catch (error) {
    console.error('Groq API error:', error);
    throw new Error('Failed to generate question: ' + error.message);
  }
};

const generateReport = async (topic, questions) => {
  const answeredQuestions = questions.filter(q => q.userAnswer !== null);
  const correctAnswers = answeredQuestions.filter(q => q.isCorrect);
  const wrongAnswers = answeredQuestions.filter(q => !q.isCorrect);

  const wrongTopics = wrongAnswers.map(q => ({
    question: q.questionText,
    difficulty: q.difficulty
  }));

  const prompt = `A student just completed a quiz on "${topic}" with the following results:
- Total Questions: ${answeredQuestions.length}
- Correct Answers: ${correctAnswers.length}
- Wrong Answers: ${wrongAnswers.length}
- Accuracy: ${Math.round((correctAnswers.length / answeredQuestions.length) * 100)}%
- Difficulty breakdown: Easy correct: ${correctAnswers.filter(q => q.difficulty === 'easy').length}, Medium correct: ${correctAnswers.filter(q => q.difficulty === 'medium').length}, Hard correct: ${correctAnswers.filter(q => q.difficulty === 'hard').length}

Questions they got wrong (topics to focus on):
${wrongTopics.map(w => `- [${w.difficulty}] ${w.question}`).join('\n')}

Generate a detailed performance report. Return ONLY valid JSON:
{
  "overallFeedback": "2-3 sentence overall assessment",
  "strengths": ["strength 1", "strength 2"],
  "areasToImprove": ["area 1", "area 2", "area 3"],
  "studyRecommendations": ["specific recommendation 1", "specific recommendation 2", "specific recommendation 3"],
  "performanceLevel": "Beginner|Developing|Proficient|Advanced|Expert",
  "motivationalMessage": "An encouraging message for the student"
}`;

  try {
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are an educational assessment expert. Provide constructive, encouraging feedback. Return only valid JSON.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 800
    });

    const content = response.choices[0].message.content.trim();
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('Report generation error:', error);
    return {
      overallFeedback: `You completed the quiz on ${topic} with ${Math.round((correctAnswers.length / answeredQuestions.length) * 100)}% accuracy.`,
      strengths: correctAnswers.length > 0 ? ['Completed the quiz', 'Showed understanding of some concepts'] : ['Completed the quiz'],
      areasToImprove: wrongAnswers.length > 0 ? ['Review incorrect answers', 'Practice more on this topic'] : [],
      studyRecommendations: ['Review the topic material', 'Practice more questions', 'Focus on weaker areas'],
      performanceLevel: correctAnswers.length / answeredQuestions.length >= 0.8 ? 'Proficient' : 'Developing',
      motivationalMessage: 'Keep practicing and you will improve!'
    };
  }
};

module.exports = { generateQuestion, generateReport };