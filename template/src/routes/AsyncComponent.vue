<template>
	<h1>Hello from AsyncComponent!</h1>
	<VButton @click="$router.push('/')">To Home!</VButton>
</template>

<script lang="ts">
import { VButton } from '@corioders/vueui';
import { defineComponent } from 'vue';

export default defineComponent({
	name: 'AsyncComponent',
	components: {
		VButton,
	},
});
</script>
