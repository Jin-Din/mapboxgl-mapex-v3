import type { MapboxOptions, AnyLayer, Layer, Style, AnySourceData } from "mapbox-gl";

/**
 * 鼠标样式
 */
export interface ISMapCursorOption {
  url: string;
  offset?: [number, number];
}

// #endregion
declare module global {
  interface Window {
    mapboxgl: any;
  }
}
interface ISLayerCustomMetadata {
  group?: string;
  isSplitLayer: boolean; //标识是否是分割图层
  isBaseMap: boolean; //标识是否是底图
}
// interface ISLayerCustomOption {
//   metadata: ISLayerCustomMetadata;
// }

/***
 * 默认选项，非底图，非分割
 *
 * isBaseMap: false, isSplitLayer: false
 */
const defaultLayerOptionEx: ISLayerCustomMetadata = {
  isBaseMap: false,
  isSplitLayer: false,
};
/***
 * 底图选项，底图，非分割
 *
 * isBaseMap: true, isSplitLayer: false
 */
const baseMapLayerOptionEx: ISLayerCustomMetadata = {
  isBaseMap: true,
  isSplitLayer: false,
};
/***
 * 图层分组选项，非底图，分割
 *
 * isBaseMap: false, isSplitLayer: true
 */
const layerGroupOptionEx: ISLayerCustomMetadata = {
  isBaseMap: false,
  isSplitLayer: true,
};

declare module "mapbox-gl" {
  interface Layer {
    metadata?: ISLayerCustomMetadata | any;
  }
}

//@ts-ignore
const { mapboxgl } = window; //在script 中引入 mapbox js 文件，
export default mapboxgl;
// #region 自定义内容

//底图与其他业务图层的分割层
const BASEMAP_SPLITED_LAYER: string = "sxgis.basemap.splited.empty.layer";
// 默认的分割图层名称
const fill_group_layer: string = "sxgis.fill.splited.group.layer";
const line_group_layer: string = "sxgis.line.splited.group.layer";
const point_group_layer: string = "sxgis.point.splited.group.layer";

export class Map extends mapboxgl.Map {
  constructor(options?: MapboxOptions) {
    super(options);
    this.on("load", () => {
      // 加载后初始化默认图层
      this.initDefaultEmptyLayers();
    });
  }

  /**
   * 初始化一些默认的空图层
   * @returns
   */
  initDefaultEmptyLayers(): void {
    //初始化底图和其他图层的分割
    this.safeAddBaseMapSplitedLayer();
    // 点、线、面、分组层
    [fill_group_layer, line_group_layer, point_group_layer].forEach((layergroup) => {
      //查找是否存在
      this.addEmptyLayer(layergroup);
    });
  }

  /**
   * 判断指定图层id的图层是否存在
   * @param id
   * @returns true or false
   */
  isLayer(id: string): boolean {
    return !!this.getLayer(id);
  }
  /**
   * 判断图层是否是baselayer。
   * metadata 无值 或者 值为true 才是
   * @param layer
   * @returns
   */
  isBaseLayer(layer: Layer): boolean {
    let metadata = layer.metadata as ISLayerCustomMetadata;
    return !metadata || metadata.isBaseMap === undefined || metadata.isBaseMap === true;
  }
  /**
   * 判断图层是否是非baselayer。
   * metadata 有值且 值为false 才是
   * @param layer
   * @returns
   */
  isUnBaseLayer(layer: Layer): boolean {
    let metadata = layer.metadata as ISLayerCustomMetadata;
    return metadata && metadata.isBaseMap != undefined && metadata.isBaseMap === false;
  }
  /**
   * 获得所有非底图的图层(包含已内置的图层)。
   * metadata 有值且 值为false 才是
   * @returns 所有非底图的图层(包含已内置的图层)
   */
  public getUnBaseLayers(): AnyLayer[] {
    let { layers } = this.getStyle();
    return layers.filter((layer) => this.isUnBaseLayer(layer));
  }
  /**
   * 重写 addLayer，对新加入的图层强制加入 {metadata:{isBaseMap:boolean}} 扩展属性，默认加入 {metadata:{isBaseMap:false}}
   * @param layer
   * @param before 插入到此图层id之前。
   *
   * 特别说明：当传入的参数为boolean并且为true时，将干预新加入图层的顺序。
   *
   *
   * 便于图层的分组管理，本程序设计了一种默认的地图分组规则。地图map对象在初始化后会默认生成三个分别是点、线、面的分组，点层最上，面层最下。
   * 当有新图层加入时，如果传入的参数为boolean且未true，将使用默认分组规则干预新图层的顺序，使得点层永远在上，面层永远处于点、线层之下：
   * 反之，按正常的顺序添加图层，不干预；
   * @returns
   */
  addLayer(layer: AnyLayer, before?: string | boolean | undefined): this {
    // 修订：图层元数据metadata合并，加入默认配置
    let { metadata } = layer as Layer;
    (layer as Layer).metadata = metadata ? { ...defaultLayerOptionEx, ...metadata } : defaultLayerOptionEx;

    // console.log(nLayer);

    //根据layer 类型判断，分别加入到指定的点、线、面 组内
    let beforeId: string | undefined = undefined;
    if (typeof before === "boolean")
      if (before)
        switch (layer.type) {
          case "circle":
          case "symbol":
            beforeId = point_group_layer;
            break;
          case "line":
            beforeId = line_group_layer;
            break;
          case "fill":
          case "raster":
            beforeId = fill_group_layer;
            break;
          default:
            break;
        }
      else beforeId = undefined;
    else beforeId = before;
    return super.addLayer(layer, beforeId);
  }

  /**
   * [自定义方法]清空除了底图、分割图层等内置图层之外的所有临时（专题）图层
   */
  removeOtherLayers(): void {
    let [, index] = this.getFirstBaseMapSplitedLayerId();
    let { layers } = this.getStyle();
    layers &&
      layers
        .slice(index + 1)
        .filter((anylayer) => {
          let metadata = (anylayer as Layer).metadata as ISLayerCustomMetadata;
          return metadata && !metadata.isSplitLayer && !metadata.isBaseMap;
        })
        .map((item) => {
          this.removeLayer(item.id);
        });
  }
  //#region  图层（包括底图图层）加载控制
  /**
   * [自定义]切换底图
   * @param data string类型代表矢量瓦片url 地址
   * @param _removeLast  是否移除上一次的底图 ，默认为true,目前不起作用
   */
  changeBaseMapStyle = async (data: Style | string | undefined, _removeLast: boolean = true) => {
    if (!data) return;
    // console.log(data);

    this.removeBaseStyle();
    await this.addBaseMapStyle(data, baseMapLayerOptionEx);
  };

  // changeBaseMapStyle = (baseMapStyle: Style | string) => {
  //   this.changeBaseMapStyle(baseMapStyle);
  // };
  /**
   * 切换底图
   * @param baseMapItem 传入底图item，可以是内置地图的id（如default，black，blue，gray），也可以是自定义的ISBaseMap对象。
   */
  // changeBaseMap = (baseMapItem: AnyBasemapStyle | ISBaseMap) => {
  //   if (!baseMapItem) return;

  //   if (typeof baseMapItem === "string") {
  //     //如果是string，则判读为内置底图id，根据id获取内置真实的配置
  //     baseMapItem = getInnerBasemapItem(baseMapItem as string);
  //     this.changeBaseMap(baseMapItem);
  //   } else {
  //     //增加一道检测：检查 ISVectorTileBaseMap.style 的值，返回真实的 内置矢量瓦片地址
  //     this.changeBaseMapStyle(parseBasemItemToStyle(baseMapItem));
  //   }
  // };
  /**
   * 切换style （暂未实现，勿使用）
   * 方法一：[不推荐] setSyle。 把新style与旧style合并，重新setStyle。简单粗暴
   *
   * 缺点：
   * 1.切换时整个地图会重新刷一遍，视觉上就会出现白屏
   * 2.之前动态加载的资源（如图标）将被清空，需要重新加载(暂未实现)
   * @param styleJson
   * @param stay
   * @returns
   */
  _changeStyle = async (styleJson: Style | string | undefined, stay: boolean = false) => {
    if (!styleJson) return;
    if (!stay) {
      //移除上一个
      let currentStyle = this.getStyle();
      if (!currentStyle) return;
      // console.log(currentStyle);
      let { layers, sources: currentSources } = currentStyle;

      // store images

      //原 sources ids
      // let curretnSourceIds = Object.keys(currentSources);
      //找到自定义的图层
      let customLayers = this.getUnBaseLayers();

      if (typeof styleJson === "string") {
        //TODO 矢量瓦片地址 从新解析
        let styleString = styleJson as string;
        let [error, result] = await fetchJson(styleString);
        // let [error, result] = await awaitHelper(axios.get(styleString));
        if (error) return;
        styleJson = result as Style;
      }

      //合并到新的style里
      styleJson.sources = Object.assign({}, currentSources, styleJson.sources);
      styleJson.layers = [...styleJson.layers, ...customLayers]; //自定义的图层要放在上面

      // 过滤非必要的sources.从合并后的layers中反向查找对应的sources(待完善)

      this.on("style.load", () => {
        console.log("loading sprites");

        // //重新加载图片资源(未实现)
        // this.reloadImages();
      });

      // console.log(styleJson);
      this.setStyle(styleJson, { diff: true });
    }
  };

  /**
   * 加载底图地图样式
   * @param styleJson
   * @param option
   */
  private addBaseMapStyle = async (styleJson: Style | string, option?: ISLayerCustomMetadata) => {
    await this.addStyle(styleJson, option);
  };
  /**
   * 加载地图样式
   * @param styleJson
   * @param option
   */
  private addStyle = async (styleJson: Style | string, option?: ISLayerCustomMetadata) => {
    let optMetadata = {
      ...defaultLayerOptionEx,
      ...option,
    };

    this.initDefaultEmptyLayers();
    if (typeof styleJson === "string") {
      //TODO 矢量瓦片地址 从新解析
      let styleString = styleJson as string;
      let [error, result] = await fetchJson(styleString); //awaitHelper(axios.get(styleString));
      if (error) return;
      styleJson = result as Style;
      let { sprite } = styleJson;
      if (sprite) await this.addSpriteImages(sprite as string); //记载雪碧图
      let vectorStyle = {
        // version: 8,
        // sources,
        // layers,
        ...styleJson,
      };
      await this.addStyle(vectorStyle, optMetadata);
    } else {
      let { sources, layers, terrain } = styleJson as Style;
      //添加数据源
      // @ts-ignore
      Object.keys(sources).forEach((key) => {
        //同名source 不会更新
        if (!this.getStyle() || !this.getSource(key)) {
          this.addSource(key, sources![key]);
        }
      });

      let { isBaseMap } = optMetadata;
      if (layers)
        //添加图层
        for (const layer of layers) {
          let layerid = layer.id;
          // 修订：图层元数据metadata合并，加入顶层option.metadata配置
          let { metadata } = layer as Layer;
          //替换原来的metadata
          (layer as Layer).metadata = metadata ? { ...optMetadata, ...metadata } : optMetadata;

          if (!this.getStyle() || !this.getLayer(layerid)) {
            let firstSpeLayer = this.safeAddBaseMapSplitedLayer();
            if (isBaseMap && firstSpeLayer) {
              this.addLayer(layer, firstSpeLayer.id);
            } else {
              this.addLayer(layer);
            }
          }
        }

      //配置地形
      if (!!terrain) this.setTerrain(terrain);
      else if (this.getTerrain()) this.setTerrain(null);
    }
  };
  /**
   * 移除底图的style，主要是 layers
   *
   * 判定依据：
   * layer对象中，没有metadata字段，是底图；
   * layer对象中，有metadata字段，isBaseMap =undefined 是底图。
   * layer对象中，有metadata字段，且metadata.isBaseMap为ture，是底图。
   * 综上： 有metadata且isBaseMap 明确标记为false 的是 非底图，其他情况都是底图
   */
  private removeBaseStyle = () => {
    //非底图图层中如果有引用了底图的source。如果source删除，那么该非底图图层也将失去source。除非新加入的source中恰好有同名的source
    //解决方法：
    //1.方法1：不处理source。即保留（不删除）原来source。这样，就不用担心非底图的图层失去source的风险。可以达到切换数据源不重渲染图层的效果
    //2.方法2：1.一刀切删除处理source：只要涉及被删除图层的source，都删除。遍历现有图层中引用了该source的layer，包括非底图图层（专题图层），也会被删除。
    //        2.【推荐】仅保留必要的source：在删除source时，判断非底图图层是否有引用，如果有，则保留，反之，没有图层引用就删除。
    //以下代码采用了 第2.1种 方法。

    /**
     * 这里隐藏着一种情况：
     * 如果新加载的source中与原来的source存在同名情况。
     * 举例说明：
     * 在切换Style前，非底图图层A，引用了名为 youmap 的source。按照删除逻辑，此处切换style时将保留youmap 这个source。
     * 此时，如果新的style中存在同为youmap 的source；如果两个新旧的youmap source是同名同内容，则是不用去处理；但如果这两个source只是同名内容不同，
     * 按照此处处理逻辑同名不处理原则，那么这个新的source加不进来，非底图的图层还是引用原来的source，内容上不会刷新改变。这在一些场景比如动态切换数据源改变显示内容场景将不起作用。
     */

    let splitedLayer = this.safeAddBaseMapSplitedLayer(); //限定在分割层之内

    let { layers } = this.getStyle();
    if (layers) {
      let index = layers.findIndex((item) => item.id == splitedLayer?.id);
      //获取所有待删除图层集
      let removedLayers = layers.slice(0, index).filter((anylayer) => {
        let metadata = (anylayer as Layer).metadata as ISLayerCustomMetadata;
        return !metadata || metadata.isBaseMap === undefined || metadata.isBaseMap === true;
      });
      // console.log("待删除图层ids");
      // console.log(removedLayers.map((item) => item.id));
      //查找非底图(metadata.isBaseMap==false)图层集
      // 修复: metadata 有值且 值为false 才能保留
      let stayinLayers = layers.filter((anylayer) => {
        let metadata = (anylayer as Layer).metadata as ISLayerCustomMetadata;
        return metadata && metadata.isBaseMap != undefined && metadata.isBaseMap === false;
      });
      // console.log("待保留图层ids");
      // console.log(stayinLayers.map((item) => item.id));
      //待删除的sourceid
      let readyToRemovedSourceIds: string[] = [];
      removedLayers.forEach((anylayer) => {
        //收集被删除layer对应的source
        if (Object.keys(anylayer).includes("source")) {
          let removedSource = (anylayer as Layer).source;
          if (removedSource && typeof removedSource === "string" && !readyToRemovedSourceIds.includes(removedSource)) {
            readyToRemovedSourceIds.push(removedSource);
          }
        }
      });
      // console.log("待删除sourceids");
      // console.log(readyToRemovedSourceIds);

      //待保留的source 。
      //TODO: 地形数据源保留
      let stayinSourceIds: string[] = [];
      stayinLayers.forEach((anylayer) => {
        //收集被删除layer对应的source
        if (Object.keys(anylayer).includes("source")) {
          let stayinSource = (anylayer as Layer).source;
          if (stayinSource && typeof stayinSource === "string" && !stayinSourceIds.includes(stayinSource)) {
            stayinSourceIds.push(stayinSource);
          }
        }
      });
      // console.log("待保留sourceids");
      // console.log(stayinSourceIds);

      //收集被删除layer对应的source
      //去重，求差
      // let removeSourceIds: string[] = [];
      let removeSourceIds = Array.from(new Set(readyToRemovedSourceIds)).filter((item) => {
        // console.log(Array.from(new Set(stayinSourceIds)).includes(item));
        return !Array.from(new Set(stayinSourceIds)).includes(item);
      });

      //删除图层
      for (const anylayer of removedLayers) {
        //删除图层
        this.removeLayer(anylayer.id);
      }
      //同步删除对应的source
      removeSourceIds.forEach((item) => {
        if (item && this.getSource(item)) this.removeSource(item);
      });
    }
  };
  /**
   * [自定义方法]查找第一个非底图的图层。内置的 BASEMAP_SPLITED_LAYER 图层
   *
   * {layer:{meta:{isBaseMap:false}}}
   */
  getFirstBaseMapSplitedLayerId = (): [string, number] => {
    let [layerid, index] = ["", -1];
    let { layers } = this.getStyle();
    if (layers) {
      let idx = layers.findIndex((layer) => {
        return layer.id === BASEMAP_SPLITED_LAYER;
      });
      [layerid, index] = [idx >= 0 ? BASEMAP_SPLITED_LAYER : "", idx];
    }
    return [layerid, index];
    // for (let layer of layers) {
    //   let baseMapMeta = layer as Layer;
    //   if (!baseMapMeta.metadata || baseMapMeta.metadata.isBaseMap == false) {
    //     return layer.id;
    //   }
    // }
    // return "";
  };

  /**
   * [自定义方法]查找并获取紧挨着当前图层的上一个图层id，
   *
   * 如果是空，则表示当前图层不在map图层内，或者已经是第一个图层。
   * @param layerId 当前图层id
   */
  getLayerIdBefore = (layerId: string): string | undefined => {
    let beforeId: string | undefined = undefined;
    let { layers } = this.getStyle();
    if (layers) {
      let index = layers.findIndex((layer) => {
        return layer.id === layerId;
      });
      if (index > 0 && index < layers.length) beforeId = layers[index - 1].id;
    }
    return beforeId;
  };
  /**
   * [自定义方法]查找并获取紧挨着当前图层的下一个图层id，
   *
   * 如果是空，则表示当前图层不在map图层内，或者已经是最后一个图层。
   * @param layerId 当前图层id
   */
  getLayerIdAfter = (layerId: string): string | undefined => {
    let afterId: string | undefined = undefined;
    let { layers } = this.getStyle();
    if (layers) {
      let index = layers.findIndex((layer) => {
        return layer.id === layerId;
      });
      if (index >= 0 && index < layers.length - 1) afterId = layers[index + 1].id;
    }
    return afterId;
  };

  /**
   * [自定义方法]添加一个空图层，仅用做占位。空图层为 background 类型，
   * @param layerId
   * @returns
   */
  addEmptyLayer = (layerId: string, beforeId?: string | undefined): AnyLayer | null => {
    if (!this.getStyle()) return null;
    let { layers } = this.getStyle();
    if (!layers || !this.getLayer(layerId)) {
      this.addLayer(
        {
          id: layerId,
          type: "background",
          layout: {
            visibility: "none",
          },
          metadata: layerGroupOptionEx,
        },
        beforeId
      );
    }
    return this.getLayer(layerId);
  };

  /**
   * 添加底图分割图层
   * @returns
   */
  private safeAddBaseMapSplitedLayer = (): AnyLayer | null => {
    return this.addEmptyLayer(BASEMAP_SPLITED_LAYER);
  };

  /**
   *   加载雪碧图
   *   Jin 2023.1.6
   *   */
  addSpriteImages = async (spritePath: string) => {
    // console.log(spritePath);
    let [, spriteJson] = await fetchJson(`${spritePath}.json`); //(await axios.get(`${spritePath}.json`)).data;
    let img = new Image();
    img.onload = () => {
      // console.log("雪碧图")
      Object.keys(spriteJson).forEach((key: string) => {
        let spriteItem = spriteJson[key];
        let { x, y, width, height } = spriteItem;
        let canvas = this.createCanvas(width, height);
        let context = canvas.getContext("2d");
        context!.drawImage(img, x, y, width, height, 0, 0, width, height);
        // 单位雪碧图项，转base64字符串
        let base64Url = canvas.toDataURL("image/png");
        this.loadImage(base64Url, (error, simg: any) => {
          if (error) return;
          if (!this.hasImage(key)) {
            // console.log(key);

            this.addImage(key, simg);
          }
        });
      });
    };
    img.crossOrigin = "anonymous";
    img.src = `${spritePath}.png`;
  };
  /**
   * [自定义扩展] 扩展 addSource方法，加入判断，简化addsource之前的 this.getSource(id) 是否存在的判断
   * @param id
   * @param source
   * @param bOverwrite 是否覆盖，如果是，将移除已存在的，再添加。反之，同名的source不做处理
   * @returns
   */
  addSourceEx = (id: string, source: AnySourceData, bOverwrite: boolean = false) => {
    if (this.getSource(id) && bOverwrite) {
      this.removeSource(id);
    }
    if (!this.getSource(id)) this.addSource(id, source);

    return this;
  };

  /**
   * 设置自定义鼠标样式。 如果是自定义鼠标样式，名称要避开内置默认的鼠标样式名称
   * 建议使用大小为32x32 的png
   *
   * 不支持带别名的路径 如 @assets/image/curor.png
   * @param cursor 鼠标地址。可以用默认的鼠标样式名称
   */
  setMapCursor = (cursor: string, offset: [number, number] = [0, 0]) => {
    //
    let defaultCursors = [
      "auto",
      "crosshair",
      "default",
      "hand",
      "move",
      "help",
      "wait",
      "text",
      "w-resize",
      "s-resize",
      "n-resize",
      "e-resize",
      "ne-resize",
      "sw-resize",
      "se-resize",
      "nw-resize",
      "pointer",
    ];
    if (!cursor) this.getCanvas().style.cursor = "";
    else if (defaultCursors.includes(cursor)) this.getCanvas().style.cursor = cursor;
    else this.getCanvas().style.cursor = `url(${cursor}) ${offset[0]} ${offset[1]}, auto`;
  };
  /**
   *   绘制canvas
   *   Jin 2023.1.6
   *   */
  private createCanvas = (width: number, height: number) => {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  };

  //#endregion
}

const awaitHelper = async <T = any>(promise: Promise<T>) => {
  try {
    const result = await promise;
    return [null, result] as const;
  } catch (error) {
    return [error, null] as const;
  }
};

const fetchJson = async (url: string) => {
  const response = await fetch(url);
  return await awaitHelper(response.json());
};
