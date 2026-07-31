const { getSupabaseClient } = require('../config/supabase');

const DEMO_USERS = [
  { id: '22222222-2222-2222-2222-222222222222', email: 'manager@fleetguard.com', role: 'FLEET_MANAGER', demoTokenId: '1' },
  { id: '33333333-3333-3333-3333-333333333333', email: 'driver@fleetguard.com', role: 'DRIVER', demoTokenId: '2' },
  { id: '55555555-5555-5555-5555-555555555555', email: 'mechanic@fleetguard.com', role: 'MECHANIC', demoTokenId: '3' },
  { id: '11111111-1111-1111-1111-111111111111', email: 'admin@fleetguard.com', role: 'ADMIN', demoTokenId: '4' },
];

function getDemoUserFromToken(token) {
  if (typeof token !== 'string') {
    return null;
  }
  const normalizedToken = token.trim();
  if (!normalizedToken.startsWith('token_')) {
    return null;
  }
  const tokenParts = normalizedToken.split('_');
  if (tokenParts.length < 2) {
    return null;
  }
  const userId = tokenParts[1];
  return DEMO_USERS.find((user) => user.id === userId || user.demoTokenId === userId) || null;
}

function requireRole(allowedRoles = []) {
  return async function authMiddleware(req, res, next) {
    try {
      const authHeader = req.headers.authorization || req.headers.Authorization || '';
      const token = authHeader.toString().startsWith('Bearer ') ? authHeader.slice(7) : authHeader.toString().startsWith('bearer ') ? authHeader.slice(7) : '';
      const normalizedToken = token.trim();

      if (!normalizedToken) {
        return res.status(401).json({ error: 'Authentication token is required.' });
      }

      const demoUser = getDemoUserFromToken(normalizedToken);
      if (demoUser) {
        if (allowedRoles.length > 0 && !allowedRoles.includes(demoUser.role)) {
          return res.status(403).json({ error: 'You do not have permission to perform this action.' });
        }

        req.user = { ...demoUser };
        return next();
      }

      const supabase = getSupabaseClient();
      const userResult = await supabase.auth.getUser(normalizedToken).catch(() => null);
      const user = userResult?.data?.user;
      const userError = userResult?.error;

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
      // RLS policies in Supabase use auth.uid(). Keep the verified JWT on the
      // database client so subsequent controller queries run as this user.
      req.supabase = getSupabaseClient(normalizedToken);

      next();
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Authentication failed.' });
    }
  };
}

module.exports = {
  requireRole,
};
