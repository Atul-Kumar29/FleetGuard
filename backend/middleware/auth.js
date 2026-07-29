const { getSupabaseClient } = require('../config/supabase');

const DEMO_USERS = [
  { id: '1', email: 'manager@fleetguard.com', role: 'FLEET_MANAGER' },
  { id: '2', email: 'driver@fleetguard.com', role: 'DRIVER' },
  { id: '3', email: 'mechanic@fleetguard.com', role: 'MECHANIC' },
  { id: '4', email: 'admin@fleetguard.com', role: 'ADMIN' },
];

function getDemoUserFromToken(token) {
  if (!token.startsWith('token_')) {
    return null;
  }

  const tokenParts = token.split('_');
  if (tokenParts.length < 2) {
    return null;
  }

  const userId = tokenParts[1];
  return DEMO_USERS.find((user) => user.id === userId) || null;
}

function requireRole(allowedRoles = []) {
  return async function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

      if (!token) {
        return res.status(401).json({ error: 'Authentication token is required.' });
      }

      const demoUser = getDemoUserFromToken(token);
      if (demoUser) {
        if (allowedRoles.length > 0 && !allowedRoles.includes(demoUser.role)) {
          return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }

        req.user = { ...demoUser };
        return next();
      }

      const supabase = getSupabaseClient();
      const { data: { user }, error: userError } = await supabase.auth.getUser(token);

      if (userError || !user) {
        return res.status(401).json({ error: 'Invalid or expired authentication token.' });
      }

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileError || !profile) {
        return res.status(403).json({ error: 'User profile is not available for authorization.' });
      }

      if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
        return res.status(403).json({ error: 'You do not have permission to perform this action.' });
      }

      req.user = {
        id: user.id,
        email: user.email,
        role: profile.role,
      };

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Authentication failed.' });
    }
  };
}

module.exports = {
  requireRole,
};
