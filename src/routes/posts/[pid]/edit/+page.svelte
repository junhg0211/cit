<script lang="ts">
	import Edit from '$lib/Edit.svelte';
	import Cookies from 'js-cookie';

	let { data } = $props();
	let post = $state(data.post);

	async function put() {
		const token = Cookies.get('token');

		await fetch(`/api/v1/posts/${post.id}`, {
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(post)
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.href = `/posts/${post.id}`;
				} else {
					alert('포스트 수정에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('포스트 수정에 오류가 발생했습니다. ' + err.message);
			});
	}
</script>

<Edit
	bind:title={post.title}
	bind:coauthor={post.coauthor}
	bind:content={post.content}
	onclick={put}
/>
