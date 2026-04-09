import { query } from './db';
import { sendNotification } from './notifications';
import { getPost } from './posts';
import { getUserById, getUserByUsername } from './users';

async function getCommentOwner(commentId: number): Promise<number> {
	const result = await query('SELECT user_id FROM comments WHERE id = ?', [commentId]);
	return result[0]?.user_id;
}

export async function postComment(
	postId: number,
	userId: number,
	content: string,
	parentCommentId?: number
): Promise<void> {
	if (parentCommentId) {
		await query(
			'INSERT INTO comments (post_id, user_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
			[postId, userId, content, parentCommentId]
		);

		const parentCommentOwnerId = await getCommentOwner(parentCommentId);
		if (parentCommentOwnerId !== userId) {
			const commenterUser = await getUserById(userId);
			await sendNotification(
				parentCommentOwnerId,
				`${commenterUser!.username}님이 당신의 댓글에 답글을 남겼습니다. "${content}"`,
				`/posts/${postId}#comment-${parentCommentId}`
			);
		}
	} else {
		await query('INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)', [
			postId,
			userId,
			content
		]);

		const post = await getPost(postId);
		const commenterUser = await getUserById(userId);
		if (!post.author_ids.includes(commenterUser!.username)) {
			for (const authorId of post.author_ids) {
				const authorUser = await getUserByUsername(authorId);
				await sendNotification(
					authorUser!.id,
					`${commenterUser!.username}님이 당신의 게시물에 댓글을 남겼습니다. "${content}"`,
					`/posts/${postId}`
				);
			}
		}
	}
}

type Comment = {
	id: number;
	post_id: number;
	user: {
		id: number;
		username: string;
	};
	parent_comment_id: number | null;
	content: string;
	created_at: string;
	updated_at: string;
};

export const COMMENT_QUERY = `
  SELECT
    c.id,
    c.post_id,
    (
      SELECT JSON_OBJECT('id', u.id, 'username', u.username)
      FROM users u
      WHERE u.id = c.user_id
    ) AS user,
    c.parent_comment_id,
    c.content,
    c.created_at,
    c.updated_at
  FROM comments c
  JOIN users u ON c.user_id = u.id
`;

export async function getComments(postId: number): Promise<Comment[]> {
	const comments = await query(`${COMMENT_QUERY} WHERE c.post_id = ? ORDER BY c.created_at ASC`, [
		postId
	]);
	return comments;
}

export async function getComment(commentId: number): Promise<Comment | null> {
	const comments = await query(`${COMMENT_QUERY} WHERE c.id = ?`, [commentId]);
	return comments.length > 0 ? comments[0] : null;
}

export async function updateComment(commentId: number, content?: string): Promise<void> {
	await query('UPDATE comments SET content = ? WHERE id = ?', [content, commentId]);
}
