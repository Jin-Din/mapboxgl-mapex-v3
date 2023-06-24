## 创建初始化

```
npm init -y // -y 代表默认配置
```

## 支持 typescript

### 全局安装

```
$ npm i typescript -g
```

### 创建 tsconfig.json

```
npx tsc --init
```

## 一些常用命令

### git

#### 上传到 github

```
git push origin master

```

1、在本地创建一个版本库（即文件夹），通过 git init 把它变成 Git 仓库；

     2、把项目复制到这个文件夹里面，再通过git add .把项目添加到仓库；

     3、再通过git commit -m "注释内容"把项目提交到仓库；

     4、在Github上设置好SSH密钥后，新建一个远程仓库，通过git remote add origin https://github.com/guyibang/TEST2.git将本地仓库和远程仓库进行关联；

     5、最后通过git push -u origin master把本地仓库的项目推送到远程仓库（也就是Github）上。

### 5、添加用户

指令：npm adduser
注：一定要在第一步中注册了账号才行。否则会报错无法继续。

cmd 会弹出以下：
Username:输入用户名
Password:输入密码，这里是不显示的，不用担心，正常输入
Email:输入邮箱
Enter one-time password:输入发到邮箱的验证码

### 6、查看是否成功

指令：npm who am i
出现自己添加的账号即表示成功。

### 7、上传自己的包

因为第三步添加了 index.js 文件，所以执行命令
指令：npm publish
命令行修改版本
npm version patch
它会将 package.json 中的 version 版本加 0.0.1

## 其他

### 打包成 tgz

npm pack

### 重新发包

npm publish

### 删除指定包版本

npm unpublish 【包名@版本号】

### 删除整个包

npm unpublish 【包名】 --force

### npm publish 提示 You must sign up for private packages

当你的包名为@your-name/your-package 时才会出现，原因是当包名以@your-name 开头时，npm publish 会默认发布为私有包，但是 npm 的私有包需要付费
因此需要在发布的时候增加 --access public

```
npm publish --access public
```

## 如何发布用户需要使用的相关文件呢？

### 方法一：使用 .gitignore 设置忽略哪些文件

.gitignore 设置的忽略文件，在 git 代码管理和 npm publish 都会被忽略

### 方法二：使用 .npmignore 设置忽略哪些文件

.npmignore 的写法跟**.gitignore** 的规则完全一样。若同时使用了**.npmignore 和.gitignore**，只有**.npmignore**会生效，优先级比较高

### 方法三：使用 package.json 的 files 字段选择发布哪些文件【推荐】

在 package.json 中 files 字段设置发布哪些文件或目录。这个优先级高于 .npmignore 和 .gitignore

```
{
  "name": "sxgis-poi",
  "version": "0.0.3",
  "description": "",
  "main": "dist/poi/index.js",
  "types": "dist/poi/index.d.ts",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "build": "tsc",
    "release": "tsc && npm publish --access public"
  },
  //这里只发布dist文件夹下的内容
  "files": [
    "dist"
  ],
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "axios": "^1.3.6",
    "mapbox-gl": "^2.14.1",
    "vue": "^3.2.47"
  }
}
```

### npm publish 默认的忽略规则

默认被忽略：

.\*.swp

.\_\*

.DS_Store

.git

.hg

.npmrc

.lock-wscript

.svn

.wafpickle-\*

config.gypi

CVS

npm-debug.log

node_modules/

默认被包含，即便设置忽略也无效

package.json

README (and its variants)

CHANGELOG (and its variants)

LICENSE / LICENCE

## npm 包本地测试

以下 NPM 包开发项目称为 项目 A ，引用 npm 包的项目称为 项目 B。

### 2.1. 将 npm 包文件引入项目

两种测试方式，具体介绍如下：

第一种：使用 npm link 命令关联依赖包使用

a. 在 项目 A 的根目录下使用 npm link 命令将 npm 包模块注册到全局，在全局的 node_modules 目录下会出现当前包所在项目的快捷方式引用。

```E:\PersonalProject\ts-utils>npm link
audited 1 package in 1.121s
found 0 vulnerabilities

C:\Users\zhang\AppData\Roaming\npm\node_modules\ts-utils -> E:\PersonalProject\ts-utils

E:\PersonalProject\ts-utils>
```

b. 在 项目 B 的根目录下使用 npm link package-name 命令将包关联到项目中，然后正常使用即可。

```E:\PersonalProject\tsom-login>npm link ts-utils
E:\PersonalProject\tsom-login\node_modules\ts-utils -> C:\Users\zhang\AppData\Roaming\npm\node_modules\ts-utils -> E:\PersonalProject\ts-utils

E:\PersonalProject\tsom-login>
```

注意： 在 项目 B 的 package.json 文件中加入依赖包，例如在 dependencies 项中加入以下依赖：

```
"ts-utils": "1.0.0"
```

此处的包名称和版本号对应 npm 包中 package.json 中定义的包名和版本号。

⚠ 注意： 如果不加此依赖项，会出现包无法引入，报错的情况。

测试没问题后，在 项目 A 的根目录下使用 npm unlink 命令解除项目与全局的关联。在 项目 B 的根目录下使用 npm unlink package-name 命令解除项目与本地 npm 包的关联。

第二种：复制 npm 包 整个文件夹到 项目 B 的 node_modules 目录下，在 package.json 中添加依赖项。

### 2.2. npm 包功能测试

方法调用有以下两种方式：

1️⃣ 支持直接使用方法名称调用对应方法

```
import { arrayCheck } from 'ts-utils';

console.log(arrayCheck(undefined));     // []
console.log(arrayCheck([]));            // []
```

2️⃣ 可以使用类名.方法名调用

```
import { ArrayUtils } from 'ts-utils';

console.log('arrayCheck ==? ', ArrayUtils.arrayCheck(undefined));   // []
console.log('arrayCheck ==? ', ArrayUtils.arrayCheck([1, 2, 3]));   // [1, 2, 3]
```
