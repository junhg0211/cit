import { checkToken } from '$lib/auth';
import { postComment, getComments } from '$lib/comments';
import { getPost } from '$lib/posts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ params, request }) => {
	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		return json({ success: false, message: '로그인이 필요합니다.' }, { status: 401 });
	}

	const { pid } = params;
	const { content } = await request.json();

	if (!pid || !content) {
		return json(
			{ success: false, message: '포스트 아이디 또는 댓글 본문이 필요합니다.' },
			{ status: 400 }
		);
	}

	const post = await getPost(parseInt(pid));

	if (!post) {
		return json({ success: false, message: '포스트를 찾을 수 없습니다.' }, { status: 404 });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	await postComment(post.id, userId, content);

	return json({ success: true });
};

export const GET: RequestHandler = async ({ params }) => {
	const { pid } = params;

	if (!pid) {
		return json({ success: false, message: '포스트 아이디가 필요합니다.' }, { status: 400 });
	}

	const post = await getPost(parseInt(pid));

	if (!post) {
		return json({ success: false, message: '포스트를 찾을 수 없습니다.' }, { status: 404 });
	}

	const comments = await getComments(post.id);

	return json({ success: true, comments });
};
