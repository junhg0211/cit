import { usernameRegex } from '$lib/auth';
import { query } from '$lib/db';
import { getUserByUsername } from '$lib/users';
import { json, type RequestHandler } from '@sveltejs/kit';
import dotenv from 'dotenv';

dotenv.config();

export const POST: RequestHandler = async ({ request }) => {
	const { username, password } = await request.json();

	if (!username || password === undefined) {
		return json({ success: false, message: '사용자명과 비밀번호를 입력해주세요.' });
	}

	if (!usernameRegex.test(username)) {
		return json({
			success: false,
			message: '사용자명은 3-20자의 영문자, 숫자, 밑줄만 사용할 수 있습니다.'
		});
	}

	const existingUser = await getUserByUsername(username);

	if (existingUser) {
		return json({ success: false, message: '이미 존재하는 사용자명입니다.' });
	}

	const saltedPassword = password + process.env.SALT;
	const passwordHash = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(saltedPassword)
	);
	const passwordHashHex = Array.from(new Uint8Array(passwordHash))
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');

	const q = await query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [
		username,
		passwordHashHex
	]);

	if (q.error) {
		return json({ success: false, message: q.error });
	}

	return json({ success: true });
};
