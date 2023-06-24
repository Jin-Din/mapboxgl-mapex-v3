/**
 * /全局挂载和获取
 * //@作者: Jin
 */
import { ComponentInternalInstance, getCurrentInstance } from "vue";

export const useCurrentInstance = () => {
  const { appContext } = getCurrentInstance() as ComponentInternalInstance;
  return appContext.config.globalProperties;
};
