import { getPostsByUsername, getUserById } from '$lib/users';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { uid } = params;

	if (!uid) {
		return json({ success: false, message: '사용자명을 입력해주세요.' }, { status: 400 });
	}

	const username = (await getUserById(parseInt(uid)))?.username;

	if (!username) {
		return json({ success: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
	}

	const posts = await getPostsByUsername(username);

	return json({ success: true, posts });
};
