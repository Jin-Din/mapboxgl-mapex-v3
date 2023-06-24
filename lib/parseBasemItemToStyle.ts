// TODO: 优化

// import { AnyLayer, Style } from "mapbox-gl";
// import { getInnerRasterBasemapItem, getInnerVectorBasemapItem } from "./defaultBaseMap";
// import { ISBaseMap, ISSubLayer,  } from "./createMap";

// /**
//  * 【很重要，代码要加强】解析 IBaseMap 到 Style | string，
//  * @param data
//  * @returns
//  */
// export const parseBasemItemToStyle = (vrBasemap: ISBaseMap): string | Style | undefined => {
//   if (vrBasemap.type === "vector") {
//     let vectorBaseMap = vrBasemap as ISVectorTileBaseMap;
//     return parseVectorBasemapToStyle(vectorBaseMap);
//   } else if (vrBasemap.type === "raster") {
//     let rasterBaseMap: ISRasterBaseMap = vrBasemap as ISRasterBaseMap;
//     return parseRasterBasemapToStyle(rasterBaseMap);
//   }
//   return "";
// };

// /**
//  * 对ISBaseItm的style进行构建，组织真实的矢量瓦片的style
//  * @param data
//  * @returns
//  */
// export const parseVectorBasemapToStyle = (vectorBaseMap: ISVectorTileBaseMap): string | Style | undefined => {
//   let vectorStyle = vectorBaseMap.style;
//   //这里根据style的值去检索和检查，
//   if (!vectorStyle) {
//     //如果style为空，则改为用id去转成内置的style对象
//     //后期可以改成baseMap.id,强化id的作用
//     let innerBasemap = getInnerVectorBasemapItem(vectorBaseMap.id);
//     vectorStyle = innerBasemap ? (innerBasemap as ISVectorTileBaseMap).style : vectorStyle;
//   }
//   //判断是否以http:// 或 https:// 开头
//   if (typeof vectorStyle === "string") {
//     let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
//     // console.log(vectorStyle);

//     if (reg.test(vectorStyle)) {
//       // console.log("http 或 https 开头");
//       return vectorStyle;
//     } else {
//       //TODO:处理 相对路径。此处暂无处理，后续完善
//       return vectorStyle;
//     }
//   }
//   return vectorStyle;
// };
// /**
//  * 构建栅格地图的style
//  * @param basemap
//  * @returns
//  */
// export const parseRasterBasemapToStyle = (basemap: ISRasterBaseMap): Style | undefined => {
//   let rasterBaseMap: ISRasterBaseMap = basemap as ISRasterBaseMap;
//   let rasterStyle = rasterBaseMap.style;
//   if (!rasterStyle) rasterBaseMap = getInnerRasterBasemapItem(rasterBaseMap.id as string);
//   if (!rasterBaseMap) return rasterStyle;
//   let { style, subLayers = [] } = rasterBaseMap;
//   //设定默认值
//   subLayers = subLayers ?? ([] as ISSubLayer[]);
//   let { layers = [] } = style!;
//   //图层合并,去重，
//   style!.layers = [...layers, ...subLayers].reduce((prev, item) => {
//     prev.some((v) => v.id === item.id) || prev.push(item as ISSubLayer);
//     return prev;
//   }, [] as ISSubLayer[]) as AnyLayer[];
//   return {
//     ...style,
//     version: 8,
//   } as Style;
// };
