import { checkToken } from '$lib/auth';
import { getUserById } from '$lib/users';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const token = request.headers.get('authorization')?.split(' ')[1];

	if (!token) {
		return json({ success: false, message: '로그인이 필요합니다.' });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' });
	}

	const me = await getUserById(userId);

	return json({ success: true, me });
};
