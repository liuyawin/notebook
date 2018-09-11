执行Generator得到的是一个遍历器对象。调用该对象的next方法，返回值中的value是yield后面语句的执行结果。yield表达式本身没有返回值，或者说总是返回undefined。next方法可以带一个参数，该参数就会被当作上一个yield表达式的返回值。   
```
function *test(a){
	var b = 2 * (yield a * 3);
	var c = yield b + 2;
	return c;
}
var g = test(5);

g.next();//{value: 15, done: false}
g.next(10);//{value: 22, done: false}
g.next(10);//{value: 10, done: true}
g.next(10);//{value: undefined, done: true}
```
因为执行Generator函数得到的是一个遍历器对象，因此可以把 Generator 赋值给对象的Symbol.iterator属性，从而使得该对象具有 Iterator 接口。       
```
var myIterable = {};
myIterable[Symbol.iterator] = function* () {
    yield 1;
    yield 2;
    yield 3;
};

for(var val of myIterable) console.log(val);

//1
//2
//3
```
           
对异步任务来说，Promise 的写法只是回调函数的改进，使用then方法以后，异步任务的两段执行看得更清楚了，除此以外，并无新意。             
Promise 的最大问题是代码冗余，原来的任务被 Promise 包装了一下，不管什么操作，一眼看去都是一堆then，原来的语义变得很不清楚。            
Generator则引入了协程的概念。     
"协程"（coroutine），意思是多个线程互相协作，完成异步任务。协程遇到yield命令就暂停，等到执行权返回，再从暂停的地方继续往后执行。它的最大优点，就是代码的写法非常像同步操作，如果去除yield命令，简直一模一样。       
Generator 函数是协程在 ES6 的实现，最大特点就是可以交出函数的执行权（即暂停执行）。     