<script lang="ts">
	import { markdownToHtml } from '$lib/markdown';
	import 'bootstrap-icons/font/bootstrap-icons.css';

	let { post, me, vid } = $props();
	if (vid === undefined) {
		vid = post.version_number;
	}

	const content = $derived(post.versions.find((v) => v.version_number === vid).content);
</script>

{#if post.anchor}
	<div class="anchor-info">
		<i class="bi bi-reply"></i>
		<a href={`/posts/${post.anchor.id}/versions/${post.anchor.version_number}`}
			>{post.anchor.title} (v{post.anchor.version_number})</a
		>
	</div>
{/if}
<div class="title">
	<span>{post.title}</span>
	{#if post.version_number !== vid}
		<span>(v{vid})</span>
	{/if}
</div>
<div class="authors">
	{#each post.author_ids as author}
		<span class="author"><a href={`/users/${author}`}>{author}</a></span>
	{/each}
</div>
<div class="content">{@html markdownToHtml(content)}</div>
<div class="content-footer">
	{#if post?.author_ids.indexOf(me?.username) !== -1}
		<div class="footer-link">
			<a href={`/posts/${post.id}/edit`}>수정</a>
		</div>
		<div class="footer-link">
			<a href={`/new?anchor=${post.id}&anchor_version=${vid}`}>답글</a>
		</div>
	{/if}
	<div class="footer-link">
		<a href={`/posts/${post.id}/versions`}>역사</a>
	</div>
</div>

<style>
	.anchor-info {
		margin-bottom: 12px;
		font-size: 10px;
	}

	.title {
		font-size: 1.5em;
		font-weight: bold;
		margin-bottom: 0.5em;
	}

	.authors {
		font-size: 0.9em;
		color: #555;
		margin-bottom: 1em;
	}

	.author:not(:last-child):after {
		content: ', ';
	}

	.content {
		font-size: 1em;
		line-height: 1.5;
		border-bottom: 1px solid #ddd;
		border-top: 1px solid #ddd;
	}

	.content-footer {
		font-size: 12px;
		margin-top: 1em;
		text-align: right;
		display: flex;
		justify-content: flex-end;
		gap: 12px;
	}
</style>
