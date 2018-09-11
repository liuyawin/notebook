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
