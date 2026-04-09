import { getSuccessors } from '$lib/posts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	let { pid } = params;

	if (!pid || isNaN(Number(pid))) {
		return json({ success: false, error: '포스트 ID가 유효하지 않습니다.' }, { status: 400 });
	}

	const successors = await getSuccessors(parseInt(pid));

	return json({ success: true, successors });
};
