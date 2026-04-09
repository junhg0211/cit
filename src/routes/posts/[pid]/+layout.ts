import type { ServerLoad } from '@sveltejs/kit';
import { title, description } from '$lib/stores';

export const load: ServerLoad = async ({ params, fetch }) => {
	const { pid } = params;

	const { post } = await fetch(`/api/v1/posts/${pid}`).then((res: any) => res.json());
	const { successors } = await fetch(`/api/v1/posts/${pid}/successors`).then((res: any) =>
		res.json()
	);
	const { comments } = await fetch(`/api/v1/posts/${pid}/comments`).then((res: any) => res.json());
	const { neighbors } = await fetch(`/api/v1/posts/${pid}/neighbors`).then((res: any) =>
		res.json()
	);

	title.set(`${post.title} - Cit`);

	const desc =
		post.content.length > 50
			? post.content.substring(0, 50).replace(/\n/g, ' ') + '...'
			: post.content.replace(/\n/g, ' ');
	description.set(desc);

	return { post, successors, comments, neighbors };
};
