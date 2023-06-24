import { PluginOption, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import dts from "vite-plugin-dts";
import { obfuscator } from "rollup-obfuscator";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";
export default defineConfig(({ command, mode }) => {
  return {
    server: {
      host: "0.0.0.0",
    },
    resolve: {
      alias: {
        "@lib": resolve(__dirname, "lib"),
        "@src": resolve(__dirname, "src"),
        "@public": resolve(__dirname, "public"),
        "@": resolve(__dirname, "src"),
        "@assets": resolve(__dirname, "src/assets"),
      },
    },
    plugins: [
      vue(),
      dts({
        insertTypesEntry: true,
        copyDtsFiles: false,
      }),
      codeObfuscator(command === "build"),
      // codeObfuscatorPlugin(command === "build"),

      AutoImport({
        imports: [
          "vue",
          "vue-router",
          "pinia",
          // custom
          {
            axios: [
              // default imports
              ["default", "axios"], // import { default as axios } from 'axios',
            ],
          },
        ],
        // Auto import for module exports under directories
        // by default it only scan one level of modules under the directory
        // 本项目中的文件夹
        dirs: [
          "./src/hooks/**",
          "./src/utils/**",
          // './composables' // only root modules
          // './composables/**', // all nested modules
          // ...
        ],

        resolvers: [],
        //生成 `auto-import.d.ts` 全局声明
        dts: "src/types/auto-import.d.ts",
      }),
      Components({
        resolvers: [ElementPlusResolver()],
        //生成 `auto-import-components.d.ts` 全局声明
        dts: "src/types/auto-import-components.d.ts",
      }),
    ],
    build: {
      lib: {
        // 入口指向组件库入口模块
        entry: resolve(__dirname, "lib/index.ts"),
        name: "mapEx",
        // 构建生成的文件名，与package.json中配置一致
        fileName: "index",
      },

      rollupOptions: {
        // 确保外部化处理那些你不想打包进库的依赖
        external: ["element-plus"],

        output: {
          // format: 'es', // 默认es，可选 'amd' 'cjs' 'es' 'iife' 'umd' 'system'
          exports: "named", // https://rollupjs.org/configuration-options/#output-exports
          globals: {
            // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
            vue: "Vue",
          },
        },
      },
      /** 设置为 false 可以禁用最小化混淆，或是用来指定使用哪种混淆器。
        默认为 Esbuild，它比 terser 快 20-40 倍，压缩率只差 1%-2%。
        注意，在 lib 模式下使用 'es' 时，build.minify 选项不会缩减空格，因为会移除掉 pure 标注，导致破坏 tree-shaking。
        当设置为 'terser' 时必须先安装 Terser。（yarn add terser -D）
    */
      // minify: "terser", //"terser", // Vite 2.6.x 以上需要配置 minify: "terser", terserOptions 才能生效
      // terserOptions: {
      //   // 在打包代码时移除 console、debugger 和 注释
      //   compress: {
      //     /* (default: false) -- Pass true to discard calls to console.* functions.
      //         If you wish to drop a specific function call such as console.info and/or
      //         retain side effects from function arguments after dropping the function
      //         call then use pure_funcs instead
      //       */
      //     // 生产环境时移除console
      //     drop_console: command === "build",
      //     drop_debugger: command === "build",
      //   },
      //   format: {
      //     comments: false, // 删除注释comments
      //   },
      // },
    },
  };
});

/**
 * 代码混淆
 * 起作用，可进一步完善
 * @param isBuild
 * @returns
 */
function codeObfuscator(isBuild: boolean) {
  if (!isBuild) {
    return [];
  }
  return obfuscator({
    globalOptions: {
      debugProtection: true,
      debugProtectionInterval: 2000,
      transformObjectKeys: true,
      unicodeEscapeSequence: true,
      numbersToExpressions: true,
      shuffleStringArray: true,
      splitStrings: true,
      stringArray: false,
      stringArrayThreshold: 1,
      identifierNamesGenerator: "hexadecimal",
    },
  });
}

/**
 *
 * 不起作用
 * @param isBuild
 * @returns
 */
function codeObfuscatorPlugin(isBuild: boolean): PluginOption {
  if (!isBuild) {
    return [];
  }

  const options1 = {
    compact: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.75,
    deadCodeInjection: true,
    deadCodeInjectionThreshold: 0.4,
    debugProtection: false,
    debugProtectionInterval: 0,
    disableConsoleOutput: true,
    identifierNamesGenerator: "hexadecimal",
    log: false,
    renameGlobals: false,
    rotateStringArray: true,
    selfDefending: true,
    stringArray: true,
    stringArrayEncoding: ["base64"],
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false,
  };
  const options = {
    rotateUnicodeArray: true, // 必须为true
    compact: true, // 紧凑 从输出混淆代码中删除换行符。
    controlFlowFlattening: true, // 此选项极大地影响了运行速度降低1.5倍的性能。 启用代码控制流展平。控制流扁平化是源代码的结构转换，阻碍了程序理解。
    controlFlowFlatteningThreshold: 0.8,
    deadCodeInjection: true, // 此选项大大增加了混淆代码的大小（最多200％） 此功能将随机的死代码块（即：不会执行的代码）添加到混淆输出中，从而使得更难以进行反向工程设计。
    deadCodeInjectionThreshold: 0.5,
    debugProtection: false, // 调试保护  如果您打开开发者工具，可以冻结您的浏览器。
    debugProtectionInterval: 0, // 如果选中，则会在“控制台”选项卡上使用间隔强制调试模式，这使得使用“开发人员工具”的其他功能变得更加困难。它是如何工作的？一个调用调试器的特殊代码;在整个混淆的源代码中反复插入。
    disableConsoleOutput: true, // 通过用空函数替换它们来禁用console.log，console.info，console.error和console.warn。这使得调试器的使用更加困难。
    domainLock: [], // 锁定混淆的源代码，使其仅在特定域和/或子域上运行。这使得有人只需复制并粘贴源代码并在别处运行就变得非常困难。多个域和子域可以将代码锁定到多个域或子域。例如，要锁定它以使代码仅在www.example.com上运行添加www.example.com，以使其在example.com的任何子域上运行，请使用.example.com。
    identifierNamesGenerator: "hexadecimal", // 标识符的混淆方式 hexadecimal(十六进制) mangled(短标识符)
    identifiersPrefix: "", // 此选项使所有全局标识符都具有特定前缀。
    inputFileName: "",
    log: false,
    renameGlobals: false, // 不要启动 通过声明启用全局变量和函数名称的混淆。
    reservedNames: [], // 禁用模糊处理和生成标识符，这些标识符与传递的RegExp模式匹配。例如，如果添加^ someName，则混淆器将确保以someName开头的所有变量，函数名和函数参数都不会被破坏。
    reservedStrings: [], // 禁用字符串文字的转换，字符串文字与传递的RegExp模式匹配。例如，如果添加^ some * string，则混淆器将确保以某些字符串开头的所有字符串都不会移动到`stringArray`。
    rotateStringArray: true, //
    seed: 0, // 默认情况下（seed = 0），每次混淆代码时都会得到一个新结果（即：不同的变量名，插入stringArray的不同变量等）。如果需要可重复的结果，请将种子设置为特定的整数。
    selfDefending: true, // 此选项使输出代码能够抵抗格式化和变量重命名。如果试图在混淆代码上使用JavaScript美化器，代码将不再起作用，使得理解和修改它变得更加困难。需要紧凑代码设置。
    sourceMap: false, // 请确保不要上传嵌入了内嵌源代码的混淆源代码，因为它包含原始源代码。源映射可以帮助您调试混淆的Java Script源代码。如果您希望或需要在生产中进行调试，可以将单独的源映射文件上载到秘密位置，然后将浏览器指向该位置。
    sourceMapBaseUrl: "", // 这会将源的源映射嵌入到混淆代码的结果中。如果您只想在计算机上进行本地调试，则非常有用。
    sourceMapFileName: "",
    sourceMapMode: "separate",
    stringArray: true, // 将stringArray数组移位固定和随机（在代码混淆时生成）的位置。这使得将删除的字符串的顺序与其原始位置相匹配变得更加困难。如果原始源代码不小，建议使用此选项，因为辅助函数可以引起注意。
    stringArrayEncoding: ["base64"], // 此选项可能会略微降低脚本速度。使用Base64或RC4对stringArray的所有字符串文字进行编码，并插入一个特殊的函数，用于在运行时将其解码回来。
    stringArrayThreshold: 0.8, // 您可以使用此设置调整字符串文字将插入stringArray的概率（从0到1）。此设置在大型代码库中很有用，因为对stringArray函数的重复调用会降低代码的速度。
    target: "browser", // 您可以将混淆代码的目标环境设置为以下之一： Browser 、Browser No Eval 、Node 目前浏览器和节点的输出是相同的。
    transformObjectKeys: true, // 转换（混淆）对象键。例如，此代码var a = {enabled：true};使用此选项进行模糊处理时，将隐藏已启用的对象键：var a = {};a [_0x2ae0 [（'0x0'）] = true;。 理想情况下与String Array设置一起使用。
    unicodeEscapeSequence: true, // 将所有字符串转换为其unicode表示形式。例如，字符串“Hello World！”将被转换为“'\ x48 \ x65 \ x6c \ x6c \ x6f \ x20 \ x57 \ x6f \ x72 \ x6c \ x64 \ x21”。
    // ... [See more](https://github.com/javascript-obfuscator/javascript-obfuscator)
  };
  const codeObfuscator = {
    ...obfuscatorPlugin({
      matchFile: (path: string) => {
        // If you want to exclude some files, you can return false
        // Example: Exclude files ending in foo.js, foo.ts, and foo.tsx
        if (/foo\.(js|tsx?)$/.test(path)) {
          return false;
        }
        // Customize your includes rules.
        return /\.(js|tsx?|cjs|mjs)$/.test(path);
      },
      options,
    }),
    // apply: 'build' // 仅在生产环境下使用
  };
  // console.log(codeObfuscator);
  return codeObfuscator;
}
