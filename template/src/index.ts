import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import router from './router';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia).use(router);
app.mount('#root');

if (module.hot) {
	module.hot.dispose(() => {
		app.unmount();
		console.clear();
	});
	module.hot.accept();
}
