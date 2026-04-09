<script lang="ts">
	import Cookie from 'js-cookie';
	const { comments, me } = $props();
	import { tick } from 'svelte';

	function removeComment(id: number) {
		return async () => {
			if (!confirm('댓글을 삭제하시겠습니까?')) {
				return;
			}

			const token = Cookie.get('token');

			await fetch(`/api/v1/comments/${id}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`
				}
			})
				.then((res) => res.json())
				.then((data) => {
					if (data.success) {
						location.reload();
					} else {
						alert('댓글 삭제에 실패했습니다. ' + data.message);
					}
				})
				.catch((err) => {
					alert('댓글 삭제에 실패했습니다. ' + err.message);
				});
		};
	}

	let { editingCommentId } = $state({
		editingCommentId: null
	});

	function editComment(id: number) {
		return async () => {
			const comment = comments.find((c) => c.id === id);
			editingCommentId = id;

			await tick();

			const commentInput = document.getElementById(`comment-input-${id}`)! as HTMLTextAreaElement;
			commentInput.value = comment.content;
		};
	}

	async function confirmEditComment() {
		const token = Cookie.get('token');

		const commentInput = document.getElementById(
			`comment-input-${editingCommentId}`
		)! as HTMLTextAreaElement;
		const content = commentInput.value.trim();

		if (!content) {
			alert('댓글 내용을 입력해주세요.');
			return;
		}

		await fetch(`/api/v1/comments/${editingCommentId}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ content })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('댓글 수정에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				alert('댓글 수정에 실패했습니다. ' + err.message);
			});
	}
</script>

<div class="container">
	<div class="title">댓글</div>
	<div class="comments">
		{#each comments as comment}
			{#if comment.content}
				<div class="comment">
					<div class="comment-header">
						<span class="comment-user">{comment.user.username}</span>
						<span class="comment-date">
							<span class="actions">
								{#if me && me.id === comment.user.id}
									<button onclick={editComment(comment.id)}>수정</button>
									<button onclick={removeComment(comment.id)}>삭제</button>
								{/if}
							</span>
							<span class="created-at"
								>{new Date(comment.created_at).toLocaleString()}
								{#if comment.created_at !== comment.updated_at}
									(수정: {new Date(comment.updated_at).toLocaleString()})
								{/if}
							</span>
						</span>
					</div>
					{#if editingCommentId !== comment.id}
						<div class="comment-content">{comment.content}</div>
					{:else}
						<div class="comment-input-container">
							<textarea class="comment-input" id={`comment-input-${comment.id}`}></textarea>
							<button onclick={confirmEditComment()}>작성</button>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.title {
		font-size: 18px;
		font-weight: bold;
	}

	.container {
		margin-top: 24px;
	}

	.comments {
		margin-top: 8px;
	}

	.comment {
		margin-bottom: 8px;
	}

	.comment-header {
		display: flex;
		justify-content: space-between;
		margin-bottom: 4px;
		font-size: 12px;
		color: #555;
	}

	.comment-user {
		font-weight: bold;
	}

	.comment-date {
		font-style: italic;
	}

	.comment-content {
		font-size: 14px;
	}

	.actions button {
		background: none;
		border: none;
		color: var(--primary-color);
		cursor: pointer;
		padding: 0;
		font-size: 12px;
	}

	.comment-input {
		width: 100%;
		height: 96px;
		border: 1px solid #ccc;
		padding: 10px;
		box-sizing: border-box;
	}
</style>
