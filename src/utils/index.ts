//图片路径转换，代替require
/**
 * 动态引入public目录下的图片。可用于 <img :src='图片地址'/> 这种方式
 * @param path 图片地址，如果是production环境，会在地址前加入import.meta.env.BASE_URL
 * @returns {*|string} 返回地址
 */
export const getImageUrl = (path: string, prefix?: string): any | string => {
  if (import.meta.env.PROD) {
    //正式环境，地址加入前缀
    //判断是否是json且以'/' 开头，则去掉 '/'  --- 记得下次验证一下
    // path = `${import.meta.env.BASE_URL}${path.endsWith(".json") && path.startsWith("/") ? path.slice(path.indexOf("/") + 1) : path}`;
  }
  path = !!prefix ? `${prefix}${path}` : path;
  //判断是否以http https 开头
  if (isStartWithHttpOrHttps(path)) return new URL(path, import.meta.url).href;
  //
  path = `${import.meta.env.BASE_URL}${path.startsWith("/") ? path.slice(path.indexOf("/") + 1) : path}`;
  return new URL(path, import.meta.url).href;
};
export const getUrl = (path: string, prefix?: string): string => {
  if (import.meta.env.PROD) {
    //正式环境，地址加入前缀
    //判断是否是json且以'/' 开头，则去掉 '/'  --- 记得下次验证一下
    // path = `${import.meta.env.BASE_URL}${path.endsWith(".json") && path.startsWith("/") ? path.slice(path.indexOf("/") + 1) : path}`;
  }
  path = !!prefix ? `${prefix}${path}` : path;
  //判断是否以http https 开头
  if (isStartWithHttpOrHttps(path)) return new URL(path, import.meta.url).href;
  //
  path = `${import.meta.env.BASE_URL}${path.startsWith("/") ? path.slice(path.indexOf("/") + 1) : path}`;
  return new URL(path, import.meta.url).href;
};

const isStartWithHttpOrHttps = (url: string) => {
  let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  return reg.test(url);
};
export const formatPac = (pac: string): string => {
  return pac.replace(/(0+)\b/gi, ""); //去掉 后面 多个 0
};
/**
 *  替换字符串中 以中括号 ${...} 结构的内容
 * @param template
 * @param templateValues
 * @returns
 */
export const templateUrl = (template: string, templateValues: Record<string, any>) => {
  if (!templateValues) return template;
  //对templateValues进行解析，比如其内部也是模板化配置
  /**
   * {
    "dataIP": "10.61.128.135",
    "arcgisServer": "http://${dataIP}:6080/arcgis/rest/services",
    "videoServer": "http://${dataIP}/mars3d-data/videos"
  }
   * 
   */

  templateValues = templateUrl2(templateValues);

  let reg = /\$\{(.*?)\}/g;
  let realUrl = template.replace(reg, (item, key) => {
    // console.log(key, item);
    if (Object.keys(templateValues!).includes(key)) return templateValues![key];
    else return item;
    // return templateValues[key];
  });

  return realUrl;
};
export const templateUrl2 = (templateValues: Record<string, any>) => {
  if (!templateValues) return templateValues;
  let keys = Object.keys(templateValues!).map((key) => key);

  let template = keys.reduce((prev: Record<string, any>, key: string) => {
    let reg = "${" + key + "}";
    let str = JSON.stringify(prev);
    let replaceStr = str.replaceAll(reg, prev[key]);
    return JSON.parse(replaceStr);
  }, templateValues);
  return template;
};
