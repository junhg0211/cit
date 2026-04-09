export const load = async ({ fetch, url }) => {
	const q = url.searchParams.get('q') || '';
	const { posts } = await fetch(`/api/v1/search?q=${q}`).then((res: any) => res.json());

	return {
		posts,
		q
	};
};
