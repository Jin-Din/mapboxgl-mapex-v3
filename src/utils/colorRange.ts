/**
 * 将hex表示方式转换为rgb
 * @param {String} hexColor 颜色十六进制
 * @return {Array} [r, g, b]格式
 */
export function colorToRgb(hexColor: string): any {
  let reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  let sColor = hexColor.toLowerCase();
  if (sColor && reg.test(sColor)) {
    if (sColor.length === 4) {
      let sColorNew = "#";
      for (let i = 1; i < 4; i += 1) {
        sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
      }
      sColor = sColorNew;
    }
    //处理六位的颜色值
    let sColorChange: number[] = [];
    for (let i = 1; i < 7; i += 2) {
      sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
  } else {
    return sColor;
  }
}
/**
 * 生成渐变颜色值数组
 * @param {String} startColor 开始颜色值（十六进制）
 * @param {String} endColor 结束颜色值（十六进制）
 * @param {Number} count 生成颜色个数
 * @param {Number} step 生成步数
 * @return {Array} 渐变颜色数组
 */
export function gradientColor(startColor: string, endColor: string, count: number, step: number): string[] {
  let startRGB = colorToRgb(startColor), //转换为rgb数组模式
    startR = startRGB[0],
    startG = startRGB[1],
    startB = startRGB[2];

  let endRGB = colorToRgb(endColor),
    endR = endRGB[0],
    endG = endRGB[1],
    endB = endRGB[2];

  let sR = (endR - startR) / step, //总差值
    sG = (endG - startG) / step,
    sB = (endB - startB) / step;

  let generateRStr = (r: any, g: any, b: any) => {
    return "rgb(" + parseInt(r) + "," + parseInt(g) + "," + parseInt(b) + ")";
  };

  let colorArr: string[] = [];
  for (let i = 0; i < step; i++) {
    // 计算每一步的rgb值
    if (count % 2 !== 0 && i == 0) {
      colorArr.push(generateRStr(startR, startG, startB));
    } else if (count % 2 !== 0 && i == step - 1) {
      colorArr.push(generateRStr(endR, endG, endB));
    } else {
      colorArr.push(generateRStr(sR * i + startR, sG * i + startG, sB * i + startB));
    }
  }
  return colorArr;
}
/**
 * 根据一组颜色生成渐变色
 * @param {Array} colorArr 颜色数组
 * @param {Number} count 生成颜色个数
 */
export function multipleGradientColor(colorArr: Array<any> = [], count: number = 5): string[] {
  let arr: string[] = [],
    cLen = colorArr.length;
  if (count === 1) return [colorArr[0]];
  if (count === 2) return [colorArr[0], colorArr[cLen - 1]];

  let devid = Math.ceil(count / (cLen - 1)); // 每两个渐变色产生的颜色个数
  for (let i = 0, len = cLen - 1; i < len; i++) {
    arr.push(...gradientColor(colorArr[i], colorArr[i + 1], count, devid));
  }
  let removeLen = arr.length - count;
  if (removeLen > 0) {
    // 移除多余 count 的颜色
    for (let j = removeLen; j > 0; j--) {
      arr.splice(j * devid, 1);
    }
  }

  return arr;
}

/**
 * 判断颜色是否为浅色系
 * @param {String} rgbColor rgb颜色值
 * @return {Boolean} 返回 true or false
 */
export function isLightColor(rgbColor: string): boolean {
  let split: any[] = rgbColor.replace(/(?:\(|\)|rgb|RGB)*/g, "").split(",");
  let level: number = split[0] * 0.299 + split[1] * 0.587 + split[2] * 0.114;
  if (level >= 192) {
    return true;
  }
  return false;
}

interface ISStopColor {
  stop: number;
  color: string;
}
/**
 * 颜色插值函数 InterpolateColor
 * @param inputStopColors 传入指定的色阶值 {
      stop: 0,
      color: "red",
    },
    {
      stop: 0.4,
      color: "yellow",
    },
    {
      stop: 1,
      color: "lime",
    },
 * @returns
 */
export const useInterpolateColor = (inputStopColors?: ISStopColor[]) => {
  let stopColors = inputStopColors ?? [
    {
      stop: 0,
      color: "red",
    },
    {
      stop: 0.4,
      color: "yellow",
    },
    {
      stop: 1,
      color: "lime",
    },
  ];
  //通过canvas获取开始颜色和结束颜色：
  //原理是利用canvas创建一个线性渐变色对象，再通过计算颜色所在的位置去用getImageData获取颜色，最后返回这个颜色
  //1.创建canvas
  var canvas = document.createElement("canvas");
  canvas.width = 101;
  canvas.height = 1;
  var ctx = canvas.getContext("2d");
  //2.创建线性渐变的函数，该函数会返回一个线性渐变对象，参数0,1,101,1分别指：渐变的起始点x，y和渐变的终止点x，y
  var grd = ctx!.createLinearGradient(0, 1, 101, 1);
  //3.给线性渐变对象添加颜色点的函数，参数分别是停止点、颜色
  stopColors.forEach((stopColor) => {
    grd.addColorStop(stopColor.stop, stopColor.color);
  });
  // grd.addColorStop(0, "red");
  // grd.addColorStop(0.8, "yellow");
  // grd.addColorStop(1, "lime");
  //4.给canvas填充渐变色
  ctx!.fillStyle = grd;
  ctx!.fillRect(0, 0, 101, 1);
  //5.返回渐变色的函数
  /**
   * 获取渐变色
   * @param r 百分比小数，如 0.1,,0.34
   * @returns
   */
  function getColor(r: number) {
    //6.这里是渐变色的精细度，我将canvas分成101份来取值，每一份都会有自己对应的颜色
    //声明的变量x就是我们需要的颜色在渐变对象上的位置
    let x = r * 100;
    x > 100 ? (x = 100) : (x = x);
    //7.传入插值颜色所在的位置x，通过canvas的getImageData方法获取颜色
    var colorData = ctx!.getImageData(x, 0, 1, 1).data;
    //8.返回这个颜色
    return `rgba(${colorData[0]},${colorData[1]},${colorData[2]},${colorData[3]})`;
  }

  return {
    getColor,
  };
};
