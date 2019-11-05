## 核心概念
* Entry：入口，Webpack执行构建的第一步将从Entry开始，可抽象成输入；
* Module：模块，在Webpack里一切皆模块，一个模块对应一个文件。Webpack会从配置的Entry开始递归找出所有依赖的模块；
* Chunk：代码块，一个Chunk由多个模块组合而成，用于代码的合并与分割；
* Loader：模块转换器，用于将模块的原内容按需求转换为新内容；
* Plugin：扩展插件，在Webpack构建流程中的特定时机注入扩展逻辑，来改变构建结果或做我们想要的事情；
* Output：输出结果，在Webpack经过一系列处理并得出最终想要的代码后输出结果。          
## 选项
1. 使用DevServer    
在实际开发中，可能需要：    
* 提供HTTP服务而不是提供本地预览；
* 监听文件变化并实时刷新页面，做到实时预览；
* 支持Source Map，以方便调试。       
其中第2、3点是Webpack原生支持的。使用官方提供的DevServer可以做到第1点。       
```
npm i -D webpack-dev-server
webpack-dev-server
```
2. 实时预览
```
webpack --watch
```
3. 模块热替换
在启动DevServer时带上--hot参数。
4. 支持Source Map
启动时带上--devtool source-map      
## webpack4
### 提取公共代码
CommonsChunkPlugin -> splitChunks    
CommonsChunkPlugin插件现在已经不再支持，改用splitChunks，将多个文件中都引用的公共代码打包成一个单独的文件。     
[一步一步的了解webpack4的splitChunk插件](https://juejin.im/post/5af1677c6fb9a07ab508dabb)       
### 懒加载
```
async function getStudent(){
    const {default: Student} = await import('./src/student.js');
    let lily = new Student('Lily', 18, 4);
    lily.gotoSchool();
}

setTimeout(() => {
    getStudent();
}, 1000);
```     
需要用到babel插件dynamic-import-webpack。
需要使用html-webpack-plugin插件，否则路径很容易出错。      
其原理就是新建一个script标签插入到body，用于加载js文件。       
### 输出路径带hash
```
output: {
    path: __dirname + '/build',
    filename: '[name].[hash:8].js'
},
```       
### 缓存
```
optimization: {
    splitChunks: {
        name: 'vendor',
        cacheGroups: {
            commons: {
                chunks: "initial",
                minChunks: 2,
                maxInitialRequests: 5, // The default limit is too small to showcase the effect
                minSize: 0 // This is example is too small to create commons chunks
            }
        }
    },
    runtimeChunk: {
        name: "manifest",
    },
},
```     
上面配置中文件名加上hash后，在内容或是文件修改时，文件名就会发生改变，从而使缓存失效。但是我们更新代码通常是更新业务代码，一些第三方的依赖库是很少变化的，对于这一部分文件，应该使用缓存，这时就需要借助上面的配置。注意文件名上的hash要写成chunkhash。       
#### manifest和runtime
runtime，以及伴随的 manifest 数据，主要是指：在浏览器运行时，webpack 用来连接模块化的应用程序的所有代码。runtime 包含：在模块交互时，连接模块所需的加载和解析逻辑。包括浏览器中的已加载模块的连接，以及懒加载模块的执行逻辑。       
**缓存的原理:将runtime提取到一个单独的文件，以免它影响vendor的chunkhash。**
一个典型的webpack项目打包出来会包含vendor.js(公共代码)和bundle.js(业务代码)两个部分。     
webpack每次打包时都会生成一些webpack runtime代码，来帮助webpack完成其工作。当只有一个bundle时，runtime代码就打到这个bundle中。当有多个bundle时，runtime代码会被提取到公共的vendor.js中。这些runtime代码会影响vendor的hash值，导致每次的chunkhash不同，文件名发生变化。      
上面的配置将runtime单独打包出来到manifest.js，从而消除了runtime代码对vendor的影响。      
npm install node-sass --unsafe-perm=true --allow-root 
