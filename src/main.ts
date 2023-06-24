import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import plugins from "./plugins"; //相关插件

const app = createApp(App);

app.config.errorHandler = (err, vm, info) => {
  console.log("[全局异常]", err, vm, info);
};
plugins(app); //注册插件集
app.mount("#app");
