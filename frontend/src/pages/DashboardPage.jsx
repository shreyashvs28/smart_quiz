import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trophy, Clock, Target, ChevronRight, Brain, BarChart3 } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="glass-card p-5 flex items-center gap-4">
    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <div>
      <p className="text-white/40 text-xs font-mono uppercase tracking-wider">{label}</p>
      <p className="font-display font-700 text-white text-2xl">{value}</p>
    </div>
  </div>
);

const difficultyTag = (d) => {
  const map = { easy: 'tag-easy', medium: 'tag-medium', hard: 'tag-hard' };
  return <span className={map[d] || 'tag-easy'}>{d}</span>;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/quiz/history')
      .then(res => setHistory(res.data.sessions || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalQuizzes = history.length;
  const avgAccuracy = history.length > 0
    ? Math.round(history.reduce((sum, s) => sum + (s.score / s.totalQuestions * 100), 0) / history.length)
    : 0;
  const bestScore = history.length > 0
    ? Math.max(...history.map(s => Math.round(s.score / s.totalQuestions * 100)))
    : 0;

  return (
    <div className="min-h-screen grid-bg">
      <Navbar />
      <div className="max-w-6xl mx-auto px-5 pt-24 pb-16">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-white/40 text-sm font-mono mb-1">Welcome back,</p>
            <h1 className="font-display font-800 text-white text-3xl">{user?.username} 👋</h1>
          </div>
          <Link to="/quiz/setup" className="btn-primary flex items-center gap-2 self-start md:self-auto">
            <Plus size={16} /> New Quiz
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard icon={Brain} label="Quizzes Taken" value={totalQuizzes} color="#5555ff" />
          <StatCard icon={Target} label="Avg Accuracy" value={`${avgAccuracy}%`} color="#00ff88" />
          <StatCard icon={Trophy} label="Best Score" value={`${bestScore}%`} color="#ffee00" />
        </div>

        {/* Quick Start */}
        <div className="glass-card p-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-ink-600/10 blur-3xl rounded-full pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6 justify-between">
            <div>
              <h2 className="font-display font-700 text-white text-xl mb-2">Ready to challenge yourself?</h2>
              <p className="text-white/50 text-sm font-body max-w-md">Our AI adapts to your performance in real-time — getting harder when you're on a roll, and easier when you need a hand.</p>
            </div>
            <Link to="/quiz/setup" className="btn-primary flex items-center gap-2 flex-shrink-0">
              Start Quiz <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Quiz History */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-700 text-white text-xl flex items-center gap-2">
              <BarChart3 size={18} className="text-ink-400" />
              Recent Quizzes
            </h2>
          </div>

          {loading ? (
            <div className="glass-card p-10 text-center">
              <div className="w-8 h-8 border-2 border-ink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-white/30 text-sm">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Brain size={36} className="text-white/20 mx-auto mb-4" />
              <p className="text-white/40 font-body mb-4">No quizzes yet. Take your first one!</p>
              <Link to="/quiz/setup" className="btn-primary inline-flex items-center gap-2">
                <Plus size={16} /> Create Quiz
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map(session => {
                const accuracy = Math.round((session.score / session.totalQuestions) * 100);
                const date = new Date(session.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return (
                  <Link
                    key={session.sessionId}
                    to={`/report/${session.sessionId}`}
                    className="glass-card-hover p-5 flex items-center gap-5 group"
                  >
                    {/* Score ring */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center relative"
                      style={{
                        background: `conic-gradient(${accuracy >= 80 ? '#00ff88' : accuracy >= 50 ? '#5555ff' : '#ff0088'} ${accuracy * 3.6}deg, rgba(255,255,255,0.08) 0deg)`,
                        padding: '2px'
                      }}>
                      <div className="w-full h-full rounded-full bg-[#050508] flex items-center justify-center">
                        <span className="font-display font-700 text-white text-sm">{accuracy}%</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-display font-600 text-white truncate">{session.topic}</p>
                        {difficultyTag(session.startingDifficulty)}
                      </div>
                      <p className="text-white/40 text-xs font-mono">
                        {session.score}/{session.totalQuestions} correct · {date}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 text-white/30 group-hover:text-ink-300 transition-colors flex-shrink-0">
                      <span className="text-xs font-body hidden sm:block">View Report</span>
                      <ChevronRight size={16} />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
