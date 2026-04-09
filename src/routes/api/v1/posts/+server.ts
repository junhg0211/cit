import { checkToken } from '$lib/auth';
import { createPost } from '$lib/posts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request }) => {
	const token = request.headers.get('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	const { title, content, coauthor, anchor, anchor_version } = await request.json();

	if (!title || !content) {
		return json({ success: false, message: '제목과 내용은 필수입니다.' }, { status: 400 });
	}

	const coauthors = coauthor
		.split(',')
		.map((username: string) => username.trim())
		.filter((username: string) => username.length > 0);

	await createPost(userId, { title, content, coauthors, anchor, anchor_version });

	return json({ success: true });
};
