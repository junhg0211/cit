import { query } from './db';
import { sendNotification } from './notifications';
import { getUserByUsername } from './users';

export enum Visibility {
	PUBLIC = 'public',
	SUBSCRIBERS = 'subscribers',
	PRIVATE = 'private'
}

export async function createPost(
	userId: number,
	data: {
		title: string;
		content: string;
		coauthors?: string[];
		anchor: number;
		anchor_version: number;
	}
): Promise<any> {
	const anchorId =
		data.anchor && data.anchor_version
			? (
					await query('SELECT id FROM post_versions WHERE post_id = ? AND version_number = ?', [
						data.anchor,
						data.anchor_version
					])
				)[0]?.id
			: null;

	const post = await query('INSERT INTO posts (title, anchor, anchor_version) VALUES (?, ?, ?)', [
		data.title,
		data.anchor,
		anchorId
	]);
	const postId = post.insertId;

	await query('INSERT INTO post_authors (post_id, user_id) VALUES (?, ?)', [postId, userId]);

	await query('INSERT INTO post_versions (post_id, version_number, content) VALUES (?, ?, ?)', [
		postId,
		1,
		data.content
	]);

	data.coauthors?.forEach(async (username) => {
		const [user] = await query('SELECT id FROM users WHERE username = ?', [username]);
		if (user) {
			await query('INSERT INTO post_authors (post_id, user_id) VALUES (?, ?)', [postId, user.id]);
		}
	});

	if (data.anchor) {
		const post = await getPost(data.anchor);
		for (const authorUsername of post!.author_ids) {
			const user = await getUserByUsername(authorUsername);
			await sendNotification(
				user!.id,
				`${post!.title}에 새로운 답글이 작성되었습니다.`,
				`/posts/${postId}`
			);
		}
	}

	return post;
}

export async function editPost(postId: number, data: { content?: string }): Promise<any> {
	if (data.content) {
		return await query(
			'INSERT INTO post_versions (post_id, version_number, content) VALUES (?, (SELECT MAX(version_number) + 1 FROM post_versions WHERE post_id = ?), ?)',
			[postId, postId, data.content]
		);
	}
}

export type Version = {
	version_number: number;
	created_at: string;
};

export type Post = {
	id: number;
	title: string;
	content: string;
	version_number: number;
	anchor: {
		id: number;
		version_number: number;
		title: string;
	} | null;
	author_ids: string[]; // co-authors 포함
	versions: Version[];
};

export const POST_QUERY = `
  SELECT
    p.id,
    p.title,
    pv.content,
    pv.version_number,

    -- anchor
    (
      SELECT JSON_OBJECT('id', pr.id, 'version_number', prv.version_number, 'title', pr.title)
      FROM posts pr
      JOIN post_versions prv ON pr.id = prv.post_id
      WHERE pr.id = p.anchor AND prv.id = p.anchor_version
      LIMIT 1
    ) AS anchor,

    a.author_ids,
    v.versions,
    COUNT(DISTINCT c.id) AS comment_count

  FROM posts p

  JOIN post_versions pv ON p.id = pv.post_id AND pv.version_number = (
    SELECT MAX(version_number) FROM post_versions WHERE post_id = p.id
  )
  LEFT JOIN post_authors pa ON p.id = pa.post_id
  LEFT JOIN comments c ON c.post_id = p.id

  -- authors 집계
  LEFT JOIN (
    SELECT post_id, JSON_ARRAYAGG(u.username) AS author_ids
    FROM post_authors
    JOIN users u ON u.id = post_authors.user_id
    GROUP BY post_id
  ) a ON a.post_id = p.id

  -- versions 집계
  LEFT JOIN (
    SELECT
      post_id,
      created_at,
      JSON_ARRAYAGG(
        JSON_OBJECT('version_number', version_number, 'created_at', created_at, 'content', content)
      ) AS versions
    FROM post_versions
    GROUP BY post_id
    ORDER BY version_number DESC
  ) v ON v.post_id = p.id
`;

(BigInt.prototype as any).toJSON = () => {
	return Number(this);
};

export async function getPost(postId: number): Promise<Post | null> {
	const [post] = await query(
		`${POST_QUERY} WHERE p.id = ? AND pv.version_number = (SELECT MAX(version_number) FROM post_versions WHERE post_id = p.id)`,
		[postId]
	);

	return post.id ? post : null;
}

export async function getSuccessors(postId: number): Promise<Post[]> {
	const successors = await query(`${POST_QUERY} WHERE p.anchor = ? GROUP BY p.id`, [postId]);

	return successors;
}

export async function search(keyword: string): Promise<Post[]> {
	const posts = await query(
		`${POST_QUERY} WHERE p.title LIKE ? OR pv.content LIKE ? GROUP BY p.id`,
		[`%${keyword}%`, `%${keyword}%`]
	);
	return posts;
}

export async function getNeighborPosts(
	postId: number
): Promise<{ previous: Post | null; next: Post | null }> {
	const [previous, next] = await Promise.all([
		query(`${POST_QUERY} WHERE p.id < ? GROUP BY p.id ORDER BY p.id DESC`, [postId]),
		query(`${POST_QUERY} WHERE p.id > ? GROUP BY p.id ORDER BY p.id ASC`, [postId])
	]);

	console.log(previous);

	return {
		previous: previous[0]?.id ? previous[0] : null,
		next: next[0]?.id ? next[0] : null
	};
}
