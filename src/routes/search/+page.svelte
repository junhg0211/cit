<script lang="ts">
	import Feed from '$lib/Feed.svelte';

	const { data } = $props();
	const { posts, q } = $derived(data);
</script>

<div><span class="query">{q}</span>에 대한 검색 결과</div>
<Feed {posts} />

<style>
	.query {
		font-weight: bold;
	}
</style>
