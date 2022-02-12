import { Component } from 'vue';
import { RouteRecordRaw, createRouter, createWebHashHistory } from 'vue-router';

import Home from '@/routes/Home.vue';

export const routes: RouteRecordRaw[] = [
	{
		path: '/',
		name: 'Home',
		component: Home,
	},
	{
		path: '/async',
		name: 'AsyncComponent',
		component: (): Promise<Component> => import('@/routes/AsyncComponent.vue'),
	},

	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
];

const router = createRouter({
	routes,
	history: createWebHashHistory(),
});

export default router;
