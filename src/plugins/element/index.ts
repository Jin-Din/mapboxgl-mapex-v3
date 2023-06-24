// import Vue from "vue";
// import { Input, Autocomplete, Card, Tooltip } from "element-plus";
// import "element-plus/lib/theme-chalk/index.css";
//
// Vue.use(Input);
// Vue.use(Autocomplete);
// Vue.use(Card);
// Vue.use(Tooltip);

// 以下为全量加载
// 按需加载参见vite.config.js 中配置

import ElementPlus from "element-plus";
// import { Input, Autocomplete, Card, Tooltip } from "element-plus";
import "element-plus/theme-chalk/index.css";
import "./dark.css"; //自定义样式
import zhCn from "element-plus/dist/locale/zh-cn"; //本地化
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { App } from "vue";

export default (app: App) => {
  // vite.config.ts 已配置ElementPlus 自动导入，此处删除
  // 全局注册
  // app.use(ElementPlus, { locale: zhCn });
  //icon 全局注册
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
  }
};
