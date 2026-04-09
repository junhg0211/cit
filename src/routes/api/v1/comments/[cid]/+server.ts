import { checkToken } from '$lib/auth';
import { getComment, updateComment } from '$lib/comments';
import { json, type RequestHandler } from '@sveltejs/kit';

export const PUT: RequestHandler = async ({ params, request }) => {
	const { cid } = params;

	if (!cid) {
		return json({ success: false, message: '댓글 아이디가 필요합니다.' }, { status: 400 });
	}

	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		return json({ success: false, message: '인증 토큰이 필요합니다.' }, { status: 401 });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	const comment = await getComment(parseInt(cid));

	if (!comment) {
		return json({ success: false, message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
	}

	if (comment.user.id !== userId) {
		return json({ success: false, message: '댓글을 수정할 권한이 없습니다.' }, { status: 403 });
	}

	const { content } = await request.json();

	if (!content || content.trim() === '') {
		return json({ success: false, message: '댓글 내용은 비어 있을 수 없습니다.' }, { status: 400 });
	}

	await updateComment(parseInt(cid), content);

	return json({ success: true });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	const { cid } = params;

	if (!cid) {
		return json({ success: false, message: '댓글 아이디가 필요합니다.' }, { status: 400 });
	}

	const token = request.headers.get('Authorization')?.split(' ')[1];

	if (!token) {
		return json({ success: false, message: '인증 토큰이 필요합니다.' }, { status: 401 });
	}

	const userId = await checkToken(token);

	if (!userId) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	const comment = await getComment(parseInt(cid));

	if (!comment) {
		return json({ success: false, message: '댓글을 찾을 수 없습니다.' }, { status: 404 });
	}

	if (comment.user.id !== userId) {
		return json({ success: false, message: '댓글을 삭제할 권한이 없습니다.' }, { status: 403 });
	}

	await updateComment(parseInt(cid));

	return json({ success: true });
};
