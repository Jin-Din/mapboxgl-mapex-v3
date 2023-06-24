<template>
  <div class="sceneview-container">
    <div class="scene-item" v-for="scene in scenes" :key="scene.id + scene.title" @click="handleNavToScene(scene)">
      <el-icon size="24" color="white">
        <svg
          t="1685437805646"
          class="icon"
          viewBox="0 0 1024 1024"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          p-id="1850"
          width="48"
          height="48"
        >
          <path
            d="M885.32 288.06H736.17v-74.69c0-41.27-33.64-74.68-74.91-74.68H362.74c-41.27 0-74.68 33.42-74.68 74.68v74.69H138.69c-41.27 0-74.69 33.42-74.69 74.46v448.11c0 41.49 33.42 74.68 74.69 74.68h746.63c41.27 0 74.68-33.19 74.68-74.68V362.52c0-41.05-33.42-74.46-74.68-74.46zM181.75 437.2c-20.63 0-37.45-16.6-37.45-37.23 0-20.63 16.82-37.46 37.23-37.46 20.63 0 37.45 16.82 37.45 37.46s-16.82 37.23-37.23 37.23z m330.36 388.01c-130.75 0-237.74-106.98-237.74-238.18 0-131.21 106.53-237.29 237.74-237.29s237.74 106.08 237.74 237.29c-0.45 131.64-106.53 238.18-237.74 238.18z"
            fill="#ffffff"
            p-id="1851"
          ></path>
          <path
            d="M512.11 474.43c-62.35 0-113.04 50.46-113.04 112.81S449.76 700.5 512.11 700.5s112.81-50.69 113.04-113.26c0-62.34-50.69-112.81-113.04-112.81z"
            fill="#ffffff"
            p-id="1852"
          ></path>
        </svg>
      </el-icon>
      <div style="margin-left: 4px">{{ scene.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
//@名称:
//@作者:
//@日期:
//@说明:
import { Map } from "@lib/mapEx";
// import { Map } from "@jindin/mapboxgl-mapex";
import { ref } from "vue";
// import { usePubStore } from "@/store";
// const pubStore = usePubStore();

interface ISMapScene {
  id: number;
  title: string;
  image: string;
  description: string;
  view: ISView;
}

interface ISView {
  center: [number, number];
  pitch: number;
  zoom: number;
  bearing: number;
}

interface ISProps {
  map: Map;
}

const props = defineProps<ISProps>();
const scenes = ref<ISMapScene[]>([]);

onMounted(async () => {
  // let [error, result] = await useTryCatchPromise(axios.get("/configs/scenes.json"));
  // if (result) {
  //   scenes.value = result.data;
  // }

  scenes.value = [
    {
      id: 1,
      title: "视点1",
      image: "",
      description: "",
      view: {
        center: [108.5260539342836, 33.95205438352636],
        pitch: 60.29,
        zoom: 15.29,
        bearing: 172.61,
      },
    },
    {
      id: 2,
      title: "视点2",
      image: "",
      description: "",
      view: { center: [108.50154196077403, 33.85370392564051], pitch: 67.27, zoom: 15.2, bearing: 167.76 },
    },
    {
      id: 3,
      title: "视点3",
      image: "",
      description: "",
      view: { center: [108.82048596831692, 34.01434891860073], pitch: 61.09, zoom: 15.76, bearing: 154.16 },
    },
    {
      id: 4,
      title: "视点4",
      image: "",
      description: "",
      view: { center: [108.61821967605044, 33.909189466741715], pitch: 53.54, zoom: 11.09, bearing: 25.58 },
    },
    {
      id: 5,
      title: "视点5",
      image: "",
      description: "",
      view: { center: [108.50154196077403, 33.85370392564051], pitch: 67.27, zoom: 9.2, bearing: 167.76 },
    },
  ];
});

const easingFunctions = {
  easing: function (t: number) {
    return t;
  },
  // start slow and gradually increase speed
  easeInCubic: function (t: number) {
    return t * t * t;
  },
  // start fast with a long, slow wind-down
  easeOutQuint: function (t: number) {
    return 1 - Math.pow(1 - t, 5);
  },
  // slow start and finish with fast middle
  easeInOutCirc: function (t: number) {
    return t < 0.5 ? (1 - Math.sqrt(1 - Math.pow(2 * t, 2))) / 2 : (Math.sqrt(1 - Math.pow(-2 * t + 2, 2)) + 1) / 2;
  },
  // fast start with a "bounce" at the end
  easeOutBounce: function (t: number) {
    var n1 = 7.5625;
    var d1 = 2.75;

    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
};
const handleNavToScene = (scene: ISMapScene) => {
  if (props.map) {
    // console.log("aaaa");

    let { center, zoom, pitch = 0, bearing = 0 } = scene.view;
    console.log(`${center}-${zoom}-${pitch}-${bearing}`);

    props.map.flyTo({
      center,
      zoom,
      pitch,
      bearing,

      duration: 2000, // Animate over 2 seconds
      essential: true, // This animation is considered essential with respect to prefers-reduced-motion
      //animate: true,
      //@ts-ignore
      // preloadOnly: true,
      // curve: 1,
      // speed: 0.8,
      easing: easingFunctions.easing,
    });

    // props.map.easeTo({
    //   center,
    //   zoom,
    //   pitch,
    //   bearing,
    //   duration: 5000, // Animate over 5 seconds
    //   essential: true, // This animation is considered essential with respect to prefers-reduced-motion
    //   animate: true,

    //   //@ts-ignore
    //   curve: 1.2,
    //   speed: 0.2,
    //   easing: easingFunctions.easeOutQuint,
    // });
  }
};
</script>

<style scoped lang="less">
.sceneview-container {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 4px;

  .scene-item {
    cursor: pointer;
    display: flex;
    align-items: center;
    font-size: 16px;
    color: white;
    padding: 8px 2px;

    &:hover {
      background-color: rgba(255, 255, 255, 0.103);
    }
  }
}
</style>
