<script lang="ts">
	import Feed from '$lib/Feed.svelte';

	const { data } = $props();
	const { posts } = $derived(data);
</script>

<Feed {posts} />
