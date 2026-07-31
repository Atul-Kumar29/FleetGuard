import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { loginWithSupabase, registerWithSupabase } from '../services/api';
import { Shield } from 'lucide-react';

export default function LoginPage({ onLoginSuccess }) {
  const { login } = useAuth();
  const [mode, setMode] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('FLEET_MANAGER');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabSwitch = (newMode) => {
    setMode(newMode);
    setError('');
    setInfoMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setInfoMessage('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { user, access_token: accessToken } = await loginWithSupabase(email, password);
        login(user, accessToken);
        onLoginSuccess();
      } else {
        const response = await registerWithSupabase(email, password, fullName, role);
        if (response.access_token && response.user) {
          login(response.user, response.access_token);
          onLoginSuccess();
        } else {
          setInfoMessage(response.message || 'Registration successful! You can now sign in.');
          setMode('signin');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full px-3.5 py-2.5 border border-slate-300 rounded-lg bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all";
  const labelClass = "block text-sm font-bold text-slate-900 mb-1.5";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100 px-4 py-8">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-xl p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">FleetGuard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-lg mb-6">
          {['signin', 'signup'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => handleTabSwitch(tab)}
              className={`flex-1 py-2.5 text-sm font-bold rounded-md transition-all duration-150
                ${mode === tab
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
                }`}
            >
              {tab === 'signin' ? 'Sign In' : 'Sign Up'}
            </button>
          ))}
        </div>

        {infoMessage && (
          <div className="mb-4 px-4 py-3 bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium rounded-lg">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <>
              <div>
                <label className={labelClass}>Full Name</label>
                <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter full name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
                  <option value="FLEET_MANAGER">Fleet Manager</option>
                  <option value="ADMIN">Admin</option>
                  <option value="MECHANIC">Mechanic</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className={labelClass}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" required className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Enter your password'}
              minLength={mode === 'signup' ? 6 : undefined}
              required
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold rounded-lg text-sm transition-all duration-150 shadow-sm mt-1"
          >
            {loading ? (mode === 'signin' ? 'Signing in...' : 'Creating account...') : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
