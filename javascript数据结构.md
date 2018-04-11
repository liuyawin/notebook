## 数组
```
//添加元素
arr[arr.length] = a;
push()
unshift()

//删除元素
pop()
shift()

//删除和添加数组元素的通用方法
arr.splice(2, 2, 4, 5, 6);//这个操作删除从数组索引2开始的2个元素，并将4,5,6三个元素从此处插入数组

//数组的其他方法
concat()
every()
filter()
forEach()
join()
indexOf()
lastIndexOf()
map()
reduce()
reverse()
slice()
some()
sort()
toString()
valueOf()
```      

## 栈    
```
function Stack(){};
Stack.prototype = {
    constructor: Stack,
    push(element(s)),
    pop(),
    peek(),//返回栈顶元素
    isEmpty(),
    clear(),
    size()
}
```

## 队列
```
function Queue(){};
Queue.prototype = {
    constructor: Queue,
    enqueue(element(s)),//添加
    dequeue(),//移除
    front(),//返回第一个被添加的元素
    isEmpty(),
    size()
}
```    
    
优先级队列...       
循环队列...在队列开头移除一项的同时将其添加到队列末尾      
      
## 链表    
```
function LinkedList(){
    let Node = function(element){
        this.element = element;
        this.next = null;
    }

    let length = 0;
    let head = null;

    this.append = function(element){};
    this.insert = function(position, element){};
    this.removeAt = function(position){};
    this.remove = function(element){};
    this.indexOf = function(element){};
    this.isEmpty = function(){};
    this.size = function(){};
    this.getHead = function(){};
    this.toString = function(){};
    this.print = function(){};
}
```
循环链表...   
双向链表...   
    
## 集合
集合：由一组无序且唯一的项组成（即无序，无重复）。   
```
function Set(){
    this.items = {};//用对象来保证不重复
}

Set.prototype = {
    constructor: Set,
    add(value),
    delete(value),
    has(value),
    clear(),
    size(),
    values()
}
```
集合的操作：    
交集    
并集    
差集    
子集    

## 字典和散列表    
### 字典
```
function Dictionary(){
    this.items = {};
}

Dictionary.prototype = {
    constructor: Dictionary,
    set(key, value),
    delete(key),
    has(key),
    get(key),
    clear(),
    size(),
    keys(),
    values()
}
```
     
### 散列表
HashTable，也叫HashMap，其作用是尽可能快地在数据结构中找到一个值。详情参见链接[哈希表原理详解](http://blog.csdn.net/duan19920101/article/details/51579136)。        
记录的存储位置=f(关键字);其中对应关系f称为散列函数，又称为哈希（Hash函数），采用散列技术将记录存储在一块连续的存储空间中，这块连续存储空间称为散列表或哈希表（Hash table）。           
```
function HashTable(){
    var table = [];
    this.put = function(key, value){
        var position = loseloseHashCode(key);
        table[position] = value;
    }

    this.remove = function(key){
        table[loseloseHashCode(key)] = undefined;
    }

    this.get = function(key){
        return table[loseloseHashCode(key)];
    }
}

//散列函数 
function loseloseHashCode(key){
    var hash = 0;
    for(var i = 0; i < key.length; i++){
        hash += key.charCodeAt(i);
    }

    return hash % 37;
}
```    
那么，如果两个字符串在哈希表中对应的位置相同怎么办？     
三种解决方法：分离链接、线性探查和双散列法。          
**分离链表**：在散列表的每一个位置创建一个链表并将元素存储在里面。         
**线性探查**：当想向表中某个位置加入新的元素的时候，如果索引为index的位置已经被占据了，就尝试索引为index+1的位置，以此类推。     


