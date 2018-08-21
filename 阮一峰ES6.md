## let和const       
### let     
1. 块级作用域     
2. 不存在变量提升，只能在声明的位置后面使用      
3. 暂时性死区：只要块级作用域内存在let命令，它所声明的变量就“绑定”这个区域，不再受外部影响。     
```    
let tmp = 13;    
{    
    tmp = 'abc';//RefrenceError
    let tmp;
}
```     
4. 不允许重复声明    
     
### const
const声明一个只读常量，一旦声明，其值就不会改变。改变常量的值会引发报错。      
const声明的变量不得改变值，这意味着，const一旦声明变量，就必须立即初始化，不能留到以后赋值。     
const也存在块级作用域、不能提升、存在暂时性死区、不可重复声明。      
      
由var和function声明的全局变量是全局对象的属性，由let和const声明的全局变量不是全局对象的属性。    
       
## 变量的解构赋值
```
let [a, b, c] = [1, 2, 3];

let [foo, [[bar], baz]] = [1, [[2], 3]];
foo // 1
bar // 2
baz // 3

let [ , , third] = ["foo", "bar", "baz"];
third // "baz"

let [x, , y] = [1, 2, 3];
x // 1
y // 3

let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

## 模块
CommonJS、AMD与ES6的模块：    
CommonJS适用于服务器，AMD适用于浏览器。        
ES6：静态化，**编译时加载**，编译时就能确定模块的依赖关系，以及输入输出变量，这使得静态类型检查成为可能，而且编译时就能完成模块加载，效率高。而CommonJS和AMD模块是**运行时加载**，都只能在运行时确定这些东西。      
ES6 模块不是对象，而是通过export命令显式指定输出的代码，再通过import命令输入。      
ES6模块默认使用严格模式。           
       
严格模式主要有以下限制：              
变量必须声明后再使用           
函数的参数不能有同名属性，否则报错           
不能使用with语句            
不能对只读属性赋值，否则报错             
不能使用前缀 0 表示八进制数，否则报错            
不能删除不可删除的属性，否则报错           
不能删除变量delete prop，会报错，只能删除属性delete global[prop]            
eval不会在它的外层作用域引入变量           
eval和arguments不能被重新赋值            
arguments不会自动反映函数参数的变化           
不能使用arguments.callee           
不能使用arguments.caller            
禁止this指向全局对象           
不能使用fn.caller和fn.arguments获取函数调用的堆栈           
增加了保留字（比如protected、static和interface）            
          
### export
模块功能主要由两个命令构成：export和import。export命令用于规定模块的对外接口，import命令用于输入其他模块提供的功能。      
一个模块就是一个独立的文件。该文件内部的所有变量，外部无法获取。如果你希望外部能够读取模块内部的某个变量，就必须使用export关键字输出该变量。           
export命令除了输出变量，还可以输出函数或类（class）。           
通常情况下，export输出的变量就是本来的名字，但是可以使用as关键字重命名。            
export语句输出的接口，与其对应的值是动态绑定关系，即通过该接口，可以取到模块内部实时的值。而CommonJS 模块输出的是值的缓存，不存在动态更新。                 
export命令可以出现在模块的任何位置，只要处于模块顶层就可以。如果处于块级作用域内，就会报错。             
### import
如果想为输入的变量重新取一个名字，import命令要使用as关键字，将输入的变量重命名。      
import命令输入的变量都是只读的，因为它的本质是输入接口。也就是说，不允许在加载模块的脚本里面，改写接口。          
import后面的from指定模块文件的位置，可以是相对路径，也可以是绝对路径，.js后缀可以省略。           
import命令具有提升效果，会提升到整个模块的头部，**首先执行**。import命令会被JavaScript引擎静态分析，先于模块内的其他语句执行。               
由于import是静态执行，所以不能使用表达式和变量，这些只有在运行时才能得到结果的语法结构。            
import语句会执行所加载的模块，如果多次重复执行同一句import语句，那么只会执行一次，而不会执行多次。        
                             
除了指定加载某个输出值，还可以使用整体加载，即用星号（*）指定一个对象，所有输出值都加载在这个对象上面。            
可以使用export default命令，为模块指定默认输出。一个模块只能有一个默认输出，因此export default命令只能使用一次。
            
### 浏览器加载模块            
默认情况下，浏览器同步加载JS脚本，即渲染引擎遇到script标签就会停下来，等到执行完脚本，再继续向下渲染。如果是外部脚本，还必须加入脚本下载的时间。如果脚本很大就会造成浏览器卡顿。可以使用defer和async使得脚本异步加载。defer与async的区别是：defer要等到整个页面在内存中正常渲染结束（DOM 结构完全生成，以及其他脚本执行完成），才会执行；async一旦下载完，渲染引擎就会中断渲染，执行这个脚本以后，再继续渲染。一句话，defer是“渲染完再执行”，async是“下载完就执行”。另外，如果有多个defer脚本，会按照它们在页面出现的顺序加载，而多个async脚本是不能保证加载顺序的。                  
浏览器加载 ES6 模块，也使用script标签，但是要加入type="module"属性。          
浏览器对于带有type="module"的script，都是异步加载，不会造成堵塞浏览器，即等到整个页面渲染完，再执行模块脚本，等同于打开了script标签的defer属性。
如果网页有多个script type="module"，它们会按照在页面出现的顺序依次执行。           
ES6 模块也允许内嵌在网页中，语法行为与加载外部脚本完全一致。               

## ES6模块与CommonJS模块的差异      
两个主要差异：        
1. CommonJS模块输出的是**一个值的拷贝**，ES6模块输出的是**值的引用**。CommonJS模块输出的是值的拷贝，也就是说，**一旦输出一个值，模块内部的变化就影响不到这个值**。ES6 模块的运行机制与 CommonJS不一样。JS引擎对脚本静态分析的时候，遇到模块加载命令import，就会生成一个只读引用。等到脚本真正执行时，再根据这个只读引用，到被加载的那个模块里面去取值。换句话说，ES6的import有点像Unix系统的“符号连接”，**原始值变了，import加载的值也会跟着变**。因此，ES6模块是动态引用，并且不会缓存值，模块里面的变量绑定其所在的模块。          
2. CommonJS模块是**运行时**加载，ES6模块是**编译时**输出接口。CommonJS加载的是一个对象（即module.exports属性），该对象只有在脚本运行完才会生成。而 ES6 模块不是对象，它的对外接口只是一种静态定义，在代码静态解析阶段就会生成。           
Node中的模块与ES6中的模块不是一回事，Node的模块遵循CommonJS规范。            
ES6 模块之中，顶层的this指向undefined；CommonJS 模块的顶层this指向当前模块，这是两者的一个重大差异。      

### ES6模块加载CommonJS模块
CommonJS 模块的输出都定义在module.exports这个属性上面。Node 的import命令加载 CommonJS 模块，Node 会自动将module.exports属性，当作模块的默认输出，即等同于export default xxx。import命令加载上面的模块，module.exports会被视为默认输出，即import命令实际上输入的是这样一个对象{ default: module.exports }。             
所以，一共有三种写法，可以拿到 CommonJS 模块的module.exports：
```
// a.js
module.exports = {
  foo: 'hello',
  bar: 'world'
};

// 写法一
import baz from './a';
// baz = {foo: 'hello', bar: 'world'};

// 写法二
import {default as baz} from './a';
// baz = {foo: 'hello', bar: 'world'};

// 写法三
import * as baz from './a';
```                      
CommonJS 模块的输出缓存机制，在 ES6 加载方式下依然有效。
             
### CommonJS模块加载ES6模块
CommonJS 模块加载 ES6 模块，不能使用require命令，而要使用import()函数。ES6 模块的所有输出接口，会成为输入对象的属性。         
```
// es.mjs
let foo = { bar: 'my-default' };
export default foo;

// cjs.js
const es_namespace = await import('./es.mjs');
```           
               
## 循环加载
是指类似于a依赖b，b依赖c，c又依赖a的情况。              
### CommonJS模块加载原理
CommonJS 的一个模块，就是一个脚本文件。require命令第一次加载该脚本，就会执行整个脚本，然后在内存生成一个对象。
```
{
  id: '...',
  exports: { ... },
  loaded: true,
  ...
}
```
上面代码就是 Node 内部加载模块后生成的一个对象。该对象的id属性是模块名，exports属性是模块输出的各个接口，loaded属性是一个布尔值，表示该模块的脚本是否执行完毕。其他还有很多属性，这里都省略了。                
以后需要用到这个模块的时候，就会到exports属性上面取值。即使再次执行require命令，也不会再次执行该模块，而是到缓存之中取值。也就是说，CommonJS 模块无论加载多少次，都只会在第一次加载时运行一次，以后再加载，就返回第一次运行的结果，除非手动清除系统缓存。                  
