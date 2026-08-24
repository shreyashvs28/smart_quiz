import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Brain, LogOut, LayoutDashboard, Plus, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5" style={{ background: 'rgba(5,5,8,0.85)', backdropFilter: 'blur(20px)' }}>
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ink-600 flex items-center justify-center">
            <Brain size={16} className="text-white" />
          </div>
          <span className="font-display font-700 text-white text-lg tracking-tight">QuizMind<span className="text-ink-400">AI</span></span>
        </Link>

        {/* Desktop Nav */}
        {user && (
          <div className="hidden md:flex items-center gap-2">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${isActive('/dashboard') ? 'bg-ink-600/20 text-ink-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
            <Link
              to="/quiz/setup"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body transition-all ${isActive('/quiz/setup') ? 'bg-ink-600/20 text-ink-300' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Plus size={15} />
              New Quiz
            </Link>
          </div>
        )}

        {/* Right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2.5 px-3 py-1.5 glass-card">
                <div className="w-6 h-6 rounded-full bg-ink-500 flex items-center justify-center text-xs font-display font-700 text-white">
                  {user?.username?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-white/70 text-sm font-body">{user.username}</span>
              </div>
              <button onClick={handleLogout} className="btn-ghost flex items-center gap-2 text-sm py-1.5 px-3">
                <LogOut size={14} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm py-1.5 px-4">Login</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-white/5 px-5 py-4 flex flex-col gap-2" style={{ background: 'rgba(5,5,8,0.95)' }}>
          {user ? (
            <>
              <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={15} /> Dashboard
              </Link>
              <Link to="/quiz/setup" className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/70 hover:text-white hover:bg-white/5 text-sm" onClick={() => setMenuOpen(false)}>
                <Plus size={15} /> New Quiz
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 text-sm text-left">
                <LogOut size={15} /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-white/70 text-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn-primary text-sm text-center" onClick={() => setMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
