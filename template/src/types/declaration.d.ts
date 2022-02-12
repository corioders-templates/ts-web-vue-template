// webpack env variables
declare const __IS_PRODUCTION__: boolean;

// vue module
declare module '*.vue' {
	import { Component } from 'vue';
	const component: Component;
	export default component;
}
