import { query } from './db';
import { POST_QUERY, type Post } from './posts';

export async function getRecentFeed(page: number, limit: number): Promise<Post[]> {
	const offset = (page - 1) * limit;

	return await query(`${POST_QUERY} GROUP BY p.id ORDER BY pv.created_at DESC LIMIT ? OFFSET ?`, [
		limit,
		offset
	]);
}
