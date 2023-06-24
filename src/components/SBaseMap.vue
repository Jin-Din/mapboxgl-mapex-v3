<template>
  <div style="position: relative; width: 100%; height: 100%">
    <!--转圈动画-->
    <!-- <div class="circle-img"></div> -->
    <div :id="props.mapID" style="width: 100%; height: 100%"></div>
    <!-- <div class="mask"></div> -->
    <slot :map="map" :mapConfig="mapConfig"></slot>
    <div class="left-top">
      <slot name="left-top" :map="map" :mapConfig="mapConfig"></slot>
    </div>
    <div class="right-bottom">
      <slot name="right-bottom" :map="map" :mapConfig="mapConfig"></slot>
    </div>
    <div class="left-bottom">
      <slot name="left-bottom" :map="map" :mapConfig="mapConfig"></slot>
    </div>
    <div class="right-top">
      <slot name="right-top" :map="map" :mapConfig="mapConfig"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
//@名称:
//@作者: Jin
//@日期:
//@说明: 利用 solt 实现 SMap 组件
import axios from "axios";
// import { Map } from "@jindin/mapboxgl-mapex";
// import { createMap, ISMapConfig, switchBaseMap, resetBaseMap } from "@jindin/mapboxgl-mapex";
import { Map } from "@lib/mapEx";
import { createMap, ISMapConfig, switchBaseMap, resetBaseMap } from "@lib/index";
import { onMounted, ref } from "vue";
import useTryCatchPromise from "../hooks/useTryCatchPromise";
// import mapboxgl from "../mapEx/index";

const { mapboxgl } = window;
mapboxgl.accessToken = "pk.eyJ1Ijoib25lZ2lzZXIiLCJhIjoiY2plZHptcnVuMW5tazMzcWVteHM2aGFsZiJ9.ERWP7zZ-N6fmNl3cRocJ1g";

let map = ref<Map>();

let mapConfig = ref<ISMapConfig>();

interface ISProps {
  mapID?: string;
  config: string | ISMapConfig;
  basemapId?: string;
}

const props = withDefaults(defineProps<ISProps>(), {
  mapID: "smap",
  config: "/configs/map.json",
  basemapId: "",
});

const emits = defineEmits<{
  (e: "onMapLoaded", map: Map): void;
}>();

onMounted(async () => {
  //抓取map.json
  if (typeof props.config === "string") {
    let [error, result] = await useTryCatchPromise(axios.get(props.config + `?t=${new Date().getTime()}`));
    if (error) throw new Error("map.json 获取失败！");
    mapConfig.value = result.data;
  } else mapConfig.value = props.config;

  mapConfig.value = props.mapID ? { ...mapConfig.value, container: props.mapID } : mapConfig.value;

  map.value = await createMap(mapConfig.value!, props.basemapId);

  map.value.on("load", () => {
    // switchBaseMap("tdtsx_img");
    emits("onMapLoaded", map.value as Map);

    console.log(map.value!.getStyle());
  });
});
</script>

<style scoped lang="less">
.circle-img {
  animation: rotation 60s linear infinite;
  -moz-animation: rotation 60s linear infinite;
  -webkit-animation: rotation 60s linear infinite;
  -o-animation: rotation 60s linear infinite;
}
.left-top {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 3;
}
.right-bottom {
  position: absolute;
  right: 0;
  bottom: 0;
}

.left-bottom {
  position: absolute;
  left: 0;
  bottom: 0;
}
.right-top {
  position: absolute;
  right: 0;
  top: 0;
}
</style>
