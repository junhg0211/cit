<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { title } from '$lib/stores';

	const { children, data } = $props();
	const { me, notifications } = $derived(data);

	let unreadCount = notifications ? notifications.filter((n) => !n.is_read).length : 0;

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			const target = event.target as HTMLInputElement;
			const query = target.value.trim();
			if (query) {
				window.location.href = `/search?q=${encodeURIComponent(query)}`;
			}
		}
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link
		rel="stylesheet"
		as="style"
		crossorigin
		href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
	/>
	<style>
		body {
			margin: 0;
			--font-family:
				'Pretendard JP', 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, Roboto,
				'Helvetica Neue', 'Segoe UI', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
				sans-serif;
			font-family: var(--font-family);
			font-size: 14px;

			--primary-color: #6e8f39;
		}

		a {
			color: var(--primary-color);
			text-decoration: none;
		}

		a:hover {
			text-decoration: underline;
		}

		input {
			padding: 6px;
			border: 1px solid #ccc;
			border-radius: 4px;
			font-family: var(--font-family);
		}

		textarea {
			font-family: var(--font-family);
		}

		button {
			padding: 6px 12px;
			border: none;
			border-radius: 4px;
			background-color: white;
			cursor: pointer;
			border: 0.5px solid black;
		}

		button:hover {
			background-color: #f0f0f0;
		}

		button:active {
			background-color: #e0e0e0;
		}

		blockquote {
			border-left: 4px solid #ccc;
			padding-left: 12px;
			color: #666;
			margin-left: 0;
		}

		table {
			border-collapse: collapse;
		}

		td,
		th {
			/* border: 0.5px solid black; */
			padding: 0 6px;
		}
	</style>
	<title>{$title}</title>
</svelte:head>

<div class="container">
	<div class="header">
		<div class="header-left">
			<div class="title"><a href="/">Cit</a></div>
		</div>
		<div class="header-right">
			<input placeholder="검색" class="search-box" {onkeydown} />
			{#if me}
				<div>
					<a href="/notifications">
						알림
						{#if unreadCount > 0}<span class="unread-count">{unreadCount}</span>{/if}
					</a>
				</div>
				<div><a href="/new">작성</a></div>
				<div><a href={`/users/${me.username}`}>프로필</a></div>
				<div><a href="/logout">로그아웃</a></div>
			{:else}
				<div><a href="/register">회원가입</a></div>
				<div><a href="/login">로그인</a></div>
			{/if}
		</div>
	</div>
	{@render children()}
	<div class="footer">Cit</div>
</div>

<style>
	.header {
		margin-bottom: 12px;
		display: flex;
		justify-content: space-between;
		vertical-align: middle;
	}

	.header-right {
		display: flex;
		align-items: center;
		font-size: 10px;
		gap: 8px;
	}

	.title {
		font-size: 18px;
		font-weight: bold;
	}

	.search-box {
		font-size: 10px;
	}

	.unread-count {
		background-color: var(--primary-color);
		padding: 2px 4px;
		border-radius: 8px;
		color: white;
		font-size: 9px;
	}

	.container {
		padding: 12px;
		max-width: 960px;
		margin: 0 auto;
	}

	.footer {
		text-align: right;
		margin-top: 12px;
		font-size: 10px;
	}
</style>
