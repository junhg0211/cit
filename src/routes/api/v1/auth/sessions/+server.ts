import { checkToken } from '$lib/auth';
import { query } from '$lib/db';
import { json, type RequestHandler } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();

	const saltedPassword = password + process.env.SALT;
	const passwordHash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(saltedPassword)
	);
	const passwordHashHex = Array.from(new Uint8Array(passwordHash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	const [result] = await query(
		'SELECT username FROM users WHERE username = ? AND password_hash = ?',
		[username, passwordHashHex]
	);

	if (!result) {
		return json(
			{ success: false, message: '사용자명 혹은 비밀번호가 잘못되었습니다.' },
			{ status: 401 }
		);
	}

	const token = crypto.randomUUID();

	const session = await query(
		'INSERT INTO sessions (user_id, token, expires_at) VALUES ((SELECT id FROM users WHERE username = ?), ?, DATE_ADD(NOW(), INTERVAL 7 DAY))',
		[username, token]
	);

	if (session.error) {
		return json({ success: false, message: session.error }, { status: 500 });
	}

	return json({ success: true, token });
};

export const DELETE: RequestHandler = async ({ request }) => {
	const authorization = request.headers.get('Authorization');
	if (!authorization) {
		return json({ success: false, message: '인증 토큰이 필요합니다.' }, { status: 401 });
	}

	const token = authorization.replace('Bearer ', '');
	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	const result = await query('DELETE FROM sessions WHERE token = ?', [token]);

	if (result.error) {
		return json({ success: false, message: result.error }, { status: 500 });
	}

	return json({ success: true, message: '로그아웃 성공' });
};
