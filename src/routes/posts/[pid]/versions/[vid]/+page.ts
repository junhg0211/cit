import type { Load } from '@sveltejs/kit';

export const load: Load = async ({ params }) => {
	const { vid } = params;

	if (!vid || isNaN(parseInt(vid))) {
		throw new Error('Invalid video ID');
	}

	return { vid: parseInt(vid) };
};
