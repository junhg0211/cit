<script lang="ts">
	import Feed from '$lib/Feed.svelte';
	import Cookie from 'js-cookie';

	const { data } = $props();
	const { user, posts, me } = $derived(data);

	async function editProfile() {
		const email = prompt('새 이메일을 입력하세요', user.email ?? '');

		if (email === null) {
			return;
		}

		const bio = prompt('새 소개글을 입력하세요', user.bio ?? '');

		if (bio === null) {
			return;
		}

		const token = Cookie.get('token');

		await fetch(`/api/v1/users/${user.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({ email, bio })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					location.reload();
				} else {
					alert('프로필 업데이트에 실패했습니다. ' + data.message);
				}
			})
			.catch((err) => {
				console.error(err);
				alert('프로필 업데이트 중 오류가 발생했습니다. ' + err.message);
			});
	}
</script>

<div class="profile">
	<div class="username">{user.username}</div>
	{#if user.email}
		<div class="email">{user.email}</div>
	{/if}
	{#if user.bio}
		<div class="bio">{user.bio}</div>
	{/if}
	<div class="created-at">{new Date(user.created_at).toLocaleDateString()} 가입</div>
	<div class="profile-actions">
		{#if me?.id === user.id}
			<button onclick={editProfile}>프로필 수정</button>
		{/if}
	</div>
</div>
<hr />
<Feed {posts} />

<style>
	.username {
		font-size: 24px;
		font-weight: bold;
	}

	.email {
		color: #555;
	}

	.bio {
		font-style: italic;
	}

	.created-at {
		color: #888;
		font-size: 10px;
	}

	.profile-actions {
		margin-top: 10px;
	}

	.profile-actions button {
		border: none;
		padding: 0;
		color: var(--primary-color);
		cursor: pointer;
	}
</style>
