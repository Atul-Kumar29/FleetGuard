const { getSupabaseClient } = require('../config/supabase');

const VALID_ROLES = ['FLEET_MANAGER', 'DRIVER', 'MECHANIC', 'ADMIN'];

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.session || !data.user) {
      return res.status(401).json({ error: error?.message || 'Invalid email or password.' });
    }

    const profileClient = getSupabaseClient(data.session.access_token);
    const { data: profile, error: profileError } = await profileClient
      .from('users')
      .select('id, email, full_name, role')
      .eq('id', data.user.id)
      .maybeSingle();

    if (profileError) {
      return res.status(500).json({ error: 'Unable to load the user profile.', details: profileError.message });
    }
    if (!profile) {
      return res.status(403).json({ error: 'Your Supabase account does not have a FleetGuard user profile.' });
    }

    return res.status(200).json({ user: profile, access_token: data.session.access_token });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to sign in.' });
  }
}

async function signup(req, res) {
  const { email, password, full_name, fullName, role } = req.body || {};
  const userName = (full_name || fullName || '').trim();
  const userRole = (role || 'FLEET_MANAGER').trim().toUpperCase();

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!VALID_ROLES.includes(userRole)) {
    return res.status(400).json({ error: `Invalid role. Allowed roles: ${VALID_ROLES.join(', ')}.` });
  }

  try {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: userName || email.split('@')[0],
          role: userRole,
        },
      },
    });

    if (error) {
      return res.status(400).json({ error: error.message || 'Failed to sign up with Supabase Auth.' });
    }

    if (!data.user) {
      return res.status(400).json({ error: 'Registration failed. No user was created.' });
    }

    // If session exists (email confirmation disabled/auto-confirmed)
    if (data.session && data.session.access_token) {
      const profileClient = getSupabaseClient(data.session.access_token);
      let { data: profile } = await profileClient
        .from('users')
        .select('id, email, full_name, role')
        .eq('id', data.user.id)
        .maybeSingle();

      if (!profile) {
        profile = {
          id: data.user.id,
          email: data.user.email,
          full_name: userName || email.split('@')[0],
          role: userRole,
        };
      }

      return res.status(201).json({
        message: 'Registration successful.',
        user: profile,
        access_token: data.session.access_token,
      });
    }

    // Email confirmation required case
    return res.status(201).json({
      message: 'Registration successful. Please check your email to confirm your account before logging in.',
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: userName || email.split('@')[0],
        role: userRole,
      },
      access_token: null,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Unable to register user.' });
  }
}

module.exports = { login, signup };

