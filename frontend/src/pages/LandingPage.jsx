import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, BarChart3, Target, ChevronRight, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const Feature = ({ icon: Icon, title, desc, color }) => (
  <div className="glass-card p-6 flex flex-col gap-3">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center`} style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h3 className="font-display font-700 text-white text-lg">{title}</h3>
    <p className="text-white/50 text-sm leading-relaxed font-body">{desc}</p>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen grid-bg">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-36 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass-card mb-8 text-sm text-ink-300 font-mono">
          <Sparkles size={13} className="text-neon-green" />
          Powered by Groq LLaMA3
        </div>

        <h1 className="font-display text-5xl md:text-7xl font-800 leading-none tracking-tight mb-6">
          <span className="text-gradient">Adaptive quizzes</span><br />
          <span className="text-white">that learn with you</span>
        </h1>

        <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed">
          Enter any topic. Our AI generates personalized questions that get harder when you're on a streak and easier when you stumble — keeping you in the perfect learning zone.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link to="/register" className="btn-primary flex items-center gap-2 text-base">
            Start Learning Free <ChevronRight size={16} />
          </Link>
          <Link to="/login" className="btn-ghost text-base">
            Sign in
          </Link>
        </div>

        {/* Glow effect */}
        <div className="relative mt-20 mx-auto max-w-3xl">
          <div className="absolute inset-0 bg-ink-600/20 blur-3xl rounded-full" />
          <div className="relative glass-card p-8 text-left">
            <div className="flex items-center gap-3 mb-6">
              <div className="tag-medium">MEDIUM</div>
              <span className="text-white/30 text-sm font-mono">Question 4 of 10</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                <span className="text-neon-green text-xs font-mono">AI ADAPTIVE</span>
              </div>
            </div>
            <p className="text-white font-display font-600 text-xl mb-6">What is the time complexity of binary search on a sorted array of n elements?</p>
            <div className="grid grid-cols-2 gap-3">
              {['O(n)', 'O(log n)', 'O(n²)', 'O(1)'].map((opt, i) => (
                <div key={i} className={`option-btn text-sm ${i === 1 ? 'correct' : ''}`}>
                  <span className="w-6 h-6 rounded-full border border-current flex items-center justify-center text-xs font-mono flex-shrink-0">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-4xl font-700 text-white mb-3">Built for real learning</h2>
          <p className="text-white/40 font-body">Not just another quiz app.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Feature icon={Brain} title="AI Generated" desc="Questions crafted by LLaMA3 — unique every time, tuned to your exact topic." color="#5555ff" />
          <Feature icon={Zap} title="Adaptive Difficulty" desc="Score 2 in a row? Level up. Get one wrong? The AI eases back in." color="#00ff88" />
          <Feature icon={BarChart3} title="Detailed Reports" desc="Accuracy, time per question, difficulty heatmaps and AI study tips." color="#00ccff" />
          <Feature icon={Target} title="Any Topic" desc="History, DSA, biology, finance — if you can name it, we can quiz you on it." color="#ffee00" />
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-5 py-20">
        <h2 className="font-display text-4xl font-700 text-white text-center mb-14">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '01', title: 'Set your quiz', desc: 'Enter a topic, pick how many questions, and choose your starting difficulty.' },
            { step: '02', title: 'AI adapts live', desc: 'Questions adjust in real-time — harder on streaks, easier after mistakes.' },
            { step: '03', title: 'Get your report', desc: 'Receive a full AI report with focus areas, study tips, and your performance score.' }
          ].map(({ step, title, desc }) => (
            <div key={step} className="glass-card p-7 relative overflow-hidden">
              <span className="absolute -top-3 -right-2 font-display font-800 text-6xl text-white/3 select-none">{step}</span>
              <div className="font-mono text-ink-400 text-sm mb-3">{step}</div>
              <h3 className="font-display font-700 text-white text-xl mb-2">{title}</h3>
              <p className="text-white/50 text-sm font-body leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-5 py-20 text-center">
        <div className="glass-card p-14 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-ink-600/10 to-transparent" />
          <div className="relative">
            <h2 className="font-display text-4xl font-700 text-white mb-4">Ready to test yourself?</h2>
            <p className="text-white/50 mb-8 font-body">Create your free account and start your first adaptive quiz in seconds.</p>
            <Link to="/register" className="btn-primary inline-flex items-center gap-2 text-base">
              Get Started — It's Free <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 text-center">
        <p className="text-white/20 text-sm font-body">© 2026 QuizMindAI. Built with React, Node.js & Groq.</p>
      </footer>
    </div>
  );
}
