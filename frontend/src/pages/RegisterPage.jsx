import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form.username, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const checks = [
    { label: 'At least 6 characters', ok: form.password.length >= 6 },
    { label: 'Username 3+ chars', ok: form.username.length >= 3 },
  ];

  return (
    <div className="min-h-screen grid-bg flex items-center justify-center px-5 py-10">
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-ink-600/15 blur-3xl rounded-full pointer-events-none" />

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-ink-600 flex items-center justify-center">
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-display font-700 text-white text-xl">QuizMind<span className="text-ink-400">AI</span></span>
          </Link>
        </div>

        <div className="glass-card p-8">
          <h1 className="font-display font-700 text-white text-2xl mb-1">Create your account</h1>
          <p className="text-white/40 text-sm font-body mb-8">Free forever. No credit card required.</p>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-6">
              <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm font-body">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                name="username"
                className="input-field"
                placeholder="your_username"
                value={form.username}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs font-mono uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  className="input-field pr-12"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {form.password && (
                <div className="mt-2 flex flex-col gap-1">
                  {checks.map(c => (
                    <div key={c.label} className={`flex items-center gap-2 text-xs font-body transition-colors ${c.ok ? 'text-neon-green' : 'text-white/30'}`}>
                      <CheckCircle2 size={11} />
                      {c.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-white/40 text-sm font-body mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-ink-300 hover:text-ink-200 transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
