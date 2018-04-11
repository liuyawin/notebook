## createElement
```
const title = <h1 className="title">hello,world</h1>
```
这实际上是一个语法糖，经过babel转移之后生成如下代码：
```
var title = React.createElement(
    'h1',
    {className: 'title'},
    'hello,world'
);
```
React.createElement接口形式为：
```
createElement(tag, attrs, child1, child2);
```
其中第一个参数是标签名，第二个参数是属性，以后的参数是子节点。     
createElement的实现很简单，只需要返回一个对象来保存节点的信息：    
```
function createElement(tag, attrs, ...children){
    return {
        tags,
        attrs,
        children
    };
}
```    
createElement方法返回的对象记录了这个DOM节点所有的信息，换言之，通过它我们就可以生成真正的DOM，这个记录信息的对象我们称之为虚拟DOM。    
## render
```
React.render(
    <h1 className="title">hello,world</h1>,
    document.getElementById('root)
);
```
转换一下就是：
```
React.render(
    React.createElement('h1', {className: 'title'},'hello,world'),
    document.getElementById('root)
);
```
render方法的作用是将虚拟DOM节点转化为真正的DOM节点，其实现如下：     
```
function render(vNode, container){
    if(typeOf vNode === 'string'){
        const textNode = document.createTextNode(vNode);
        return container.appendChild(textNode);
    }

    const dom = document.createElement(vNode.tag);

    if(vNode.attrs){
        vNode.atttrs.forEach(key => {
            let value = vNode.attrs[key];
            if(key === 'className') key = 'class';
            dom.setAttribute(key, value);
        });
    }

    vNode.children.forEach(child => render(child, dom));

    return container.appendChild(dom);
}
```
这里还有个小问题：当多次调用render函数时，不会清除原来的内容。所以我们将其附加到ReactDOM对象上时，先清除一下挂载目标DOM的内容：   
```
const ReactDOM = {
    render: ( vnode, container ) => {
        container.innerHTML = '';
        return render( vnode, container );
    }
}
```