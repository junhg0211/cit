import { query } from './db';

export type Notification = {
	id: number;
	user_id: number;
	content: string;
	is_read: boolean;
	href: string;
	created_at: string;
};

export async function getNotifications(userId: number, limit: number = 20) {
	return await query(
		'SELECT id, user_id, content, is_read, href, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT ?',
		[userId, limit]
	);
}

export async function readAllNotifications(userId: number) {
	await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [userId]);
}

export async function sendNotification(userId: number, content: string, href: string) {
	await query('INSERT INTO notifications (user_id, content, href) VALUES (?, ?, ?)', [
		userId,
		content,
		href
	]);
}
