const express = require('express');
const { v4: uuidv4 } = require('uuid');
const authMiddleware = require('../middleware/auth');
const QuizSession = require('../models/QuizSession');
const { generateQuestion } = require('../controllers/groqController');

const router = express.Router();

// Adaptive difficulty logic
const getNextDifficulty = (currentDifficulty, isCorrect, consecutiveCorrect, consecutiveWrong) => {
  const levels = ['easy', 'medium', 'hard'];
  const currentIndex = levels.indexOf(currentDifficulty);

  if (isCorrect && consecutiveCorrect >= 2) {
    return levels[Math.min(currentIndex + 1, 2)];
  } else if (!isCorrect && consecutiveWrong >= 1) {
    return levels[Math.max(currentIndex - 1, 0)];
  }
  return currentDifficulty;
};

// Start a new quiz session
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { topic, totalQuestions, difficulty = 'easy' } = req.body;

    if (!topic || !totalQuestions) {
      return res.status(400).json({ message: 'Topic and total questions are required' });
    }

    if (totalQuestions < 1 || totalQuestions > 30) {
      return res.status(400).json({ message: 'Questions must be between 1 and 30' });
    }

    const sessionId = uuidv4();

    // Generate first question
    const firstQuestion = await generateQuestion(topic, difficulty);

    const session = new QuizSession({
      userId: req.user._id,
      sessionId,
      topic,
      totalQuestions: parseInt(totalQuestions),
      startingDifficulty: difficulty,
      currentDifficulty: difficulty,
      questions: [{ ...firstQuestion, userAnswer: null, isCorrect: null }]
    });

    await session.save();

    res.json({
      sessionId,
      question: {
        index: 0,
        total: totalQuestions,
        questionText: firstQuestion.questionText,
        options: firstQuestion.options,
        difficulty: firstQuestion.difficulty
      }
    });
  } catch (error) {
    console.error('Start quiz error:', error);
    res.status(500).json({ message: 'Failed to start quiz: ' + error.message });
  }
});

// Submit answer and get next question
router.post('/answer', authMiddleware, async (req, res) => {
  try {
    const { sessionId, answerIndex, timeTaken = 0 } = req.body;

    const session = await QuizSession.findOne({ sessionId, userId: req.user._id, status: 'active' });
    if (!session) {
      return res.status(404).json({ message: 'Quiz session not found' });
    }

    const currentIndex = session.currentQuestionIndex;
    const currentQuestion = session.questions[currentIndex];

    if (!currentQuestion) {
      return res.status(400).json({ message: 'No active question found' });
    }

    // Record answer
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    session.questions[currentIndex].userAnswer = answerIndex;
    session.questions[currentIndex].isCorrect = isCorrect;
    session.questions[currentIndex].timeTaken = timeTaken;

    if (isCorrect) session.score += 1;

    // Calculate consecutive streaks
    const recentQuestions = session.questions.slice(0, currentIndex + 1).slice(-3);
    const consecutiveCorrect = recentQuestions.reverse().findIndex(q => !q.isCorrect);
    const consecutiveWrong = recentQuestions.findIndex(q => q.isCorrect);

    const nextIndex = currentIndex + 1;
    const isLastQuestion = nextIndex >= session.totalQuestions;

    if (isLastQuestion) {
      session.status = 'completed';
      session.completedAt = new Date();
      session.totalTimeTaken = session.questions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
      await session.save();

      return res.json({
        isCorrect,
        correctAnswer: currentQuestion.correctAnswer,
        explanation: currentQuestion.explanation,
        isLastQuestion: true,
        sessionId
      });
    }

    // Determine next difficulty
    const nextDifficulty = getNextDifficulty(
      session.currentDifficulty,
      isCorrect,
      consecutiveCorrect === -1 ? recentQuestions.length : consecutiveCorrect,
      consecutiveWrong === -1 ? recentQuestions.length : consecutiveWrong
    );

    session.currentDifficulty = nextDifficulty;
    session.currentQuestionIndex = nextIndex;

    // Generate next question
    const nextQuestion = await generateQuestion(
      session.topic,
      nextDifficulty,
      session.questions
    );

    session.questions.push({ ...nextQuestion, userAnswer: null, isCorrect: null });
    await session.save();

    res.json({
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
      isLastQuestion: false,
      nextQuestion: {
        index: nextIndex,
        total: session.totalQuestions,
        questionText: nextQuestion.questionText,
        options: nextQuestion.options,
        difficulty: nextQuestion.difficulty,
        difficultyChanged: nextDifficulty !== session.questions[currentIndex].difficulty
      }
    });
  } catch (error) {
    console.error('Answer error:', error);
    res.status(500).json({ message: 'Failed to process answer: ' + error.message });
  }
});

// Get session status
router.get('/session/:sessionId', authMiddleware, async (req, res) => {
  try {
    const session = await QuizSession.findOne({ 
      sessionId: req.params.sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get quiz history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const sessions = await QuizSession.find({ 
      userId: req.user._id,
      status: 'completed'
    }).sort({ completedAt: -1 }).limit(10).select('-questions');

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
