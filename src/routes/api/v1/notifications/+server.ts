import { checkToken } from '$lib/auth';
import { getNotifications } from '$lib/notifications';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ request }) => {
	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		return json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	const notifications = await getNotifications(userId);

	return json({ success: true, notifications });
};
