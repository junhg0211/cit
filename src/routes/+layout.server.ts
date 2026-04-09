import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ cookies, fetch }) => {
	const token = cookies.get('token');

	let me: any;
	let notifications: any[] = [];
	if (token) {
		let res: any;

		res = await fetch('/api/v1/me', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res: any) => res.json());
		me = res.me;

		res = await fetch('/api/v1/notifications', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		}).then((res: any) => res.json());
		notifications = res.notifications;
	}

	return { me, notifications };
};
