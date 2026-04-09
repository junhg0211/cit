export const load = async ({ fetch, params }) => {
	const { username } = params;

	const { user } = await fetch(`/api/v1/users/username/${username}`).then((res: any) => res.json());
	const { posts } = await fetch(`/api/v1/users/${user.id}/posts`).then((res: any) => res.json());

	return { user, posts };
};
