export const load = async ({ fetch }) => {
	const { posts } = await fetch('/api/v1/feed/latest').then((res: any) => res.json());

	return { posts };
};
