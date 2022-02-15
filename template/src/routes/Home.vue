<template>
	<h1>Welcome home!</h1>
	<VButton @click="$router.push('/async')">To AsyncComponent!</VButton>
</template>

<script lang="ts">
import { VButton } from '@corioders/vueui';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'Home',
	components: {
		VButton,
	},
});
</script>
