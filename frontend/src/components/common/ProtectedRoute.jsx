import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="page-loading">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="unauthorized-page">
        <p>Please log in to access this page.</p>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="unauthorized-page">
        <p>You don't have permission to access this page.</p>
        <p>Required role: {allowedRoles.join(' or ')}</p>
      </div>
    );
  }

  return children;
}
