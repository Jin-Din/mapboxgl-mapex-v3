import { App } from "vue";

import element from "./element/index";

import http from "./http/index";

const plugins = [http, element];

export default (app: App) => {
  plugins.map((plugin) => plugin(app));
};
