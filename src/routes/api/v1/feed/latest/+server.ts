import { getRecentFeed } from '$lib/feed';
import { json, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');

	if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
		return json(
			{ success: false, message: '페이지 혹은 한 페이지당 항목 수는 양수여야 합니다.' },
			{ status: 400 }
		);
	}

	if (limit > 100) {
		return json(
			{ success: false, message: '한 페이지당 항목 수는 최대 100개로 제한됩니다.' },
			{ status: 400 }
		);
	}

	const posts = await getRecentFeed(page, limit);

	return json({ success: true, posts });
};
