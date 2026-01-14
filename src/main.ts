import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import router from "./router";
import "element-plus/dist/index.css";
import "element-plus/theme-chalk/dark/css-vars.css";
// import "./useWorker";

const app = createApp(App);
app.use(router);

app.mount("#app");
