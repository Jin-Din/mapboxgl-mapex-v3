import { Style } from "mapbox-gl";
import { AnyBasemapStyle, ISBaseMap, ISBaseMapType, ISRasterBaseMap, ISVectorTileBaseMap, RasterBasemapStyle, VectorBaseMapStyle } from "./createMap";

// const _token = ref<ISToken>({ default: "", tianditu: "", sx_img: "", sx_img_label: "" });

/**
 * 内置天地图陕西默认的地图集
 * 模板化地址
 */
const defaultBaseMapVectorStyles = {
  //默认
  default: "https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${default}/VectorTileServer/styles/default.json",
  //黑色/夜光
  black: "https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${default}/VectorTileServer/styles/black.json",
  //科技蓝
  blue: "https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${default}/VectorTileServer/styles/blue.json",
  //灰白
  gray: "https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${default}/VectorTileServer/styles/blue.json",
};
/**
 * 内置天地图、天地图陕西的栅格瓦片服务地址
 * 模板化地址
 */
const defaultBasemapRasterStyle = {
  tianditu_img_c: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => `https://t${index}.tianditu.gov.cn/DataServer?T=img_c&x={x}&y={y}&l={z}&tk=\${tianditu}`),
  tianditu_cia_c: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => `https://t${index}.tianditu.gov.cn/DataServer?T=cia_c&x={x}&y={y}&l={z}&tk=\${tianditu}`),
  tianditu_vec_c: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => `https://t${index}.tianditu.gov.cn/DataServer?T=vec_c&x={x}&y={y}&l={z}&tk=\${tianditu}`),
  tianditu_cva_c: [0, 1, 2, 3, 4, 5, 6, 7].map((index) => `https://t${index}.tianditu.gov.cn/DataServer?T=cva_c&x={x}&y={y}&l={z}&tk=\${tianditu}`),
  //以下为天地图陕西的瓦片地图
  tianditu_sx_img: ["https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/SxImgMap/${tdtsx_img}/TileServer/tile/{z}/{y}/{x}"],
  tianditu_sx_img_label: [
    "https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/SxImgLabelMap/${tdtsx_img_label}/TileServer/tile/{z}/{y}/{x}",
  ],
};

/**
 * 内置天地图陕西默认地图集--ISBaseItem 结构
 */
const _defaultBaseMapItems = {
  //默认
  default: {
    id: "default",
    name: "浅色",
    type: "vector" as ISBaseMapType,
    style: defaultBaseMapVectorStyles["default"], // `https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${_mapConfig.token?.default}/VectorTileServer/styles/default.json`,
  } as ISVectorTileBaseMap,
  //黑色/夜光
  black: {
    id: "black",
    name: "夜光",
    type: "vector" as ISBaseMapType,
    style: defaultBaseMapVectorStyles["black"], //`https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${_mapConfig.token?.tdtsxVector}/VectorTileServer/styles/black.json`,
  } as ISVectorTileBaseMap,
  //科技蓝
  blue: {
    id: "blue",
    name: "科技蓝",
    type: "vector" as ISBaseMapType,
    style: defaultBaseMapVectorStyles["blue"], //`https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${_mapConfig.token?.tdtsxVector}/VectorTileServer/styles/blue.json`,
  } as ISVectorTileBaseMap,
  //灰白
  gray: {
    id: "gray",
    name: "灰白",
    type: "vector" as ISBaseMapType,
    style: defaultBaseMapVectorStyles["gray"], //`https://shaanxi.tianditu.gov.cn/ServiceSystem/Tile/rest/service/sxww2022Geo/${_mapConfig.token?.tdtsxVector}/VectorTileServer/styles/blue.json`,
  } as ISVectorTileBaseMap,
  // 天地图 影像
  tianditu_img_c: {
    id: "tianditu_img_c",
    type: "raster" as ISBaseMapType,
    style: {
      sources: {
        tianditu_img_c_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_img_c"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_img_c_layer",
          type: "raster",
          source: "tianditu_img_c_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
  } as ISRasterBaseMap,
  // 天地图 影像组
  tianditu_img_c_group: {
    id: "tianditu_img_c_group",
    type: "raster" as ISBaseMapType,
    style: {
      sources: {
        tianditu_img_c_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_img_c"],
          tileSize: 256,
        },
        tianditu_cia_c_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_cia_c"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_img_c_layer",
          type: "raster",
          source: "tianditu_img_c_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
        {
          id: "tianditu_cia_c_layer",
          type: "raster",
          source: "tianditu_cia_c_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
    subLayers: [],
  } as ISRasterBaseMap,
  // 天地图 矢量组
  tianditu_vec_c_group: {
    id: "tianditu_vec_c_group",
    type: "raster" as ISBaseMapType,

    style: {
      sources: {
        tianditu_vec_c_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_vec_c"],
          tileSize: 256,
        },
        tianditu_cva_c_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_cva_c"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_vec_c_layer",
          type: "raster",
          source: "tianditu_vec_c_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
        {
          id: "tianditu_cva_c_layer",
          type: "raster",
          source: "tianditu_cva_c_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
    subLayers: [],
  } as ISRasterBaseMap,
  //天地图·陕西 影像
  tianditu_sx_img: {
    id: "tianditu_sx_img",
    type: "raster" as ISBaseMapType,
    style: {
      sources: {
        tianditu_sx_img_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_sx_img"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_sx_img_layer",
          type: "raster",
          source: "tianditu_sx_img_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
  } as ISRasterBaseMap,
  //天地图·陕西 影像注记
  tianditu_sx_img_label: {
    id: "tianditu_sx_img_label",
    type: "raster" as ISBaseMapType,
    style: {
      sources: {
        tianditu_sx_img_label_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_sx_img_label"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_sx_img_label_layer",
          type: "raster",
          source: "tianditu_sx_img_label_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
  } as ISRasterBaseMap,
  // 天地图·陕西 影像组
  tianditu_sx_img_group: {
    id: "tianditu_sx_img_group",
    type: "raster" as ISBaseMapType,
    style: {
      sources: {
        tianditu_sx_img_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_sx_img"],
          tileSize: 256,
        },
        tianditu_sx_img_label_source: {
          type: "raster",
          tiles: defaultBasemapRasterStyle["tianditu_sx_img_label"],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "tianditu_sx_img_layer",
          type: "raster",
          source: "tianditu_sx_img_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
        {
          id: "tianditu_sx_img_label_layer",
          type: "raster",
          source: "tianditu_sx_img_label_source",
          metadata: {
            isBaseMap: true,
          },
          layout: {
            visibility: "visible",
          },
        },
      ],
      version: 8,
    },
    subLayers: [],
  } as ISRasterBaseMap,
};
/**
 * 获取内置的地图配置对象
 * @param data
 * @returns
 */
export const getInnerBasemapItem = (data: AnyBasemapStyle | string): ISBaseMap => {
  if (typeof data === "string" && Object.keys(_defaultBaseMapItems).includes(data as string)) {
    return _defaultBaseMapItems[data as AnyBasemapStyle];
  }

  return null as unknown as ISBaseMap;
};

export const parseBasemItem = (vrBasemap: ISBaseMap | string): ISBaseMap => {
  if (typeof vrBasemap === "string") {
    // 只有名字，则默认他是使用了内置地图
    return getInnerBasemapItem(vrBasemap as string);
  }

  let { id, style: baseMapstyle } = vrBasemap;

  // style 不为空,返回对象本身
  if (baseMapstyle) return vrBasemap;

  // style 为空，根据id解析为内部style
  let innerBasemap = getInnerBasemapItem(id);
  return { ...innerBasemap, ...vrBasemap };
};
// export const parseBasemItemToStyle = (vrBasemap: ISBaseMap): string | Style | undefined => {
//   let { id, style: baseMapstyle } = vrBasemap;
//   // style 不为空
//   if (baseMapstyle) return baseMapstyle;
//   // style 为空，根据id解析为内部style
//   let innerBasemap = getInnerBasemapItem(id);
//   return { ...innerBasemap, ...vrBasemap };

//   // if (vrBasemap.type === "vector") {
//   //   let vectorBaseMap = vrBasemap as ISVectorTileBaseMap;
//   //   return parseVectorBasemapToStyle(vectorBaseMap);
//   // } else if (vrBasemap.type === "raster") {
//   //   let rasterBaseMap: ISRasterBaseMap = vrBasemap as ISRasterBaseMap;
//   //   return parseRasterBasemapToStyle(rasterBaseMap);
//   // }
//   return "";
// };

// /**
//  * 获取内置的S矢量地图配置对象
//  * @param data
//  * @returns
//  */
// export const getInnerVectorBasemapItem = (data: VectorBaseMapStyle | string): ISVectorTileBaseMap => {
//   if (
//     typeof data === "string" &&
//     Object.keys(_defaultBaseMapItems)
//       .filter((item) => _defaultBaseMapItems[item as AnyBasemapStyle].type === "vector")
//       .includes(data as VectorBaseMapStyle)
//   ) {
//     return _defaultBaseMapItems[data as VectorBaseMapStyle];
//   }
//   return null as unknown as ISVectorTileBaseMap;
// };
// /**
//  * 获取内置的影像地图配置对象
//  * @param data
//  * @returns
//  */
// export const getInnerRasterBasemapItem = (data: RasterBasemapStyle | string): ISRasterBaseMap => {
//   if (
//     typeof data === "string" &&
//     Object.keys(_defaultBaseMapItems)
//       .filter((item) => _defaultBaseMapItems[item as AnyBasemapStyle].type === "raster")
//       .includes(data as RasterBasemapStyle)
//   ) {
//     return _defaultBaseMapItems[data as RasterBasemapStyle];
//   }
//   return null as unknown as ISRasterBaseMap;
// };
