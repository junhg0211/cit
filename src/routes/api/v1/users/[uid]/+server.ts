import { checkToken } from '$lib/auth';
import { getUserById, updateUserProfile } from '$lib/users';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	const { uid } = params;

	if (!uid) {
		return json({ success: false, message: '사용자 아이디를 입력해주세요.' }, { status: 400 });
	}

	const user = await getUserById(parseInt(uid));

	if (!user) {
		return json({ success: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
	}

	return json({ success: true, user });
};

export const PUT: RequestHandler = async ({ params, request }) => {
	const { uid } = params;

	if (!uid) {
		return json({ success: false, message: '사용자 아이디를 입력해주세요.' }, { status: 400 });
	}

	const user = await getUserById(parseInt(uid));

	if (!user) {
		return json({ success: false, message: '사용자를 찾을 수 없습니다.' }, { status: 404 });
	}

	const token = request.headers.get('Authorization')?.replace('Bearer ', '');

	if (!token) {
		return json({ success: false, message: '인증 토큰이 필요합니다.' }, { status: 401 });
	}

	const tokenUserId = await checkToken(token);

	if (tokenUserId !== user.id) {
		return json(
			{ success: false, message: '인증된 사용자와 요청된 사용자가 일치하지 않습니다.' },
			{ status: 403 }
		);
	}

	await updateUserProfile(user.id, await request.json());

	return json({ success: true, message: '사용자 정보가 업데이트되었습니다.' });
};
