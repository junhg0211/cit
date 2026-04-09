import { checkToken } from '$lib/auth';
import { editPost, getPost } from '$lib/posts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { pid } = params;

	if (!pid) {
		return json({ success: false, message: '포스트 아이디가 필요합니다.' }, { status: 400 });
	}

	if (isNaN(parseInt(pid))) {
		return json({ success: false, message: '유효한 포스트 아이디가 필요합니다.' }, { status: 400 });
	}

	const post = await getPost(parseInt(pid));

	if (!post) {
		return json({ success: false, message: '포스트를 찾을 수 없습니다.' }, { status: 404 });
	}

	return json({ success: true, post });
};

export const PUT: RequestHandler = async ({ request, params }) => {
	const { pid } = params;

	if (!pid) {
		return json({ success: false, message: '포스트 아이디가 필요합니다.' }, { status: 400 });
	}

	if (isNaN(parseInt(pid))) {
		return json({ success: false, message: '유효한 포스트 아이디가 필요합니다.' }, { status: 400 });
	}

	const token = request.headers.get('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return json({ success: false, message: '인증 토큰이 필요합니다.' }, { status: 401 });
	}

	const user = await checkToken(token);

	if (!user) {
		return json({ success: false, message: '유효하지 않은 토큰입니다.' }, { status: 401 });
	}

	await editPost(parseInt(pid), await request.json());

	return json({ success: true });
};
