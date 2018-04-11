### 创建、插入、删除、替换节点：    
createElement(),createTextNode();    
appendChild(),insertBefore();    
removeChild(),replaceChild()。    
用appendChild(),insertBefore()将文档中已存在的一个节点再次插入，那个节点会自动从它当前的位置删除并在新的位置重新插入，没有必要显示地删除该节点。     
```
//将child插入到parent中，使其成为父元素的第n个子节点
function insertAt(parent, child, n){
    if(n < 0 || n > parent.childNodes.length){
        throw new Error "Index invalid"
    } else if(n === parent.childNodes.length){
        parent.appendChild(child);
    } else{
        parent.insertBefore(child, parent.childNodes[n]);
    }
}
```
## 文档的几何形状和滚动    
### 文档坐标和视口坐标：视口是浏览器的一部分，它不包括浏览器的外壳。     
CSS指定元素位置时运用了文档坐标，而查询元素位置以及鼠标事件注册事件处理程序时报告的鼠标指针位置时在视口坐标系中的。    
```
//查询窗口滚动条的位置
function getScrollOffsets(w){
    w = w || window;

    //除IE8及以下外的其他浏览器都可用
    if(w.pageXOffset !== null){
        return {x: w.pageXOffset, y: w.pageYOffset};
    }

    var d = w.document;
    if(document.compatMode = 'CSS1Compat'){
        return {x: d.documentElement.scrollLeft, y: d.documentElement.scrollTop};
    }else{
        return {x: d.body.scrollLeft, y: d.body.scrollTop};
    }

}

//查询元素的几何尺寸
function getSize(node){
    var box = node.getBoundingClientRect();

    return {
        width: box.width || (box.right - box.left),
        height: box.height || (box.bottom - box.top)
    }
}
```
    
### 滚动
scrollTo和scrollBy。两个方法都接收两个参数。scrollBy是相对的，在当前滚动条的位置上增加。           
      
## 传统事件类型    
### 表单事件    
submit|reset|change|click|blur|focus    
表单事件中只有blur和focus不能冒泡，其他都能。     
### Window事件    
load|unload|onerror|resize|scroll|focus|blur    
### 鼠标事件   
mouseover|mousemove|mouseup|mousedown|click|dbclick|contextmenu(右键)|mouseout|mouseenter|mouseleave|mousewheel     
mouseover和mouseout会冒泡，他们的不冒泡版本为mouseenter和mouseleave。     
### 键盘事件
keyup|keydown|keypress     
## DOM事件    
## HTML5事件    
Video、Audio相关，拖拽相关，异步存储相关，...     
## 触摸屏和移动设备事件    
orientationchange|gesturestart|gestureend|gestruechange|touchstart|touchend|touchmove     

## cookie相关    
默认cookie有效期很短暂，只能持续在web浏览器的会话期间，用户关闭浏览器时，cookie中存储的数据就丢失了。     
可以通过设置max-age属性来控制cookie的有效期，单位是秒。      
cookie受同源策略的限制。默认cookie和创建它的web页面有关，并对该web页面以及和该页面同目录或者子目录下的页面可见。可以通过设置path和domain属性来控制cookie的可见性。
```
function cookieStorage(maxage, path){
    var cookie = (function(){
        var cookie = {};
        var all = document.cookie;
        if (all === '') {
            return cookie;
        }
        var list = all.split('; ');
        for (var i = 0; i < list.length; i++) {
            var c = list[i];
            var p = c.indexOf('=');
            var name = c.substring(0, p);
            var value = c.substring(p+1);

            value = decodeURIComponent(value);
            cookie[name] = value;
        }
        return cookie;
    }());

    //保存cookie中的所有name
    var keys = [];
    for (var key in cookie) keys.push(key);

    this.length = keys.length;

    this.key = function(n){
        if (n<0 || n>this.length) {
            return null;
        }
        return keys[n];
    };

    this.getItem = function(name){
        return cookie[name] || null;
    };

    this.setItem = function(key, value){
        if (!key in keys) {
            keys.push(key);
            this.length++;
        }

        cookie[key] = value;

        var c = key + '=' + encodeURIComponent(value);

        if (maxage) {
            c += '; max-age=' + maxage;
        }

        if (path) {
            c += '; path=' + path;
        }

        document.cookie = c;
    };

    this.removeItem = function(key){
        if (!(key in cookie)) {
            return;
        }

        delete cookie[key];

        for (var i = 0; i < keys.length; i++) {
            if (keys[i] === key) {
                keys.splice(i, 1);
                break;
            }
        }
        this.length--;
        //通过将值置为空以及max-age置为0来删除cookie
        document.cookie = key + '=; max-age=0';
    };

    this.clear = function(){
        for (var i = 0; i < keys.length; i++) {
            document.cookie = keys[i] + '=; max-age=0';    
        }

        keys = [];
        cookie = {};
        this.length = 0;
    }
}
```