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
