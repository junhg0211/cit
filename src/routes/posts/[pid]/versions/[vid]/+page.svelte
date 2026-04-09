<script lang="ts">
	import Post from '$lib/Post.svelte';
	import Successors from '$lib/Successors.svelte';
	import Comments from '$lib/Comments.svelte';

	const { data } = $props();
	const { post, me, vid, successors, comments } = $derived(data);
</script>

<div class="view-recent">
	지금은 문서의 v{vid}버전을 보고 있습니다. 최신 버전은
	<a href={`/posts/${post.id}`}>v{post.version_number}</a>입니다.
</div>
<Post {post} {me} {vid} />
<Successors {successors} />
<Comments {comments} />
<div>
	역사 보기에서는 댓글을 작성할 수 없습니다.
	<a href={`/posts/${post.id}`}>최신 버전</a>에서 댓글을 작성해주세요.
</div>

<style>
	.view-recent {
		margin-bottom: 12px;
		font-size: 10px;
	}
</style>
