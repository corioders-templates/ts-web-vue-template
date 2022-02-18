<template>
	<div id="app">
		<VFlex>
			<router-view />
		</VFlex>
	</div>
</template>

<script lang="ts">
import { VFlex } from '@corioders/vueui';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'App',
	components: {
		VFlex,
	},
});
</script>
<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap');

#app {
	font-family: 'Open Sans', sans-serif;
	font-weight: 400;
}
</style>
