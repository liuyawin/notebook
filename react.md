## UI
* state：带有时间性的交互数据。   
* UI：状态的演进。   
    
现代前端框架的核心：如何去监听应用的状态。    
## JSX
### 语法
* 标签的写法和HTML一样，只不过融入到了JavaScript中。
* 组件，其实就是自定义标签，首字母必须大写，为了与原生标签区别开来。
* 如果标签或组件没有包含内容，可以采用自闭合标签写法。    
* JSX会自动忽略false、null和undefined。
* 标签的class属性和for属性要用className属性和htmlFor属性代替。
* 组件返回多个标签或多个组件必须要用一个标签或组件包裹，也就是说只能有一个顶层元素。但是，React16以上的版本支持用空标签包裹或者直接返回数组。这样的好处就是不必添加很多无用的标签使页面变得更加臃肿。
* 变量由{}包裹，对象由{{}}包裹。
* 用map来循环。
### 编译
```
//编译前
const app = (
    <div className="form">
        <input type="text" />
        <button>click</button>
    </div>
);

//编译后
const app = React.createElement(
    "div",
    { className: "form" },
    React.createElement("input", { type: "text" }),
    React.createElement(
        "button",
        null,
        "click",
    ),
);
```   
可以看到，标签最后变成了一个函数执行表达式，第一个参数是标签名，第二个参数是属性集合，之后的参数都是子标签。   
## 可变的状态
React使用一个特殊的对象this.state来管理组件内部的状态。    
可以在组件的构造函数中初始化组件的状态，之后用setState方法来改变组件的状态。   
this.state并不是一个不可变对象，可以直接改变它的属性。但是它不会触发render生命周期钩子，也就不会渲染到UI上。如果手动改变了this.state的值，之后又调用了this.setState()，它会在直接改变的值的基础上再做更新。    
新状态并不会覆盖旧状态，而是将已有的属性进行合并操作。如果旧状态没有该属性，则新建。而且合并是浅合并。只有第一层的属性才会合并，更深层的属性都会覆盖。     
异步更新：其实是批量更新。React组件有自己的生命周期，在某两个生命周期节点之间做的所有的状态更新，React会将它们合并，而不是立即触发UI渲染，直到某个节点才会将它们合并的值批量更新。      
setState可以接受一个对象作为参数，也可以接受一个函数作为参数，该函数返回要更新的状态对象。   
## 不可变的属性
不可对this.props赋值，否则会报错。（？）
* 有两个特殊的属性ref和key，它们各有用途，并不会传给子组件的this.props。
* 如果只给属性不给值，React会默认解析成布尔值true。
* 除了字符串，其他值都要用花括号包裹。
* 如果你把属性给了标签而不是子组件，React并不会解析。   
组件之间通信：   
1. 父组件给子组件传值：父组件上定义的属性在子组件中用this.props可以拿到；   
2. 子组件给父组件传值：父组件定义一个方法，将该方法通过props传给子组件，子组件需要给父组件传值时，便传参执行该方法。由于方法定义在父组件里，父组件可以接收到该值。   
3. 兄弟组件之间传值：使用回调，原理类似于子组件给父组件传值，不过这里父组件作为桥梁。
4. createContext。有一个限制，数据只能向下传递。开发者通过createContext创建一个上下文对象，然后找一个顶级组件作为Provider。接下来就可以在任意下级组件消费它提供的数据了。
* 只要Provider的数据改变，就会触发Consumer的更新。
* 创建时可以提供一个默认值，另外挂载时可以通过value属性传递数据。但是默认值只有在不提供Provider的情况下才起作用。
* 开发者可以创建多个Context。
* Consumer的children必须是一个函数。   
## 组件化
一个组件就是一个功能模块，所有的前端元素都封装在组件内部，对外只暴露有限的接口。这样开发者拿来就能用，通过接口与组件交互而不必知道组件的内部细节。   
### Component与PureComponent   
PureComponent通过shouldComponentUpdate生命周期钩子帮开发者做了一些优化工作，使得组件看起来更加纯粹。    
React专门有一个方法来判断组件该不该更新。如果typeof instance.shouldComponentUpdate === 'function'，那这就是一个继承了Component类的组件，直接执行shouldComponentUpdate，返回true则更新，返回false则不更新。             
如果ctor.prototype.isPureReactComponent，那这就是一个继承了PureComponent类的组件，这时React会将oldProps和newProps做一层浅比较，同时将oldState和newState做一层浅比较，只要有一个浅比较不相等，则返回true更新，否则返回false不更新。            
```
function checkShouldComponentUpdate(
    workInProgress,
    oldProps,
    newProps,
    oldState,
    newState,
    newContext,
) {
    const instance = workInProgress.stateNode;
    const ctor = workInProgress.type;
    if (typeof instance.shouldComponentUpdate === 'function') {
        startPhaseTimer(workInProgress, 'shouldComponentUpdate');
        const shouldUpdate = instance.shouldComponentUpdate(
            newProps,
            newState,
            newContext,
        );
        stopPhaseTimer();
        return shouldUpdate;
    }
    if (ctor.prototype && ctor.prototype.isPureReactComponent) {
        return (
            !shallowEqual(oldProps, newProps) || !shallowEqual(oldState, newState)
        );
    }
    return true;
}
```
永远不修改原数据，生成新数据时依赖于原数据的浅拷贝，避免新数据和老数据指向同一个引用。    
```
handleDelete = () => {
    this.setState((prevState) => ({ list: [...prevState.list].pop() }));
}
```   
## 事件
### 事件委托
一个React应用只有一个事件监听器，这个监听器挂载在document上。所有的事件都由这个监听器统一分发。组件挂载和更新时，会将绑定的事件分门别类的放进一个叫做EventPluginHub的事件池里。事件触发时，根据事件产生的Event对象找到触发事件的组件，再通过组件标识和事件类型从事件池里找到对应的事件监听回调，然后逐个执行。   
原生DOM事件系统会为每个事件生成一个Event对象，React则基于Event对象创建了一个合成事件对象。它能实现跨浏览器的表现一致性，因为React做了很多兼容性的处理。如果事件多次触发，合成事件对象会被复用，提高性能。当元素被卸载，React会清除JSX上绑定的事件监听器。合成事件对象下面保存了原生事件对象nativeEvent，以备不时之需。   
阻止冒泡要用stopImmediatePropagation。

### 绑定this
1. 在JSX里面直接用bind方法绑定this
```
import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <button onClick={this.handleClick.bind(this)}>Click</button>
        );
    }

    handleClick() {
        console.log(this);
    }
}

export default App;
```
缺点：bind性能不好，而且每次render都会绑定一次。   
2. 包裹一层箭头函数
```
import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <button onClick={() => this.handleClick()}>Click</button>
        );
    }

    handleClick() {
        console.log(this);
    }
}

export default App;
```
缺点：要额外包裹一层箭头函数，每次触发都会生成一个箭头函数。   
3. 官方推荐写法，在构造函数里手动绑定
```
import React, { Component } from 'react';

class App extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    render() {
        return (
            <button onClick={this.handleClick}>Click</button>
        );
    }

    handleClick() {
        console.log(this);
    }
}

export default App;
```
4. 回调直接写在实例上
```
import React, { Component } from 'react';

class App extends Component {
    render() {
        return (
            <button onClick={this.handleClick}>Click</button>
        );
    }

    handleClick = () => {
        console.log(this);
    }
}

export default App;
```
## 操作DOM
this.refs。React不推荐使用该API。在表单聚焦或者复杂的动画可能会用到。   
```
import React, { Component } from 'react';

class App extends Component {
    componentDidMount() {
        this.refs.textInput.focus();
    }

    render() {
        return (
            <input type="text" ref="textInput" />
        );
    }
}

export default App;
```
必须等到组件挂载完成才能调用。    
this.refs不能直接执行写操作。   
## 安装react-develop-tools报错
以管理员身份运行，然后再安装。chrome://extensions/    

