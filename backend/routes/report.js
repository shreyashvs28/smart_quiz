const express = require('express');
const authMiddleware = require('../middleware/auth');
const QuizSession = require('../models/QuizSession');
const { generateReport } = require('../controllers/groqController');

const router = express.Router();

// Generate report for a completed quiz session
router.get('/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await QuizSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
      status: 'completed'
    });

    if (!session) {
      return res.status(404).json({ message: 'Completed session not found' });
    }

    const answeredQuestions = session.questions.filter(q => q.userAnswer !== null);
    const correctAnswers = answeredQuestions.filter(q => q.isCorrect);
    const wrongAnswers = answeredQuestions.filter(q => !q.isCorrect);

    // Difficulty breakdown
    const difficultyStats = {
      easy: { total: 0, correct: 0 },
      medium: { total: 0, correct: 0 },
      hard: { total: 0, correct: 0 }
    };

    answeredQuestions.forEach(q => {
      difficultyStats[q.difficulty].total += 1;
      if (q.isCorrect) difficultyStats[q.difficulty].correct += 1;
    });

    const accuracy = answeredQuestions.length > 0
      ? Math.round((correctAnswers.length / answeredQuestions.length) * 100)
      : 0;

    // Generate AI report
    const aiReport = await generateReport(session.topic, session.questions);

    const report = {
      sessionId: session.sessionId,
      topic: session.topic,
      startingDifficulty: session.startingDifficulty,
      totalQuestions: answeredQuestions.length,
      correctAnswers: correctAnswers.length,
      wrongAnswers: wrongAnswers.length,
      accuracy,
      score: session.score,
      totalTimeTaken: session.totalTimeTaken,
      averageTimePerQuestion: answeredQuestions.length > 0
        ? Math.round(session.totalTimeTaken / answeredQuestions.length)
        : 0,
      difficultyStats,
      completedAt: session.completedAt,
      questions: answeredQuestions.map(q => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswer: q.correctAnswer,
        userAnswer: q.userAnswer,
        isCorrect: q.isCorrect,
        difficulty: q.difficulty,
        explanation: q.explanation,
        timeTaken: q.timeTaken
      })),
      aiReport
    };

    res.json({ report });
  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Failed to generate report: ' + error.message });
  }
});

module.exports = router;
