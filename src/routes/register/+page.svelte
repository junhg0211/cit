<script lang="ts">
	let { username, password, repassword } = $state({
		username: '',
		password: '',
		repassword: ''
	});

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			register();
		}
	}

	async function register() {
		if (password !== repassword) {
			alert('비밀번호가 일치하지 않습니다.');
			return;
		}

		await fetch('/api/v1/auth/accounts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ username, password })
		})
			.then((res) => res.json())
			.then((data) => {
				if (data.success) {
					window.location.href = '/login';
				} else {
					alert('회원가입 실패: ' + (data.message || '알 수 없는 오류'));
				}
			})
			.catch((error) => {
				alert('회원가입 중 오류 발생:', error.message);
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
	<div class="invalid-feedback" class:visible={!/^[0-9A-Za-z_]{3,20}$/.test(username)}>
		사용자명은 3–20자의 영문 대소문자, 숫자, 밑줄만 사용할 수 있습니다.
	</div>
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
	<label for="repassword">비밀번호 확인</label>
	<input
		bind:value={repassword}
		{onkeydown}
		type="password"
		class="form-control"
		id="repassword"
		placeholder="비밀번호를 한 번 더 입력하세요"
	/>
</div>
<div class="form-group">
	<button class="btn btn-primary" onclick={register}>회원가입</button>
</div>

<style>
	.form-group {
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.invalid-feedback {
		display: none;
		font-size: 10px;
	}

	.invalid-feedback.visible {
		display: block;
	}
</style>
