/*
 * @Descripttion:
 * @version:
 * @Date: 2022-06-23 16:44:21
 * @LastEditors:
 * @LastEditTime: 2022-06-23 16:49:34
 */
import axios from "axios";
// import { ElMessage } from "element-plus";
// import "element-plus/theme-chalk/index.css";

const name = "admin-token";

axios.defaults.baseURL = import.meta.env.BASE_URL;
axios.defaults.timeout = 20000; //20秒超时
axios.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";

//获取cookie
const getCookie = function (name: string) {
  //获取当前所有cookie
  let strCookies = document.cookie;
  //截取变成cookie数组
  let array = strCookies.split(";");
  //循环每个cookie
  for (let i = 0; i < array.length; i++) {
    //将cookie截取成两部分
    let item = array[i].split("=");
    //判断cookie的name 是否相等
    if (item[0] == name) {
      return item[1];
    }
  }
  return null;
};

// 请求拦截器
axios.interceptors.request.use(
  (config) => {
    // // 在请求发送之前做一些处理
    // const token = getCookie(name);
    // // 让每个请求携带token-- ['X-Token']为自定义key 请根据实际情况自行修改
    // // config.headers['X-Token'] = token;
    // let url = config.url;
    // let flag = url.indexOf("YouMapServer");
    // if (token && flag == -1) {
    //   config.headers["authorization"] = token;
    // }
    return config;
  },
  (error) => {
    // 发送失败
    // console.log(error);
    Promise.reject(error);
  }
);

// 响应拦截
axios.interceptors.response.use(
  (response) => {
    //响应拦截
    return response;
  },
  (error) => {
    // ElMessage.error({
    //   message: "返回失败!",
    //   duration: 2000,
    // });
    return Promise.reject(error);
  }
);

export default () => {};
