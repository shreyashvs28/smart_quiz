import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Sparkles, AlertCircle, BookOpen, Hash, Gauge } from 'lucide-react';
import Navbar from '../components/Navbar';
import api from '../utils/api';

const topicSuggestions = [
  'JavaScript Fundamentals', 'React.js', 'Data Structures',
  'Python Basics', 'World History', 'Human Biology',
  'Machine Learning', 'SQL & Databases', 'General Science',
  'Mathematics', 'Physics', 'Economics'
];

const DifficultyCard = ({ value, label, desc, selected, onSelect, color, emoji }) => (
  <button
    type="button"
    onClick={() => onSelect(value)}
    className={`relative p-5 rounded-2xl border text-left transition-all duration-200 ${
      selected
        ? 'border-opacity-60 scale-[1.02]'
        : 'border-white/8 hover:border-white/20 hover:bg-white/3'
    }`}
    style={selected ? {
      background: `${color}10`,
      borderColor: color,
      boxShadow: `0 0 20px ${color}20`
    } : { background: 'rgba(255,255,255,0.03)' }}
  >
    <div className="text-2xl mb-2">{emoji}</div>
    <p className="font-display font-700 text-white text-base mb-1">{label}</p>
    <p className="text-white/40 text-xs font-body leading-relaxed">{desc}</p>
    {selected && (
      <div className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: color }}>
        <span className="text-black text-xs">✓</span>
      </div>
    )}
  </button>
);

export default function QuizSetupPage() {
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState('easy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleStart = async (e) => {
    e.preventDefault();
    if (!topic.trim()) { setError('Please enter a topic.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/quiz/start', {
        topic: topic.trim(),
        totalQuestions: numQuestions,
        difficulty
      });
      navigate(`/quiz/${res.data.sessionId}`, { state: { firstQuestion: res.data.question } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to start quiz. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-5 pt-24 pb-16">
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-ink-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={24} className="text-white" />
          </div>
          <h1 className="font-display font-800 text-white text-3xl mb-2">Set up your quiz</h1>
          <p className="text-white/40 font-body text-sm">The AI will generate unique questions just for you</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
            <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm font-body">{error}</p>
          </div>
        )}

        <form onSubmit={handleStart} className="flex flex-col gap-7">
          {/* Topic */}
          <div className="glass-card p-6">
            <label className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest mb-4">
              <BookOpen size={13} /> Topic
            </label>
            <input
              type="text"
              className="input-field text-lg mb-4"
              placeholder="e.g. React Hooks, World War II, DNA Replication..."
              value={topic}
              onChange={e => setTopic(e.target.value)}
              required
            />
            <div className="flex flex-wrap gap-2">
              {topicSuggestions.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-body transition-all ${
                    topic === t
                      ? 'bg-ink-600 text-white border border-ink-400'
                      : 'bg-white/5 text-white/50 border border-white/8 hover:bg-white/8 hover:text-white/80'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Number of questions */}
          <div className="glass-card p-6">
            <label className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest mb-4">
              <Hash size={13} /> Number of Questions: <span className="text-ink-300 text-base font-display font-700">{numQuestions}</span>
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full accent-ink-500 h-2 cursor-pointer"
            />
            <div className="flex justify-between text-white/30 text-xs font-mono mt-2">
              <span>3</span>
              <span>Quick (5)</span>
              <span>Standard (10)</span>
              <span>Full (20)</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="glass-card p-6">
            <label className="flex items-center gap-2 text-white/60 text-xs font-mono uppercase tracking-widest mb-4">
              <Gauge size={13} /> Starting Difficulty
            </label>
            <p className="text-white/30 text-xs font-body mb-4">The quiz will adapt automatically — this is just where you start.</p>
            <div className="grid grid-cols-3 gap-3">
              <DifficultyCard
                value="easy"
                label="Easy"
                desc="Fundamental concepts & recall"
                selected={difficulty === 'easy'}
                onSelect={setDifficulty}
                color="#00ff88"
                emoji="🌱"
              />
              <DifficultyCard
                value="medium"
                label="Medium"
                desc="Applied knowledge & analysis"
                selected={difficulty === 'medium'}
                onSelect={setDifficulty}
                color="#5555ff"
                emoji="⚡"
              />
              <DifficultyCard
                value="hard"
                label="Hard"
                desc="Complex reasoning & synthesis"
                selected={difficulty === 'hard'}
                onSelect={setDifficulty}
                color="#ff0088"
                emoji="🔥"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating first question...
              </>
            ) : (
              <>
                <Brain size={18} />
                Start Quiz
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
