<script lang="ts">
	import { markdownToHtml } from '$lib/markdown';
	import Cookies from 'js-cookie';
	import Post from '$lib/Post.svelte';
	import Successors from '$lib/Successors.svelte';
	import Comments from '$lib/Comments.svelte';

	const { data } = $props();
	const { post, me, successors, comments, neighbors } = $derived(data);

	let { commentContent } = $state({
		commentContent: ''
	});

	async function writeComment() {
		if (!commentContent.trim()) {
			return;
		}

		const token = Cookies.get('token');

		await fetch(`/api/v1/posts/${post.id}/comments`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ content: commentContent })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					window.location.reload();
				} else {
					alert('댓글 작성에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('댓글 작성 중 오류가 발생했습니다. ' + err.message);
			});
	}
</script>

{#key post.id}
	<Post {post} {me} />
	<Successors {successors} />
	<Comments {comments} {me} />
	<div class="comment-input-container">
		<textarea class="comment-input" bind:value={commentContent}></textarea>
		<button onclick={writeComment}>작성</button>
	</div>
	<div class="neighbors">
		<div class="neighbor">
			{#if neighbors.previous}
				<a href={`/posts/${neighbors.previous.id}`}>이전 글: {neighbors.previous.title}</a>
			{/if}
		</div>
		<div class="neighbor">
			{#if neighbors.next}
				<a href={`/posts/${neighbors.next.id}`}>다음 글: {neighbors.next.title}</a>
			{/if}
		</div>
	</div>
{/key}

<style>
	.comment-input {
		width: 100%;
		height: 96px;
		border: 1px solid #ccc;
		padding: 10px;
		box-sizing: border-box;
	}

	.comment-input-container {
		margin-top: 20px;
	}

	.neighbors {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
	}
</style>
