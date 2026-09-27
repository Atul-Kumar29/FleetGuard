import type { NextFunction, Request, Response } from 'express';

type Role = 'FLEET_MANAGER' | 'DRIVER' | 'MECHANIC' | 'ADMIN' | string;

interface DemoUser {
	id: string;
	email: string;
	role: Role;
	demoTokenId: string;
}

interface AuthenticatedUser {
	id: string;
	email?: string;
	role: Role;
	demoTokenId?: string;
}

interface SupabaseUser {
	id: string;
	email?: string;
}

interface SupabaseResult<T> {
	data: T;
	error: Error | null;
}

interface SupabaseClient {
	auth: {
		getUser(token: string): Promise<SupabaseResult<{ user: SupabaseUser | null }>>;
	};
	from(table: string): {
		select(columns: string): {
			eq(column: string, value: string): {
				single(): Promise<SupabaseResult<{ role: Role } | null>>;
			};
		};
	};
}

interface SupabaseModule {
	getSupabaseClient(accessToken?: string): SupabaseClient;
}

declare module 'express-serve-static-core' {
	interface Request {
		user?: AuthenticatedUser;
		supabase?: SupabaseClient;
	}
}

const { getSupabaseClient } = require('../config/supabase') as SupabaseModule;

const DEMO_USERS: DemoUser[] = [
	{ id: '22222222-2222-2222-2222-222222222222', email: 'manager@fleetguard.com', role: 'FLEET_MANAGER', demoTokenId: '1' },
	{ id: '33333333-3333-3333-3333-333333333333', email: 'driver@fleetguard.com', role: 'DRIVER', demoTokenId: '2' },
	{ id: '55555555-5555-5555-5555-555555555555', email: 'mechanic@fleetguard.com', role: 'MECHANIC', demoTokenId: '3' },
	{ id: '11111111-1111-1111-1111-111111111111', email: 'admin@fleetguard.com', role: 'ADMIN', demoTokenId: '4' },
];

function getDemoUserFromToken(token: string): DemoUser | null {
	const normalizedToken = token.trim();
	if (!normalizedToken.startsWith('token_')) {
		return null;
	}

	const userId = normalizedToken.split('_')[1];
	return DEMO_USERS.find((user) => user.id === userId || user.demoTokenId === userId) ?? null;
}

function requireRole(allowedRoles: Role[] = []) {
	return async function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<void> {
		try {
			const authHeader = req.headers.authorization ?? req.headers.Authorization ?? '';
			const authValue = Array.isArray(authHeader) ? authHeader[0] ?? '' : authHeader;
			const token = authValue.toLowerCase().startsWith('bearer ') ? authValue.slice(7).trim() : '';

			if (!token) {
				res.status(401).json({ error: 'Authentication token is required.' });
				return;
			}

			const demoUser = getDemoUserFromToken(token);
			if (demoUser) {
				if (allowedRoles.length > 0 && !allowedRoles.includes(demoUser.role)) {
					res.status(403).json({ error: 'You do not have permission to perform this action.' });
					return;
				}

				req.user = { ...demoUser };
				next();
				return;
			}

			const supabase = getSupabaseClient();
			const userResult = await supabase.auth.getUser(token).catch(() => null);
			const user = userResult?.data.user;

			if (userResult?.error || !user) {
				res.status(401).json({ error: 'Invalid or expired authentication token.' });
				return;
			}

			const { data: profile, error: profileError } = await supabase
				.from('users')
				.select('role')
				.eq('id', user.id)
				.single();

			if (profileError || !profile) {
				res.status(403).json({ error: 'User profile is not available for authorization.' });
				return;
			}

			if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
				res.status(403).json({ error: 'You do not have permission to perform this action.' });
				return;
			}

			req.user = {
				id: user.id,
				...(user.email ? { email: user.email } : {}),
				role: profile.role,
			};
			req.supabase = getSupabaseClient(token);
			next();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : 'Authentication failed.';
			res.status(500).json({ error: message });
		}
	};
}

module.exports = { requireRole };
