<script lang="ts">
	import { markdownToHtml } from '$lib/markdown';
	import Cookie from 'js-cookie';

	let { onclick, title = $bindable(), coauthor = $bindable(), content = $bindable() } = $props();

	if (!title) title = '';
	if (!coauthor) coauthor = '';
	if (!content) content = '';
</script>

<input type="text" bind:value={title} placeholder="제목을 입력하세요." class="title" />
<input type="text" bind:value={coauthor} placeholder="공동 저자만 입력하세요" class="coauthor" />
<div class="content-container">
	<div class="pane">
		<textarea
			bind:value={content}
			class="raw-content"
			placeholder="마크다운 문법으로 내용을 입력하세요."
		></textarea>
	</div>
	<div class="pane">{@html markdownToHtml(content)}</div>
</div>
<button {onclick}>저장</button>

<style>
	.title {
		width: 100%;
		font-size: 1.5em;
		font-weight: bold;
		border: none;
		border-bottom: 1px solid #ccc;
		border-radius: 0;
		transition: border-bottom 0.3s ease;
		margin-bottom: 8px;
	}

	.title:focus {
		border-bottom: 2px solid black;
		outline: none;
	}

	.coauthor {
		width: 100%;
		border: none;
		border-bottom: 1px solid #ccc;
		border-radius: 0;
		transition: border-bottom 0.3s ease;
		margin-bottom: 20px;
	}

	.coauthor:focus {
		border-bottom: 2px solid black;
		outline: none;
	}

	.content-container {
		display: flex;
	}

	.raw-content {
		width: 100%;
		height: 100%;
		overflow-x: visible;
		box-sizing: border-box;
		border: 0;
		resize: block;
		outline: none;
		min-height: 100px;
		font-family: monospace;
		font-size: 12px;
	}

	.pane {
		flex: 1;
		font-size: 12px;
		max-width: 50%;
	}
</style>
