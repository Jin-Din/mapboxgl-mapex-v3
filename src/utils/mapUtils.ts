import type { Map, AnyLayer, AnySourceData } from "mapbox-gl";

export default (mapInstance: Map) => {
  const map = mapInstance;
  /**
   * [自定义方法]一次性加入source 和 layer
   * @param sourceId
   * @param source
   * @param layer
   * @param beforeId
   */
  function addSourceAndLayer(sourceId: string, source: AnySourceData, layer: AnyLayer, beforeId?: string) {
    if (!map.getSource(sourceId)) map.addSource(sourceId, source);
    if (!map.getLayer(layer.id)) map.addLayer(layer, beforeId);
  }
  return { addSourceAndLayer };
};
