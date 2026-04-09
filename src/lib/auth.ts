import { query } from './db';

export async function checkToken(token: string): Promise<number | null> {
	const [session] = await query('SELECT user_id, expires_at FROM sessions WHERE token = ?', [
		token
	]);

	if (session && new Date(session.expires_at) < new Date()) {
		await query('DELETE FROM sessions WHERE token = ?', [token]);
		return null;
	}

	return session ? session.user_id : null;
}

export const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
