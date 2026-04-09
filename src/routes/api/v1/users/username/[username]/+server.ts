import { getUserByUsername } from '$lib/users';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { username } = params;

	if (!username) {
		return json({ success: false, message: '사용자명을 입력해주세요.' }, { status: 400 });
	}

	const user = await getUserByUsername(username);

	if (!user) {
		return json({ success: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
	}

	return json({ success: true, user });
};
