import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Target, Clock, TrendingUp, CheckCircle2, XCircle,
  BookOpen, Lightbulb, Star, ArrowLeft, Plus, ChevronDown, ChevronUp, Brain
} from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const DiffBar = ({ label, correct, total, color }) => {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1.5">
        <span className="text-white/50 capitalize">{label}</span>
        <span style={{ color }}>{correct}/{total} ({pct}%)</span>
      </div>
      <div className="h-2 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
};

const ScoreRing = ({ accuracy }) => {
  const color = accuracy >= 80 ? '#00ff88' : accuracy >= 50 ? '#5555ff' : '#ff0088';
  const level = accuracy >= 80 ? 'Expert' : accuracy >= 60 ? 'Proficient' : accuracy >= 40 ? 'Developing' : 'Beginner';
  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
          <circle
            cx="60" cy="60" r="50" fill="none"
            stroke={color} strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 50}`}
            strokeDashoffset={`${2 * Math.PI * 50 * (1 - accuracy / 100)}`}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display font-800 text-white text-3xl">{accuracy}%</span>
          <span className="text-white/40 text-xs font-mono">accuracy</span>
        </div>
      </div>
      <span className="mt-3 font-display font-700 text-sm" style={{ color }}>{level}</span>
    </div>
  );
};

/**
 * FIX: Correctly separates strengths (≥60% correct) from weaknesses (<60% correct).
 * Previous bug: threshold was 80% for strengths, meaning most topics incorrectly
 * appeared as weaknesses. Also now handles edge cases like 0-question topics.
 */
const analyzeTopicPerformance = (questions) => {
  const topicStats = {};

  questions.forEach(q => {
    // Normalize topic: fall back to 'General' if missing
    const topic = (q.topic || q.category || 'General').trim();

    if (!topicStats[topic]) {
      topicStats[topic] = { correct: 0, total: 0, wrongQuestions: [] };
    }

    topicStats[topic].total += 1;

    if (q.isCorrect) {
      topicStats[topic].correct += 1;
    } else {
      // Track wrong questions per topic for focused review
      topicStats[topic].wrongQuestions.push(q);
    }
  });

  const topics = Object.entries(topicStats)
    // Skip topics with 0 questions (safety guard)
    .filter(([, stats]) => stats.total > 0)
    .map(([name, stats]) => ({
      name,
      correct: stats.correct,
      total: stats.total,
      percentage: Math.round((stats.correct / stats.total) * 100),
      wrongQuestions: stats.wrongQuestions,
    }));

  return {
    // STRENGTH: scored 60% or above on that topic
    strengths: topics
      .filter(t => t.percentage >= 60)
      .sort((a, b) => b.percentage - a.percentage),

    // WEAKNESS: scored below 60% — these need focused study
    weaknesses: topics
      .filter(t => t.percentage < 60)
      .sort((a, b) => a.percentage - b.percentage), // worst first

    allTopics: topics.sort((a, b) => a.name.localeCompare(b.name)),
  };
};

const QuestionReview = ({ q, index }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all ${
        q.isCorrect ? 'border-neon-green/15' : 'border-pink-500/15'
      }`}
      style={{ background: q.isCorrect ? 'rgba(0,255,136,0.04)' : 'rgba(255,0,136,0.04)' }}
    >
      <button
        className="w-full flex items-start gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <div className="flex-shrink-0 mt-0.5">
          {q.isCorrect
            ? <CheckCircle2 size={18} className="text-neon-green" />
            : <XCircle size={18} className="text-pink-400" />
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
              q.difficulty === 'easy'
                ? 'text-neon-green border-neon-green/30 bg-neon-green/10'
                : q.difficulty === 'medium'
                ? 'text-ink-300 border-ink-400/30 bg-ink-500/10'
                : 'text-pink-400 border-pink-500/30 bg-pink-500/10'
            }`}>
              {q.difficulty}
            </span>
            {/* Show topic badge per question so user knows which topic it belongs to */}
            {(q.topic || q.category) && (
              <span className="text-xs font-mono px-2 py-0.5 rounded-full border border-white/10 text-white/30 bg-white/5 capitalize">
                {q.topic || q.category}
              </span>
            )}
            <span className="text-white/30 text-xs font-mono">{q.timeTaken}s</span>
          </div>
          <p className="text-white/80 text-sm font-body leading-snug line-clamp-2">{q.questionText}</p>
        </div>
        <div className="flex-shrink-0 text-white/30 mt-1">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-3 animate-fade-in">
          <div className="grid grid-cols-1 gap-2">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl text-sm font-body ${
                  i === q.correctAnswer
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                    : i === q.userAnswer && !q.isCorrect
                    ? 'bg-pink-500/10 text-pink-400 border border-pink-500/20'
                    : 'text-white/30'
                }`}
              >
                <span className="font-mono w-5 flex-shrink-0">{String.fromCharCode(65 + i)}.</span>
                {opt}
                {i === q.correctAnswer && <CheckCircle2 size={13} className="ml-auto flex-shrink-0" />}
                {/* FIX: also show X on user's wrong answer clearly */}
                {i === q.userAnswer && !q.isCorrect && i !== q.correctAnswer && (
                  <XCircle size={13} className="ml-auto flex-shrink-0 text-pink-400" />
                )}
              </div>
            ))}
          </div>
          {q.explanation && (
            <div className="p-3 rounded-xl bg-white/5 border border-white/8">
              <p className="text-white/60 text-xs font-body leading-relaxed">
                <span className="text-ink-300 font-mono">Explanation: </span>
                {q.explanation}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function ReportPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [topicAnalysis, setTopicAnalysis] = useState(null);

  useEffect(() => {
    api.get(`/report/${sessionId}`)
      .then(res => {
        const reportData = res.data.report;
        setReport(reportData);
        const analysis = analyzeTopicPerformance(reportData.questions || []);
        setTopicAnalysis(analysis);
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load report.'))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="text-center">
        <Brain size={32} className="text-ink-400 mx-auto mb-4 animate-pulse-slow" />
        <p className="text-white/50 font-body text-sm mb-1">Generating your report...</p>
        <p className="text-white/20 font-mono text-xs">AI is analyzing your performance</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <div className="text-center glass-card p-10">
        <XCircle size={32} className="text-pink-400 mx-auto mb-4" />
        <p className="text-white/60 font-body mb-4">{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
      </div>
    </div>
  );

  const {
    topic, accuracy, correctAnswers, wrongAnswers, totalQuestions,
    totalTimeTaken, averageTimePerQuestion, difficultyStats, questions, aiReport
  } = report;

  const formatTime = (s) => s >= 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  // Determine if we have topic data to show analysis panels
  const hasTopicData = topicAnalysis &&
    (topicAnalysis.strengths.length > 0 || topicAnalysis.weaknesses.length > 0);

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-4xl mx-auto px-5 pt-24 pb-16">

        {/* Back */}
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-white/40 hover:text-white text-sm font-body mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Dashboard
        </button>

        {/* Hero section */}
        <div className="glass-card p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-ink-600/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <ScoreRing accuracy={accuracy} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-white/40 text-xs font-mono uppercase tracking-widest mb-2">Quiz Complete</p>
              <h1 className="font-display font-800 text-white text-2xl md:text-3xl mb-2">{topic}</h1>
              {aiReport?.motivationalMessage && (
                <p className="text-white/60 font-body text-sm leading-relaxed mb-5 italic">
                  "{aiReport.motivationalMessage}"
                </p>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                {[
                  { icon: CheckCircle2, label: 'Correct',      value: correctAnswers,              color: '#00ff88' },
                  { icon: XCircle,      label: 'Incorrect',    value: wrongAnswers,                color: '#ff0088' },
                  { icon: Clock,        label: 'Total Time',   value: formatTime(totalTimeTaken),  color: '#00ccff' },
                  { icon: Target,       label: 'Avg/Question', value: formatTime(averageTimePerQuestion), color: '#ffee00' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={15} style={{ color }} />
                    <span className="text-white/40 text-xs font-mono">{label}:</span>
                    <span className="font-display font-700 text-white text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Difficulty Breakdown */}
          <div className="glass-card p-6">
            <h2 className="font-display font-700 text-white text-lg mb-5 flex items-center gap-2">
              <TrendingUp size={16} className="text-ink-400" /> Difficulty Breakdown
            </h2>
            <div className="flex flex-col gap-4">
              <DiffBar label="Easy"   correct={difficultyStats.easy.correct}   total={difficultyStats.easy.total}   color="#00ff88" />
              <DiffBar label="Medium" correct={difficultyStats.medium.correct} total={difficultyStats.medium.total} color="#5555ff" />
              <DiffBar label="Hard"   correct={difficultyStats.hard.correct}   total={difficultyStats.hard.total}   color="#ff0088" />
            </div>
          </div>

          {/* AI Insights */}
          <div className="glass-card p-6">
            <h2 className="font-display font-700 text-white text-lg mb-5 flex items-center gap-2">
              <Brain size={16} className="text-ink-400" /> AI Assessment
            </h2>
            <p className="text-white/60 text-sm font-body leading-relaxed mb-4">
              {aiReport?.overallFeedback}
            </p>
            {aiReport?.performanceLevel && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-ink-600/20 border border-ink-400/20">
                <Star size={12} className="text-ink-300" />
                <span className="text-ink-300 text-xs font-mono">{aiReport.performanceLevel}</span>
              </div>
            )}
          </div>
        </div>

        {/* Strengths & Weaknesses — only rendered when topic data exists */}
        {hasTopicData && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">

            {/* STRENGTHS: topics where user scored ≥60% */}
            {topicAnalysis.strengths.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-700 text-white text-lg mb-4 flex items-center gap-2">
                  <Trophy size={16} className="text-neon-green" /> Strong Topics
                </h2>
                <ul className="flex flex-col gap-3">
                  {topicAnalysis.strengths.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={14} className="text-neon-green flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-body text-white/80 capitalize font-semibold">{t.name}</p>
                          <span className="text-xs font-mono text-neon-green font-semibold ml-2 flex-shrink-0">
                            {t.correct}/{t.total}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-neon-green rounded-full transition-all duration-700"
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                        <p className="text-neon-green/60 text-xs font-mono mt-1">{t.percentage}% correct</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* WEAKNESSES: topics where user scored <60% — needs focused study */}
            {topicAnalysis.weaknesses.length > 0 && (
              <div className="glass-card p-6">
                <h2 className="font-display font-700 text-white text-lg mb-4 flex items-center gap-2">
                  <Target size={16} className="text-yellow-400" /> Topics to Focus On
                </h2>
                <ul className="flex flex-col gap-3">
                  {topicAnalysis.weaknesses.map((t, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      {/* Priority rank badge — worst topic = #1 to fix */}
                      <span className="w-5 h-5 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-xs flex-shrink-0 mt-0.5 font-semibold">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-body text-white/80 capitalize font-semibold">{t.name}</p>
                          <span className="text-xs font-mono text-pink-400 font-semibold ml-2 flex-shrink-0">
                            {t.correct}/{t.total}
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-pink-400 rounded-full transition-all duration-700"
                            style={{ width: `${t.percentage}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-pink-400/70 text-xs font-mono">{t.percentage}% correct</p>
                          {/* FIX: Show how many questions were wrong so user knows severity */}
                          {t.wrongQuestions.length > 0 && (
                            <p className="text-white/30 text-xs font-mono">
                              {t.wrongQuestions.length} missed
                            </p>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                {/* FIX: Helpful nudge pointing to question review below */}
                <p className="text-white/20 text-xs font-mono mt-4 pt-4 border-t border-white/6">
                  ↓ Review missed questions below to understand your gaps
                </p>
              </div>
            )}
          </div>
        )}

        {/* Study Recommendations */}
        {aiReport?.studyRecommendations?.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h2 className="font-display font-700 text-white text-lg mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-ink-400" /> Study Recommendations
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {aiReport.studyRecommendations.map((rec, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/6">
                  <div className="w-7 h-7 rounded-lg bg-ink-600/30 border border-ink-500/20 flex items-center justify-center mb-3">
                    <BookOpen size={13} className="text-ink-300" />
                  </div>
                  <p className="text-white/60 text-xs font-body leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Question Review — wrong answers first so user sees failures upfront */}
        <div className="mb-8">
          <h2 className="font-display font-700 text-white text-xl mb-1 flex items-center gap-2">
            <BookOpen size={18} className="text-ink-400" /> Question Review
          </h2>
          {/* FIX: Show counts in subtitle so user knows at a glance what to expect */}
          <p className="text-white/30 text-xs font-mono mb-4">
            {wrongAnswers} incorrect · {correctAnswers} correct — wrong answers shown first
          </p>
          <div className="flex flex-col gap-3">
            {/* FIX: Sort so wrong answers bubble to top — user should review failures first */}
            {[...questions]
              .sort((a, b) => (a.isCorrect === b.isCorrect ? 0 : a.isCorrect ? 1 : -1))
              .map((q, i) => <QuestionReview key={i} q={q} index={i} />)
            }
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/quiz/setup" className="btn-primary flex items-center gap-2 justify-center">
            <Plus size={16} /> Take Another Quiz
          </Link>
          <Link to="/dashboard" className="btn-ghost flex items-center gap-2 justify-center">
            <ArrowLeft size={15} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}