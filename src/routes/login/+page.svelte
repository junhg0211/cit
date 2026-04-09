<script lang="ts">
	import Cookies from 'js-cookie';

	let username = $state('');
	let password = $state('');

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			login();
		}
	}

	async function login() {
		await fetch('/api/v1/auth/sessions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.token) {
					localStorage.setItem('token', data.token);
					Cookies.set('token', data.token, { expires: 7 });
					window.location.href = '/';
				} else {
					alert('로그인 실패: ' + (data.message || '알 수 없는 오류'));
				}
			})
			.catch((error) => {
				alert('로그인 중 오류 발생:', error.message);
			});
	}
</script>

<div class="form-group">
	<label for="username">사용자명</label>
	<input
		bind:value={username}
		{onkeydown}
		type="text"
		class="form-control"
		id="username"
		placeholder="사용자명을 입력하세요"
	/>
</div>
<div class="form-group">
	<label for="password">비밀번호</label>
	<input
		bind:value={password}
		{onkeydown}
		type="password"
		class="form-control"
		id="password"
		placeholder="비밀번호를 입력하세요"
	/>
</div>
<div class="form-group">
	<button class="btn btn-primary" onclick={login}>로그인</button>
</div>

<style>
	.form-group {
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
</style>
