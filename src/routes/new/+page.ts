import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ url, fetch }) => {
	const anchor = parseInt(url.searchParams.get('anchor') || '');
	const anchor_version = parseInt(url.searchParams.get('anchor_version') || '');

	const anchorPost = await fetch(`/api/v1/posts/${anchor}`)
		.then((res: any) => res.json())
		.then((data) => data.post);

	return { anchor, anchor_version, anchorPost };
};
