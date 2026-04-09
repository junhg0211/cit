<script lang="ts">
	import 'bootstrap-icons/font/bootstrap-icons.css';

	let { posts } = $props();
</script>

<div class="feed">
	{#each posts as post}
		<a href={`/posts/${post.id}`}>
			<div class="post">
				{#if post.anchor}
					<div class="post-anchor">
						<i class="bi bi-reply"></i>
						<span>{post.anchor.title}</span>
					</div>
				{/if}
				<div class="post-content">
					<span class="post-title">{post.title}</span>
					{#if post.comment_count > 0}
						<span class="badge">{post.comment_count}</span>
					{/if}
				</div>
				<div class="post-created-at">
					{post.author_ids.join(', ')} --
					{new Date(post.versions[0].created_at).toLocaleString()}
				</div>
			</div>
		</a>
	{/each}
</div>

<style>
	.post {
		padding: 12px;
		border-bottom: 1px solid #eee;
	}

	.post-anchor {
		font-size: 10px;
		margin-bottom: 4px;
	}

	.post-content {
		font-size: 14px;
		font-weight: bold;
	}

	.badge {
		background-color: var(--primary-color);
		color: white;
		padding: 1px 3px;
		border-radius: 4px;
		font-size: 10px;
	}

	.post-created-at {
		margin-top: 2px;
		color: #888;
		font-size: 10px;
	}
</style>
