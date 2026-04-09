<script lang="ts">
	import Cookies from 'js-cookie';

	Cookies.remove('token');
	location.href = '/';
</script>
