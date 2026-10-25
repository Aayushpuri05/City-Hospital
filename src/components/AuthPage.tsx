import React, { useState } from 'react';
import {
  Cross,
  Mail,
  Lock,
  User,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  initialMode?: 'signin' | 'signup' | 'forgot';
  onAuthSuccess: () => void;
  onCancel: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'signin',
  onAuthSuccess,
  onCancel
}) => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    redirectDestination
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    setErrorCode(null);
    setSuccessMessage(null);
  };

  const switchToMode = (newMode: 'signin' | 'signup' | 'forgot') => {
    resetMessages();
    setMode(newMode);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email address and password.');
      return;
    }

    setIsSubmitting(true);
    const res = await signInWithEmail(email, password);
    setIsSubmitting(false);

    if (res.success) {
      onAuthSuccess();
    } else {
      setErrorMessage(res.error || 'Failed to sign in.');
      setErrorCode(res.code || null);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    const res = await signUpWithEmail(fullName, email, password, phone);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onAuthSuccess();
      }, 1000);
    } else {
      setErrorMessage(res.error || 'Failed to register account.');
      setErrorCode(res.code || null);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMessage('Please enter a valid email address to receive password reset instructions.');
      return;
    }

    setIsSubmitting(true);
    const res = await sendPasswordReset(email);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Password reset link sent! Check your inbox to set a new password.');
    } else {
      setErrorMessage(res.error || 'Failed to send reset email.');
      setErrorCode(res.code || null);
    }
  };

  const handleGoogleSignIn = async () => {
    resetMessages();
    setIsSubmitting(true);
    const res = await signInWithGoogle();
    setIsSubmitting(false);

    if (res.success) {
      onAuthSuccess();
    } else {
      setErrorMessage(res.error || 'Google sign-in was cancelled or failed.');
      setErrorCode(res.code || null);
    }
  };

  const isInvalidCredentialError =
    errorCode === 'auth/invalid-credential' ||
    errorCode === 'auth/user-not-found' ||
    errorCode === 'auth/wrong-password';

  return (
    <div className="py-12 sm:py-16 bg-slate-50 min-h-[calc(100vh-140px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden">
        {/* Top Header Card */}
        <div className="p-6 sm:p-8 bg-gradient-to-r from-slate-900 to-cyan-950 text-white text-center relative">
          <div className="w-12 h-12 rounded-xl bg-cyan-600 mx-auto flex items-center justify-center text-white mb-3 shadow-md shadow-cyan-900/40">
            <Cross className="w-6 h-6 fill-white stroke-white" />
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {mode === 'signin' && 'Sign In to City Hospital'}
            {mode === 'signup' && 'Create Patient Account'}
            {mode === 'forgot' && 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {redirectDestination?.tab === 'lab-analyzer'
              ? 'Sign in to access the private Lab Report Analyzer and review your health markers.'
              : redirectDestination?.tab === 'appointments'
              ? 'Sign in to book and manage appointments with City Hospital doctors.'
              : 'Secure, protected portal for appointments, lab reports, and clinical records.'}
          </p>
        </div>

        {/* Tab switch for Sign In vs Create Account */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1.5 mx-6 sm:mx-8 mt-5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => switchToMode('signin')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-cyan-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => switchToMode('signup')}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-cyan-800 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account</span>
            </button>
          </div>
        )}

        {/* Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          {/* Actionable Error Card */}
          {errorMessage && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-rose-950">
                    {isInvalidCredentialError
                      ? 'Authentication Unsuccessful'
                      : errorCode === 'auth/operation-not-allowed'
                      ? 'Sign-In Provider Disabled'
                      : 'Attention'}
                  </div>
                  <div className="text-rose-800 mt-0.5">{errorMessage}</div>
                </div>
              </div>

              {/* Smart Recovery Buttons for auth/invalid-credential */}
              {isInvalidCredentialError && mode === 'signin' && (
                <div className="pt-2 border-t border-rose-200/80 flex flex-col gap-2">
                  <p className="text-[11px] text-rose-700 font-medium">
                    New patient or not sure if you registered with this email?
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        resetMessages();
                        setMode('signup');
                      }}
                      className="px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>Register account with {email ? `"${email}"` : 'this email'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Sign in with Google</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetMessages();
                        setMode('forgot');
                      }}
                      className="text-[11px] text-rose-800 hover:underline font-medium"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>
              )}

              {/* Smart Recovery for account already in use on signup */}
              {errorCode === 'auth/email-already-in-use' && mode === 'signup' && (
                <div className="pt-2 border-t border-rose-200/80">
                  <button
                    type="button"
                    onClick={() => {
                      resetMessages();
                      setMode('signin');
                    }}
                    className="px-2.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                  >
                    <LogIn className="w-3 h-3" />
                    <span>Click here to Sign In with this email</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* Quick Google Sign-In */}
          {mode !== 'forgot' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 shadow-2xs transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  Or use email & password
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700">
                    Password *
                  </label>
                  <button
                    type="button"
                    onClick={() => switchToMode('forgot')}
                    className="text-[11px] text-cyan-700 hover:underline font-medium cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-600">
                New to City Hospital?{' '}
                <button
                  type="button"
                  onClick={() => switchToMode('signup')}
                  className="text-cyan-700 hover:underline font-bold cursor-pointer"
                >
                  Create an account now
                </button>
              </div>
            </form>
          )}

          {/* MODE: SIGN UP */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Eleanor Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    placeholder="+91 98200 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onFocus={() => {
                      if (!phone.trim()) setPhone('+91 ');
                    }}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password (min. 6 characters) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-cyan-50/70 border border-cyan-100 text-[11px] text-cyan-900 flex items-start gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-700 shrink-0 mt-0.5" />
                <span>Your medical appointments and reports are securely protected with Firebase Authentication.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => switchToMode('signin')}
                  className="text-cyan-700 hover:underline font-bold cursor-pointer"
                >
                  Sign In instead
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Account Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="patient@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-cyan-700 hover:bg-cyan-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Sending instructions...</span>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Send Reset Link</span>
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-xs text-slate-600">
                <button
                  type="button"
                  onClick={() => switchToMode('signin')}
                  className="text-cyan-700 hover:underline font-medium cursor-pointer"
                >
                  ← Return to Sign In
                </button>
              </div>
            </form>
          )}

          {/* Cancel button */}
          <div className="pt-2 text-center border-t border-slate-100">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Continue browsing public hospital website
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
