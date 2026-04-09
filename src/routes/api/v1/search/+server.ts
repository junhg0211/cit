import { search } from '$lib/posts';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const q = url.searchParams.get('q') || '';

	if (!q) {
		return json({ success: false, error: '검색어를 입력해주세요.' }, { status: 400 });
	}

	const posts = await search(q);

	return json({ success: true, posts });
};
