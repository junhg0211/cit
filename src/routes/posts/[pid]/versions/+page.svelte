<script lang="ts">
	const { data } = $props();
	const { post } = $derived(data);
</script>

<div><a href={`/posts/${post.id}`}>{post.title}</a>의 역사</div>
<ul>
	{#each post.versions as version}
		<li>
			<a href={`/posts/${post.id}/versions/${version.version_number}`}
				>v{version.version_number} ({new Date(version.created_at).toLocaleString()})</a
			>
		</li>
	{/each}
</ul>
