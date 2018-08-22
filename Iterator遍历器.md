JavaScript 原有的表示“集合”的数据结构，主要是数组（Array）和对象（Object），ES6 又添加了Map和Set。这样就有了四种数据集合，用户还可以组合使用它们，定义自己的数据结构，比如数组的成员是Map，Map的成员是对象。这样就需要一种统一的接口机制，来处理所有不同的数据结构。          
遍历器（Iterator）就是这样一种机制。它是一种接口，为各种不同的数据结构提供统一的访问机制。任何数据结构只要部署 Iterator 接口，就可以完成遍历操作（即依次处理该数据结构的所有成员）。             
Iterator 的作用有三个：一是为各种数据结构，提供一个统一的、简便的访问接口；二是使得数据结构的成员能够按某种次序排列；三是 ES6 创造了一种新的遍历命令for...of循环，Iterator 接口主要供for...of消费。           
           
Iterator 的遍历过程是这样的。            
（1）创建一个指针对象，指向当前数据结构的起始位置。也就是说，遍历器对象本质上，就是一个指针对象。            
（2）第一次调用指针对象的next方法，可以将指针指向数据结构的第一个成员。             
（3）第二次调用指针对象的next方法，指针就指向数据结构的第二个成员。             
（4）不断调用指针对象的next方法，直到它指向数据结构的结束位置。             
                
每一次调用next方法，都会返回数据结构的当前成员的信息。具体来说，就是返回一个包含value和done两个属性的对象。其中，value属性是当前成员的值，done属性是一个布尔值，表示遍历是否结束。             
           
原生具备 Iterator 接口的数据结构如下。          
* Array
* Map
* Set
* String
* TypedArray
* 函数的 arguments 对象
* NodeList 对象              
      
如果使用 TypeScript 的写法，遍历器接口（Iterable）、指针对象（Iterator）和next方法返回值的规格可以描述如下。     
```
interface Iterable {
  [Symbol.iterator]() : Iterator,
}

interface Iterator {
  next(value?: any) : IterationResult,
}

interface IterationResult {
  value: any,
  done: boolean,
}
```
以上内容来自阮一峰的文章，链接地址：[Iterator 和 for...of 循环](http://es6.ruanyifeng.com/#docs/iterator)。 
### 谈一些个人的理解    
按照上面的说法，凡是有Symbol.iterator属性的数据结构，都是可遍历的，都可以用for...of来进行遍历。Symbol.iterator属性的值是一个函数，称为接口遍历器（Iterable），该函数的返回值是一个遍历器对象（Iterator）。遍历器对象有一个next属性，其值是一个函数，该函数定义了遍历的规则。next函数的返回值有两个属性，一个是value，是当前成员的值，一个是done，表示遍历是否结束。         
下面通过两个例子来验证上面的理解。       
1. 数组的遍历           
数组是可遍历的，用for...of对数组进行遍历，代码如下：    
```
let arr = [1, 4, 8, 10, 2, 5];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 1, done: false }
iter.next() // { value: 4, done: false }
iter.next() // { value: 8, done: false }
iter.next() // { value: 10, done: false }
iter.next() // { value: 2, done: false }
iter.next() // { value: 5, done: false }
iter.next() // { value: undefined, done: true }
```
这是数组默认的遍历器，会按照顺序遍历出数组中的元素。          
现在我们改写一下遍历的规则：     
```
Array.prototype[Symbol.iterator] = function(){
  var _this = this;
  var i = 0;
  return {
    next: function(){
      var val = _this[i];
      i++;
      if(!val || val > 5){
        return {value: undefined, done: true};
      }else{
        return {value: val, done: false};
      }
    }
  }
}
```
再来执行刚才的遍历：    
```
let arr = [1, 4, 8, 10, 2, 5];
let iter = arr[Symbol.iterator]();

iter.next() // { value: 1, done: false }
iter.next() // { value: 4, done: false }
iter.next() // { value: undefined, done: true }
```       
可以看到，在遍历到第三个元素8时，由于8>5，所以直接返回了{ value: undefined, done: true }，遍历结束。我们定义的遍历规则覆盖了原生的遍历规则。     
2. 对象的遍历    
对象没有Symbol.iterator属性，无法用for...of遍历。
```
var obj = {};
for(var val of obj){
  console.log(val); //Uncaught TypeError: obj is not iterable
}
```
报错了！我们为它加上一个Symbol.iterator属性：
```
Object.prototype[Symbol.iterator] = function() {
	var _this = this;
	return {
		next: function(){
			var ram = Math.random();
			if(ram > 0.8) {
				return {value: ram,done: true};
			}else{
				return {value: ram, done: false};
			}
		}
	}
}
```
再用for...of遍历对象：
```
var obj = {};
for(var val of obj) {
  console.log(val);
} 
// 结果：
//0.04677145153503082
//0.2331536388330835
//0.7729981358249454
//0.25114496716514867
//0.3330043118140902
```
果然，这次没有报错，并按我们定义的规则打印出了结果！