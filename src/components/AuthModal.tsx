/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, CheckCircle2, Award, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { auth, loginWithGoogle, isMock } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isMock) {
        // Mock sign-in fallback for instant developer previews
        setSuccess(true);
        setTimeout(() => {
          onAuthSuccess({
            uid: 'mock_email_user_789',
            email: email || 'user@example.com',
            displayName: name || 'Valued Kigali Client',
            emailVerified: true,
          });
          setSuccess(false);
          onClose();
        }, 1500);
        return;
      }

      if (isLogin) {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        onAuthSuccess(cred.user);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(cred.user, { displayName: name });
        }
        onAuthSuccess(cred.user);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Email Authentication Failed:', err);
      setError(err.message || 'Authentication failed. Please check details or click Google Login.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await loginWithGoogle();
      onAuthSuccess(res.user);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Google Auth Failed:', err);
      setError('Google Sign-In aborted or failed. Try email/password demo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
      >
        {/* Floating Close Action Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 border border-zinc-800 hover:border-amber-500 rounded-full text-zinc-400 hover:text-white transition-colors"
          title="Close Modal"
        >
          <X size={16} />
        </button>

        {success ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full animate-pulse">
              <CheckCircle2 size={48} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Access Granted</h3>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Authorized successfully. Connecting to Kigali Server...
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Identity */}
            <div className="text-center space-y-1">
              <div className="inline-flex p-2.5 bg-zinc-950 rounded-xl border border-zinc-800/80 text-amber-500 mb-1">
                <Zap size={24} className="fill-amber-500 text-zinc-950" />
              </div>
              <h3 className="text-lg font-extrabold text-white tracking-tight">Kigali Customer Account</h3>
              <p className="text-xs text-zinc-400 font-mono leading-relaxed">
                Save billing addresses and track electrical purchase orders securely
              </p>
            </div>

            {/* Error Indicators */}
            {error && (
              <div className="bg-red-950/40 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs font-mono">
                ⚠ {error}
              </div>
            )}

            {/* Switch tabs controller */}
            <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-850 rounded-lg">
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className={`py-1.5 text-xs font-bold font-mono uppercase tracking-wide rounded-md transition-all ${
                  isLogin ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className={`py-1.5 text-xs font-bold font-mono uppercase tracking-wide rounded-md transition-all ${
                  !isLogin ? 'bg-amber-500 text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                Register
              </button>
            </div>

            {/* Submit Auth Forms */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <User size={16} />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jean Manzi"
                      className="w-full bg-zinc-950 border border-zinc-800 text-zinc-150 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Mail size={16} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. user@lisavolt.com"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-150 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Lock size={16} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 text-zinc-150 rounded-lg pl-10 pr-4 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-zinc-100 hover:bg-white text-zinc-900 font-bold font-mono uppercase tracking-wider text-xs rounded-lg transition-colors cursor-pointer shadow-md disabled:opacity-50"
              >
                {loading ? 'Processing...' : isLogin ? 'LOG IN TO SHOP' : 'CREATE ACCOUNT'}
              </button>
            </form>

            {/* Separator block */}
            <div className="relative my-4 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800" />
              </div>
              <span className="relative bg-zinc-900 px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                Or authorization flow
              </span>
            </div>

            {/* Google Authentication Trigger */}
            <button
              onClick={handleGoogleClick}
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-amber-500 font-mono font-medium rounded-lg text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow"
            >
              <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.578-7.859-8s3.53-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.983 0-.74-.08-1.302-.175-1.864H12.24z" />
              </svg>
              <span>Instant Google Sign-In</span>
            </button>

            <div className="text-center font-mono text-[10px] text-zinc-600 block pt-2 flex items-center justify-center gap-1">
              <Award size={10} className="text-emerald-500" />
              <span>Full-stack Firebase Security Rules Active</span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
