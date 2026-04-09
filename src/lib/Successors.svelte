<script lang="ts">
	const { successors } = $props();
</script>

<div class="section">
	<div class="section-title">답글</div>
	{#if successors.length === 0}
		<div>답글이 없습니다.</div>
	{:else}
		<div class="successors">
			{#each successors as successor}
				<div class="successor-row">
					<div class="successor-title">
						<a href={`/posts/${successor.id}`}>
							{successor.title}
						</a>
						<span class="small">
							<a href={`/posts/${successor.anchor.id}/versions/${successor.anchor.version_number}`}>
								v{successor.anchor.version_number}
							</a>에서 답함
						</span>
					</div>
					<div class="successor-authors">{successor.author_ids.join(', ')}</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.section {
		margin-top: 24px;
	}

	.section-title {
		font-size: 18px;
		font-weight: bold;
		margin-bottom: 12px;
	}

	.successors {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.successor-row {
		display: flex;
		border-radius: 4px;
		justify-content: space-between;
		vertical-align: middle;
		border-bottom: 1px solid #eee;
		padding: 8px 0;
	}

	.small {
		font-size: 9px;
	}
</style>
