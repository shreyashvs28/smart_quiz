const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: String,
  options: [String],
  correctAnswer: Number, // index of correct option
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'] },
  userAnswer: { type: Number, default: null },
  isCorrect: { type: Boolean, default: null },
  timeTaken: { type: Number, default: 0 }, // in seconds
  topic: String,
  explanation: String
});

const quizSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  topic: {
    type: String,
    required: true
  },
  totalQuestions: {
    type: Number,
    required: true
  },
  startingDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  questions: [questionSchema],
  currentQuestionIndex: {
    type: Number,
    default: 0
  },
  currentDifficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned'],
    default: 'active'
  },
  score: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  totalTimeTaken: { type: Number, default: 0 }
});

module.exports = mongoose.model('QuizSession', quizSessionSchema);
