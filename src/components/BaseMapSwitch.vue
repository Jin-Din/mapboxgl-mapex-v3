<template>
  <div class="map-switch-container" @mouseenter="baseMapsGroupVisible = true" @mouseleave="baseMapsGroupVisible = false">
    <Transition enter-active-class="animate__animated animate__fadeInRight" leave-active-class="animate__animated animate__fadeOutRight">
      <div class="map-switch-item-group" v-if="baseMapsGroupVisible">
        <div
          class="map-switch-item"
          v-for="(item, index) in mapConfig?.baseMaps"
          :key="index"
          :style="{ 'background-image': `url(${getImage(getDefaultBaseMapInfo(item).icon)})` }"
          :class="{ active: selectedBaseMapIndex === index }"
          @click="handleChangeBaseMap(item, index)"
        >
          <!-- <img :src="`${getImage(getDefaultBaseMapInfo(item).icon)}`" /> -->
          <div class="map-switch-item-title">{{ getDefaultBaseMapInfo(item).name }}</div>
        </div>
      </div>
    </Transition>
    <div>
      <div class="map-switch-item" :style="{ 'background-image': `url(${getImage(selectedBaseMapItem?.icon)})` }">
        <div class="map-switch-item-title">{{ selectedBaseMapItem?.name }}</div>
        <div class="map-sublayers-container" v-if="subLayers.length > 0">
          <el-checkbox-group v-model="checkedSubLayerIds" @change="handleChangeLayerVisible">
            <div class="map-sublayers-item" v-for="(sublayer, idx) in subLayers" :key="idx">
              <el-checkbox style="margin: 0 4px" v-model="sublayer.id" :label="sublayer.id" size="small"
                ><span class="map-sublayers-item-title">{{ sublayer.name }}</span></el-checkbox
              >
            </div>
          </el-checkbox-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//@名称:
//@作者: Jin
//@日期:
//@说明:
import "animate.css";

import { ref, onMounted } from "vue";
import { Map } from "@lib/mapEx";
import { ISBaseMap, ISMapConfig, ISSubLayer, switchBaseMap, useBaseMapState } from "@lib/index";

// import { Map } from "@jindin/mapboxgl-mapex";
// import { ISBaseMap, ISMapConfig, ISLayer, switchBaseMap, ISRasterBaseMap, useBaseMapState } from "@jindin/mapboxgl-mapex";
let baseMapsGroupVisible = ref(false);

let selectedBaseMapItem = ref<ISBaseMap>();
let selectedBaseMapId = ref("");
let selectedBaseMapIndex = ref(-1);

const { currentBaseMapId } = useBaseMapState();

let checkedSubLayerIds = ref([] as string[]);
const props = withDefaults(
  defineProps<{
    map: Map;
    mapConfig: ISMapConfig | undefined;
  }>(),
  {
    mapConfig: undefined,
  }
);
const emits = defineEmits<{
  (e: "onBaseMapChange", baseMapItem: ISBaseMap | string): void;
  (e: "onSubLayersChanged", checkedIds: string[], uncheckedIds: string[]): void;
}>();

const getDefaultBaseMapInfo = (input: ISBaseMap | string) => {
  //给默认的底图配置图标和名称
  const defaultbasemaps: { [key: string]: ISBaseMap } = {
    default: {
      id: "default",
      name: "矢量",
      icon: "/img/basemaps/default.png",
    },
    blue: {
      id: "blue",
      name: "蓝色",
      icon: "/img/basemaps/blue.png",
    },
    black: {
      id: "black",
      name: "黑色",
      icon: "/img/basemaps/black.png",
    },
    gray: {
      id: "gray",
      name: "灰色",
      icon: "/img/basemaps/gray.png",
    },
    tianditu_sx_img_group: {
      id: "tianditu_sx_img_group",
      name: "影像",

      icon: "/img/basemaps/image.png",
    },
    tianditu_img_c_group: {
      id: "tianditu_img_c_group",
      name: "全国",

      icon: "/img/basemaps/tdt_img.png",
    },
  };
  if (typeof input === "string") {
    if (Object.keys(defaultbasemaps).includes(input)) return defaultbasemaps[input];
    else return { id: input, name: input, icon: "" };
  }
  return input as ISBaseMap;
};

/**
 * 子图层
 */
const subLayers = computed(() => {
  let ovLayers = [] as ISSubLayer[];
  if (props.mapConfig && props.mapConfig.overLayers?.layers) {
    //合并当前底图中的sublayers 和 overlayers 中layers
    ovLayers = props.mapConfig?.overLayers.layers;
    ovLayers.forEach((item) => {
      item.visible = !item.layout || item.layout.visibility === "visible";
    });
  }
  if (selectedBaseMapItem.value?.hasOwnProperty("subLayers")) {
    let selectedBasemap = selectedBaseMapItem.value;
    let { subLayers = [] } = selectedBasemap;
    subLayers.forEach((layer) => (layer.visible = layer.visible ?? true)); // 默认没有设置时为true
    ovLayers = [...ovLayers, ...subLayers]; //
    console.log(ovLayers);

    return ovLayers;
  } else return ovLayers;
});

watch(
  () => props.mapConfig,
  (newValue, oldValue) => {
    if (newValue) {
      let current = newValue.current;
      selectedBaseMapId.value = current!;
      //获取当前
      selectedBaseMapIndex.value = newValue.baseMaps!.findIndex((item: any) => {
        if (typeof item === "string") return item === current;
        else return (<ISBaseMap>item).id === current;
      });
    }
  }
);
watch(
  () => selectedBaseMapIndex.value,
  (newValue, oldValue) => {
    if (newValue >= 0) selectedBaseMapItem.value = props.mapConfig?.baseMaps!.at(newValue) as ISBaseMap;
  },
  {
    immediate: true,
  }
);
//监听 swicthbasemap底图id的变化，可以通知底图切换控件也跟着切换
watch(
  () => currentBaseMapId.value,
  (newValue, oldValue) => {
    console.log(newValue);
    selectedBaseMapId.value = newValue;
  },
  {
    immediate: true,
  }
);
watch(
  () => selectedBaseMapId.value,
  (newValue, oldValue) => {
    if (newValue) {
      console.log(newValue);
      selectedBaseMapItem.value = props.mapConfig?.baseMaps?.find((item: string | ISBaseMap) => {
        if (typeof item === "string") return item === newValue;
        else return (<ISBaseMap>item).id === newValue;
      }) as ISBaseMap;
      console.log(selectedBaseMapItem.value);
    }
  },
  {
    immediate: true,
  }
);
/**
 * 监听子图层选择状态，并控制图层显示
 */
watch(checkedSubLayerIds, (newValue, oldValue) => {
  //从oldvalue 中排除newvalue后的选项，则为关闭显示，
});

watch(
  () => subLayers.value,
  (newValue, oldValue) => {
    if (newValue) checkedSubLayerIds.value = newValue.filter((item) => item.visible).map((layer) => layer.id);
  },
  {
    immediate: true,
  }
);

// const selectedBaseMapItem = computed(() => {
//   return props.mapConfig?.baseMaps.find((item) => {
//     if (typeof item === "string") return item === selectedBaseMapId.value;
//     else return (<ISBaseMap>item).id === selectedBaseMapId.value;
//   }) as ISBaseMap;
// });

// const checkedSubLayerIds = computed(() => {
//
// });

const getImage = (path: string | undefined): string => {
  if (typeof path === "undefined") return "";
  return getImageUrl(path);
};
const getImageUrl = (path: string, prefix?: string): any | string => {
  const isStartWithHttpOrHttps = (url: string) => {
    let reg = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
    return reg.test(url);
  };

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
const handleChangeBaseMap = async (item: ISBaseMap | string, index: number) => {
  selectedBaseMapIndex.value = index;
  // selectedBaseMapId.value = typeof item === "string" ? item : (<ISBaseMap>item).id;
  // console.log(item);

  if (typeof item != "string") {
    item = (item as ISBaseMap).id;
  }
  let { previousId, currentId } = await switchBaseMap(item);
  selectedBaseMapId.value = currentId!;

  console.log(props.map.getStyle());
  emits("onBaseMapChange", item);
};

onMounted(() => {
  if (props.mapConfig) {
    selectedBaseMapId.value = props.mapConfig.current!;
  }
});
/**
 * 控制子图层开关
 * @param checkedIds
 */
const handleChangeLayerVisible = (checkedIds: any[]) => {
  let allLayerIds = subLayers.value.map((item) => item.id);
  let uncheckedIds = subSet(allLayerIds, checkedIds); //两个数组取差
  if (props.map) {
    checkedIds.forEach((chkid) => {
      let sublayerItem = subLayers.value.find((item) => item.id === chkid);
      if (!sublayerItem) return;
      let arrayLayerIds = [];
      let { layerIds = [] } = sublayerItem;

      if (typeof layerIds === "string") {
        arrayLayerIds = layerIds.split(",");
      } else arrayLayerIds = layerIds;
      //对 arrayLayerIds 二次处理，主要处理包含有通配符*（如youmap-*）的图层
      arrayLayerIds = findMatchedLayers(arrayLayerIds);

      // 本身就是图层id
      if (props.map.getLayer(sublayerItem.id)) arrayLayerIds.push(sublayerItem.id);
      //统一处理
      arrayLayerIds.forEach((layerid) => {
        if (props.map.getLayer(layerid)) props.map.setLayoutProperty(layerid, "visibility", "visible");
      });
    });
    uncheckedIds.forEach((uchkid: string) => {
      let sublayerItem = subLayers.value.find((item) => item.id === uchkid);
      if (!sublayerItem) return;

      let arrayLayerIds = [];
      let { layerIds = [] } = sublayerItem;
      if (typeof layerIds === "string") {
        arrayLayerIds = layerIds.split(",");
      } else arrayLayerIds = layerIds;
      arrayLayerIds = findMatchedLayers(arrayLayerIds);
      // console.log(arrayLayerIds);
      // 本身就是图层id
      if (props.map.getLayer(sublayerItem.id)) arrayLayerIds.push(sublayerItem.id);

      //统一处理
      arrayLayerIds.forEach((layerid) => {
        if (props.map.getLayer(layerid)) props.map.setLayoutProperty(layerid, "visibility", "none");
      });
    });
  }

  emits("onSubLayersChanged", checkedIds, uncheckedIds);
};

const subSet = (arr1: string[], arr2: string[]) => {
  var set1 = new Set(arr1);
  var set2 = new Set(arr2);
  var subset = [];
  for (let item of set1) {
    if (!set2.has(item)) {
      subset.push(item);
    }
  }
  return subset;
};
/**
 * 查找style中匹配layerid 的所有图层id， 如果含有*,? 通配符，也查询
 * @param toMatchLayers
 */
const findMatchedLayers = (toMatchLayers: string[]): string[] => {
  if (!props.map) return [];
  let { layers } = props.map.getStyle();
  return layers
    .map((layerid) => layerid.id)
    .filter((item) => {
      return toMatchLayers.some((hit) => {
        // if (hit === item) return true;
        return match(hit, item);
      });
    });
};
/**
 * 匹配通配符
 * 如
 * test("He*lo", "Hello"); // Yes
 * test("He?lo*", "HelloWorld"); // Yes
 * test("*pqrs", "pqrst"); // No because 't' is not in first
 * test("abc*bcd", "abcdhghgbcd"); // Yes
 * test("abc*c?d", "abcd"); // No because second must have 2 instances of 'c'
 */
const match = (reg: string, val: string): boolean => {
  if (reg.length == 0 && val.length == 0) return true;
  if (reg.length > 1 && reg[0] == "*" && val.length == 0) return false;
  if ((reg.length > 1 && reg[0] == "?") || (reg.length != 0 && val.length != 0 && reg[0] == val[0])) return match(reg.substring(1), val.substring(1));
  if (reg.length > 0 && reg[0] == "*") return match(reg.substring(1), val) || match(reg, val.substring(1));
  return false;
};
</script>

<style scoped lang="less">
.map-switch-container {
  /* position: absolute;
  right: 8px;
  bottom: 8px; */
  display: flex;
  justify-content: flex-end;
  align-items: flex-end;
  flex-shrink: 0;
  /* width: 62px;
  height: 65px;
  background-color: rgb(30, 37, 65);
  border: 3px solid white;
  cursor: pointer; */
}

// .map-switch-container:hover .map-switch-item-group {
//   visibility: visible;
// }

.map-switch-item-group {
  display: flex;
  // visibility: collapse;
}
.map-switch-item-nav {
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 41px;
  height: 41px;

  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2), 0 -1px 0 rgba(0, 0, 0, 0.02);
}

.map-switch-item {
  position: relative;
  width: 86px;
  height: 80px;
  margin: 0 4px;
  // padding: 3px;
  background-repeat: no-repeat;
  background-size: 95% 95%;
  background-position: center;
  // background-color: rgba(23, 49, 71, 1);
  /* background-color: #ffd04b; */
  border: 1px solid rgb(173, 173, 173);
  cursor: pointer;
  /* color: #000; */
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-size: 14px;
}
.active {
  background-color: #ffd04b;
}
.map-switch-item-title {
  position: absolute;
  bottom: 1px;
  right: 1px;
  background-color: rgba(26, 143, 252, 1);
  padding: 1px 2px;
  color: white;
  text-align: center;
  /* margin: auto 0px; */
}
.map-sublayers-container {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  z-index: 10;
}
.map-sublayers-item {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: white;
  background-color: rgba(0, 0, 0, 0.336);
  display: flex;
  align-items: center;
  margin: 1px 0;
}
.map-sublayers-item-title {
  color: white;
}
</style>
