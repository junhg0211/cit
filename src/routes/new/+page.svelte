<script lang="ts">
	import Edit from '$lib/Edit.svelte';
	import Cookie from 'js-cookie';

	const { data } = $props();
	const { anchorPost, anchor, anchor_version } = $derived(data);

	let { title, content, coauthor } = $state({
		title: '',
		content: '',
		coauthor: ''
	});

	async function post() {
		await fetch('/api/v1/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${Cookie.get('token')}`
			},
			body: JSON.stringify({ title, content, coauthor, anchor, anchor_version })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.href = `/`;
				} else {
					alert('게시물 저장에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('게시물 저장 중 오류가 발생했습니다. ' + err.message);
			});
	}
</script>

{#if anchorPost}
	<div class="anchor-info">
		<a href={`/posts/${anchor}/versions/${anchor_version}`} target="_blank">
			"{anchorPost.title}" (v{anchor_version})
		</a>에 대한 답글입니다.
	</div>
{/if}
<Edit onclick={post} bind:title bind:content bind:coauthor />

<style>
	.anchor-info {
		margin-bottom: 12px;
		font-size: 10px;
	}
</style>
