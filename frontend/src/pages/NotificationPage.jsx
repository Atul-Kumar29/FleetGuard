import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('fleetguard_token') || '';
      const response = await axios.get(`${API_BASE_URL}/api/admin/notifications`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data && response.data.success) {
        // Enforce newest notifications first sorting (backend already returns sorted, but this guarantees sorting)
        const sorted = (response.data.data || []).sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      } else {
        setError('Failed to load notifications.');
      }
    } catch (err) {
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Format timestamp helper
  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' ' + date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get style config based on severity
  const getSeverityStyle = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL':
        return {
          card: 'bg-red-50/80 border-red-500/80 text-red-900',
          badge: 'bg-red-500/10 text-red-700 border border-red-500/20',
          icon: '⚠️'
        };
      case 'WARNING':
        return {
          card: 'bg-yellow-50/80 border-yellow-500/80 text-yellow-900',
          badge: 'bg-yellow-500/10 text-yellow-700 border border-yellow-500/20',
          icon: '🛠️'
        };
      case 'INFO':
      default:
        return {
          card: 'bg-blue-50/80 border-blue-500/80 text-blue-900',
          badge: 'bg-blue-500/10 text-blue-700 border border-blue-500/20',
          icon: 'ℹ️'
        };
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Notifications
        </h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">
          Total Notifications: <span className="text-slate-800 text-base font-bold">{notifications.length}</span>
        </p>
      </div>

      {/* States handler */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-slate-500">Loading notifications...</p>
        </div>
      ) : error ? (
        <div className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm max-w-md mx-auto">
          <p className="text-red-650 font-bold text-lg mb-2">Error</p>
          <p className="text-slate-600 text-sm mb-6">{error}</p>
          <button
            onClick={fetchNotifications}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold py-2.5 px-6 rounded-xl transition-all shadow-sm shadow-sky-500/10"
          >
            Retry
          </button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center shadow-sm">
          <span className="text-4xl mb-4 block">🔔</span>
          <h3 className="text-lg font-bold text-slate-900">No notifications found.</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Your system logs are currently clear. No active alerts or warning conditions detected.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif, index) => {
            const styles = getSeverityStyle(notif.severity);
            return (
              <div
                key={notif.id || index}
                className={`p-5 rounded-2xl border-l-4 border bg-white ${styles.card} shadow-sm transition-all hover:translate-x-1 duration-200`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Emoji */}
                  <span className="text-2xl pt-0.5 select-none">{styles.icon}</span>

                  <div className="flex-1 space-y-2">
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-extrabold text-base tracking-tight text-slate-900">
                        {notif.title}
                      </h3>
                      
                      {/* Meta Tags */}
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${styles.badge}`}>
                          {notif.severity}
                        </span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider border border-slate-200">
                          {notif.type}
                        </span>
                      </div>
                    </div>

                    {/* Message Body */}
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {notif.message}
                    </p>

                    {/* Timestamp */}
                    <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                      <span>🕒</span>
                      <time dateTime={notif.createdAt}>{formatTime(notif.createdAt)}</time>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
