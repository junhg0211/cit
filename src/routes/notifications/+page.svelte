<script lang="ts">
	import { onMount } from 'svelte';
	import Cookies from 'js-cookie';

	const { data } = $props();
	let { notifications } = $derived(data);

	onMount(async () => {
		const token = Cookies.get('token');

		await fetch('/api/v1/notifications/readall', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			}
		});
	});
</script>

{#each notifications as notification}
	<div class="notification">
		<a href={notification.href}>{notification.content}</a>
	</div>
{/each}

<style>
	.notification {
		padding: 1rem;
		border-bottom: 1px solid #ccc;
	}

	.notification a {
		text-decoration: none;
		color: #333;
	}

	.notification a:hover {
		text-decoration: underline;
	}
</style>
