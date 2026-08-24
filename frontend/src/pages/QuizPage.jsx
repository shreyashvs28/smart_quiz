import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Clock, Zap, TrendingUp, TrendingDown, CheckCircle2, XCircle, ChevronRight, Brain } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const DifficultyBadge = ({ difficulty }) => {
  const map = {
    easy: { cls: 'tag-easy', label: 'EASY' },
    medium: { cls: 'tag-medium', label: 'MEDIUM' },
    hard: { cls: 'tag-hard', label: 'HARD' }
  };
  const { cls, label } = map[difficulty] || map.easy;
  return <span className={cls}>{label}</span>;
};

const OptionLetter = ({ index }) => {
  const letters = ['A', 'B', 'C', 'D'];
  return (
    <span className="w-7 h-7 rounded-full border border-current flex items-center justify-center text-xs font-mono flex-shrink-0">
      {letters[index]}
    </span>
  );
};

export default function QuizPage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(location.state?.firstQuestion || null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null); // { isCorrect, correctAnswer, explanation, nextQuestion }
  const [loading, setLoading] = useState(!location.state?.firstQuestion);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [difficultyChanged, setDifficultyChanged] = useState(null); // 'up' | 'down' | null
  const timerRef = useRef(null);
  const questionStartTime = useRef(Date.now());

  // Start timer
  useEffect(() => {
    questionStartTime.current = Date.now();
    setTimer(0);
    timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(timerRef.current);
  }, [currentQuestion]);

  const handleSelectAnswer = (index) => {
    if (selectedAnswer !== null || answerResult) return;
    setSelectedAnswer(index);
  };

  const handleSubmit = async () => {
    if (selectedAnswer === null || submitting) return;
    clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
    setSubmitting(true);
    setError('');

    try {
      const res = await api.post('/quiz/answer', {
        sessionId,
        answerIndex: selectedAnswer,
        timeTaken
      });

      const { isCorrect, correctAnswer, explanation, isLastQuestion, nextQuestion, difficultyChanged: dc } = res.data;

      if (isCorrect) setScore(s => s + 1);
      setAnswerResult({ isCorrect, correctAnswer, explanation, isLastQuestion, nextQuestion });

      if (dc) setDifficultyChanged(
        nextQuestion?.difficulty === 'hard' ? 'up' :
        nextQuestion?.difficulty === 'easy' ? 'down' : null
      );

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = useCallback(() => {
    if (answerResult?.isLastQuestion) {
      navigate(`/report/${sessionId}`);
      return;
    }
    setDifficultyChanged(null);
    setCurrentQuestion(answerResult.nextQuestion);
    setSelectedAnswer(null);
    setAnswerResult(null);
  }, [answerResult, sessionId, navigate]);

  if (loading || !currentQuestion) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-ink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 font-body text-sm">Loading your quiz...</p>
        </div>
      </div>
    );
  }

  const { index, total, questionText, options, difficulty } = currentQuestion;
  const progress = ((index + 1) / total) * 100;
  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const getOptionClass = (i) => {
    if (!answerResult) {
      return selectedAnswer === i ? 'selected' : '';
    }
    if (i === answerResult.correctAnswer) return 'correct';
    if (i === selectedAnswer && !answerResult.isCorrect) return 'wrong';
    return 'opacity-40';
  };

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-5 pt-24 pb-16">

        {/* Header bar */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <DifficultyBadge difficulty={difficulty} />
            {difficultyChanged === 'up' && (
              <div className="flex items-center gap-1.5 text-neon-green text-xs font-mono animate-fade-in">
                <TrendingUp size={13} /> Level up!
              </div>
            )}
            {difficultyChanged === 'down' && (
              <div className="flex items-center gap-1.5 text-ink-300 text-xs font-mono animate-fade-in">
                <TrendingDown size={13} /> Easing back
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-white/40 text-sm font-mono">
              <Clock size={13} />
              {formatTime(timer)}
            </div>
            <div className="flex items-center gap-1.5 text-white/40 text-sm font-mono">
              <Zap size={13} className="text-neon-yellow" />
              {score} pts
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-2">
          <div className="flex justify-between text-white/30 text-xs font-mono mb-2">
            <span>Question {index + 1} of {total}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Question card */}
        <div className="glass-card p-8 mt-6 animate-slide-up">
          <p className="font-display font-600 text-white text-xl md:text-2xl leading-snug mb-8">
            {questionText}
          </p>

          {/* Options */}
          <div className="flex flex-col gap-3">
            {options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${getOptionClass(i)}`}
                onClick={() => handleSelectAnswer(i)}
                disabled={!!answerResult}
              >
                <OptionLetter index={i} />
                <span className="flex-1">{option}</span>
                {answerResult && i === answerResult.correctAnswer && (
                  <CheckCircle2 size={18} className="text-neon-green flex-shrink-0" />
                )}
                {answerResult && i === selectedAnswer && !answerResult.isCorrect && i !== answerResult.correctAnswer && (
                  <XCircle size={18} className="text-pink-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Explanation after answer */}
          {answerResult && (
            <div className={`mt-6 p-5 rounded-2xl border animate-fade-in ${
              answerResult.isCorrect
                ? 'bg-neon-green/8 border-neon-green/25'
                : 'bg-pink-500/8 border-pink-500/25'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {answerResult.isCorrect
                  ? <CheckCircle2 size={16} className="text-neon-green" />
                  : <XCircle size={16} className="text-pink-400" />
                }
                <span className={`font-display font-700 text-sm ${answerResult.isCorrect ? 'text-neon-green' : 'text-pink-400'}`}>
                  {answerResult.isCorrect ? 'Correct!' : 'Incorrect'}
                </span>
              </div>
              <p className="text-white/70 text-sm font-body leading-relaxed">{answerResult.explanation}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm font-body">{error}</p>
          </div>
        )}

        {/* Action button */}
        <div className="mt-5 flex justify-end">
          {!answerResult ? (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswer === null || submitting}
              className="btn-primary flex items-center gap-2 px-8"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : 'Submit Answer'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex items-center gap-2 px-8 animate-slide-up"
            >
              {answerResult.isLastQuestion ? (
                <>
                  <Brain size={16} /> View Report
                </>
              ) : (
                <>
                  Next Question <ChevronRight size={16} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
