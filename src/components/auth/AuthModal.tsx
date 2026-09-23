import React, { useState } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from '../../lib/firebase';
import { useFinance } from '../../context/FinanceContext';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Laptop,
  ArrowRight,
  LogOut,
  Mail,
  Lock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { user, isSyncing, lastSyncedAt } = useFinance();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (err: any) {
      console.error('Google Sign-in error', err);
      setErrorMsg(err.message || 'Không thể đăng nhập bằng Google. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có tối thiểu 6 ký tự.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      if (authMode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onClose();
    } catch (err: any) {
      console.error('Email Auth error', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Email hoặc mật khẩu không chính xác.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email này đã được sử dụng. Vui lòng chuyển sang Đăng nhập.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMsg('Địa chỉ email không hợp lệ.');
      } else {
        setErrorMsg(err.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await signInAnonymously(auth);
      onClose();
    } catch (err: any) {
      console.error('Anonymous Sign-in error', err);
      setErrorMsg(err.message || 'Không thể tạo phiên đồng bộ ẩn danh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      onClose();
    } catch (err: any) {
      console.error('Sign out error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-150 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {user ? (
          /* Profile & Sync Status View */
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg border-2 border-emerald-300">
                {user.displayName
                  ? user.displayName.slice(0, 2).toUpperCase()
                  : user.email
                  ? user.email.slice(0, 2).toUpperCase()
                  : 'YN'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                    Đang Đồng Bộ Realtime
                  </span>
                </div>
                <h3 className="text-base font-bold text-neutral-900 truncate">
                  {user.displayName || user.email || 'Tài khoản ẩn danh'}
                </h3>
                {user.email && (
                  <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                )}
              </div>
            </div>

            {/* Sync Info Banner */}
            <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Trạng thái đám mây:</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã kết nối Firestore
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-neutral-500">Lần đồng bộ gần nhất:</span>
                <span className="font-mono text-neutral-800">
                  {lastSyncedAt ? lastSyncedAt.toLocaleTimeString('vi-VN') : 'Vừa xong'}
                </span>
              </div>
            </div>

            {/* Multi-device guide */}
            <div className="p-4 bg-indigo-50/70 border border-indigo-150 rounded-xl space-y-2 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <Smartphone className="w-4 h-4 text-indigo-600" />
                <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                <Laptop className="w-4 h-4 text-indigo-600" />
                <span>Cách dùng trên thiết bị khác:</span>
              </div>
              <p className="text-indigo-900/80 leading-relaxed text-[11px]">
                Mở ứng dụng này trên điện thoại hoặc máy tính khác, bấm <strong>Đăng nhập</strong> và sử dụng cùng tài khoản{' '}
                <strong>{user.email || 'này'}</strong>. Toàn bộ thu chi sẽ nhảy số tức thì ở cả 2 nơi!
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-xl text-xs font-semibold hover:bg-neutral-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất</span>
              </button>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-colors shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Sign In / Register View */
          <div className="space-y-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[11px] font-semibold">
                <Cloud className="w-3.5 h-3.5" />
                <span>Đồng Bộ Đám Mây Realtime</span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900">
                {authMode === 'login' ? 'Đăng Nhập Sổ Thu Chi' : 'Tạo Tài Khoản Mới'}
              </h3>
              <p className="text-xs text-neutral-500">
                Đồng bộ tự động giữa điện thoại và máy tính. Không sợ mất dữ liệu khi đổi máy.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Sign-in button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 px-4 border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-2.5 transition-all shadow-xs"
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
              <span>Tiếp tục với Google (Khuyên dùng)</span>
            </button>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider shrink-0">
                hoặc dùng Email
              </span>
            </div>

            {/* Email form */}
            <form onSubmit={handleEmailAuth} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Địa chỉ Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="ban@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Mật khẩu
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
              >
                {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>{authMode === 'login' ? 'Đăng Nhập' : 'Tạo Tài Khoản'}</span>
              </button>
            </form>

            <div className="flex items-center justify-between text-xs text-neutral-500 pt-1">
              <span>
                {authMode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'register' : 'login');
                  setErrorMsg(null);
                }}
                className="font-semibold text-neutral-900 hover:underline"
              >
                {authMode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
              </button>
            </div>

            {/* Anonymous quick sync */}
            <div className="pt-2 border-t border-neutral-100 text-center">
              <button
                type="button"
                onClick={handleAnonymousSignIn}
                disabled={loading}
                className="text-[11px] text-neutral-500 hover:text-neutral-800 underline"
              >
                Dùng thử đồng bộ ẩn danh (Không cần mật khẩu)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
