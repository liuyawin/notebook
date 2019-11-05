## 基本用法
```
function asyncFun(){
    return new Promise(function(resolve,reject){
        setTimeout(()=>resolve({name:'kenan'}), 1000);
    });
}

async function test(){
    let a = await asyncFun();
    console.log('111: ', a);
    return a;
}

let p = test();
console.log('222: ', p);

p.then(function(val){
    console.log('333: ', val);
})
```
打印结果：   
```
222:  Promise {<pending>}   
111:  {name: "kenan"}   
333:  {name: "kenan"}   
```   
async函数返回一个 Promise 对象，可以使用then方法添加回调函数。async函数内部return语句返回的值，会成为then方法回调函数的参数。当函数执行的时候，一旦遇到await就会先返回，等到异步操作完成，再接着执行函数体内后面的语句。 
async函数返回的 Promise 对象，必须等到内部所有await命令后面的 Promise 对象执行完，才会发生状态改变，除非遇到return语句或者抛出错误。也就是说，只有async函数内部的异步操作执行完，才会执行then方法指定的回调函数。     
正常情况下，await命令后面是一个 Promise 对象。如果不是，就返回对应的值。await命令后面的 Promise 对象如果变为reject状态，则reject的参数会被catch方法的回调函数接收到。只要一个await语句后面的 Promise 变为reject，那么整个async函数都会中断执行。有时，我们希望即使前一个异步操作失败，也不要中断后面的异步操作。这时可以将第一个await放在try...catch结构里面，这样不管这个异步操作是否成功，第二个await都会执行。另一种方法是await后面的 Promise 对象再跟一个catch方法，处理前面可能出现的错误。       