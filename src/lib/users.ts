import { query } from './db';
import { POST_QUERY, type Post } from './posts';

export type User = {
	id: number;
	username: string;
	email: string;
	bio: string;
	created_at: string;
};

export const USER_QUERY = 'SELECT id, username, email, bio, created_at FROM users';

export async function getUserByUsername(username: string): Promise<User | undefined> {
	const [user] = await query(`${USER_QUERY} WHERE username = ?`, [username]);

	return user;
}

export async function getUserById(userId: number): Promise<User | undefined> {
	const [user] = await query(`${USER_QUERY} WHERE id = ?`, [userId]);
	return user;
}

export async function updateUserProfile(
	userId: number,
	data: {
		email?: string;
		bio?: string;
	}
): Promise<void> {
	const changes = [];

	if (data.email) {
		changes.push(['email = ?', data.email]);
	}

	if (data.bio) {
		changes.push(['bio = ?', data.bio]);
	}

	if (changes.length === 0) {
		return;
	}

	const setClause = changes.map(([clause]) => clause).join(', ');
	const values = changes.map(([, value]) => value);

	await query(`UPDATE users SET ${setClause} WHERE id = ?`, [...values, userId]);
}

export async function getPostsByUsername(username: string): Promise<Post[]> {
	return await query(
		`${POST_QUERY} WHERE pa.user_id = (SELECT id FROM users WHERE username = ?) GROUP BY p.id ORDER BY p.created_at DESC`,
		[username]
	);
}
