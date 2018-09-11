## 缩小文件搜索范围
### 优化loader配置。
Loader对文件的转换是webpack中最耗时的操作。可以通过test、include、exclude三个配置来命中Loader需要应用规则的文件。
### 优化resolve.modules配置。
resolve.modules用于配置webpack去哪些目录下查找第三方模块。如果所有安装的第三方模块都放在根目录下的./node_modules目录下时，可以采用绝对路径配置resolve.modules。
### 优化resolve.extensions配置
在导入语句没有带文件后缀时，webpack会自动带上后缀去尝试询问文件是否存在。resolve.extensions用于配置在尝试工程中用到的后缀列表。默认是：
```
extension: ['.js', '.json']
```
优化点：   
* 后缀尝试的列表尽可能小，不要将项目中不可能的情况写到后缀尝试列表中；
* 出现频率高的文件后缀放在前面；
* 在源码中写导入语句时尽量带上文件后缀。    
### 优化module.noParse配置   
module.noParse配置项可以让webpack忽略对部分没有采用模块化的文件的递归解析处理，如jquery。被忽略掉的文件里面不应该包含require、import、define等模块化语句，不然会导致构建出的代码包含在浏览器环境下无法执行的模块化语句。         
## HappyPack
可以让webpack将任务分配给多个子进程去执行，子进程执行完成之后再将结果发送给主进程。     
## ParallelUglifyPlugin   
webpack内置UglifyJS可以压缩js文件，但是这一过程是非常耗时的。可以使用ParallelUglifyPlugin，开启多个子进程来对js文件进行压缩。       
## 使用自动刷新   
### 文件监听
原理：定时获取一个文件最后编辑的时间，每次都存下最新的最后编辑时间，如果发现当前获取的和最后一次保存的最后编辑时间不一样，就认为该文件发生了变化。当发现某个文件发生了变化，并不会立刻告诉监听者，而是先缓存起来，收集一段时间的变化之后，再一次性告诉监听者。    
如何开启监听模式：
1. 在配置文件webpack.config.js中设置watch: true
2. 在执行webpack时带上参数--watch    
可以配置watchOptions.poll用于控制定期检查的周期，具体含义是每秒检查多少次；可以配置watchOptions.aggregateTimeout来配置缓存的等待时间。       
### 模块热替换   
```
webpack-dev-server --hot
```
## 区分环境
1. 使用shell脚本
```
set NODE_ENV=development&&webpack
```
2. 使用DefinePlugin插件    
## 压缩代码
1. 压缩js
2. 压缩css，用cssnano插件。css-loader内置了cssnano插件，只需要开启css-loader的minimize选项即可。      
## Tree Shaking
可以剔除JavaScript上不用的死代码。它依赖静态的ES6模块化语法，故只对采用ES6模块规范的代码有效。   
## 提取公共代码
## 分割代码和按需加载
## Scope Hosting
作用域提升。其原理是分析模块之间的依赖关系，尽可能将被打散的模块合并到一个函数中，但前提是不能造成代码冗余。因此只有被引用了一次的模块才能被合并。它依赖静态的ES6模块化语法，故只对采用ES6模块规范的代码有效。

