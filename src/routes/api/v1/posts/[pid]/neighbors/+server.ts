import { json, type RequestHandler } from '@sveltejs/kit';
import { getNeighborPosts } from '$lib/posts';

export const GET: RequestHandler = async ({ params }) => {
	const { pid } = params;

	if (!pid) {
		return json({ success: false, message: '포스트 ID가 필요합니다.' }, { status: 400 });
	}

	const neighborPosts = await getNeighborPosts(parseInt(pid));

	return json({ success: true, neighbors: neighborPosts });
};
