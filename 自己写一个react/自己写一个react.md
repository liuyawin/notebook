[原文链接](https://engineering.hexacta.com/didact-fiber-incremental-reconciliation-b2fe028dcaec)    
# 为什么是Fiber
当浏览器的主线程忙于运行耗时比较长的任务时，一些重要的短任务不得不等待很长时间，这是不能接受的。如[这个页面](./test.html)所示，一段耗时的js代码会导致页面上的动画出现卡顿。从这个例子中可以看到动画明显的掉帧，直到主线程出现空闲。       
为什么不能将这样耗时的任务分割成几个小任务来执行？      
在React 16之前的版本中，一旦进入调和阶段就不能进行中断。主线程只有等调和阶段完成才能做其他事情，因为这个阶段依赖于递归调用，很难中断。这就是用Fiber来代替之前的递归调用的原因。    
# 调度微任务（micro-task）      
应该将任务分成更小的任务块，在很短的时间内执行这些任务块，让主线程可以执行优先级更高的任务，然后返回来执行未完成的任务块。         
我们用requestIdleCallback来实现这个功能，它将任务放入一个队列，等浏览器空闲的时候再来执行：
```
const ENOUGH_TIME = 1;

let workQueue = [];
let nextUnitOfWork = null;

function schedule(task){
    workQueue.push(task);
    requestIdleCallback(performWork);
}

function performWork(deadline){
    if(!nextUnitOfWork){
        nextUnitOfWork = workQueue.shift();
    }

    while(nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }

    if(nextUnitOfWork || workQueue.length > 0){
        requestIdleCallback(performWork);
    }
}
```
每一个需要渲染的component都对应了一个Fiber节点，nextUnitOfWork是对当前正在处理的Fiber节点的引用，performUnitOfWork将处理这个节点并返回一个新节点，知道所有工作完成。Fiber节点：
```
let fiber = {
  tag: HOST_COMPONENT,
  type: "div",
  parent: parentFiber,
  child: childFiber,
  sibling: null,
  alternate: currentFiber,
  stateNode: document.createElement("div"),
  props: { children: [], className: "foo"},
  partialState: null,
  effectTag: PLACEMENT,
  effects: []
};
```      
我们用child、sibling和parent（return）属性来创建一棵用于描述Component树的fiber树。       
stateNode是对Component实例的引用，它可能是一个DOM节点或者是class Component的实例：      
![avatar](./imgs/1.png)       
在这个例子中，我们可以看到三中不同的元素：     
* b、p和i的fiber代表host component，它们的tag为HOST_COMPONENT，type是一个string（对应的html标签），props是这个元素的attribute和event listener。      
* Foo的fiber代表class component，它的tag是CLASS_COMPONNET，type是用户定义的继承自Component的用户定义的类。      
* div的fiber代表host root，它类似于一个host component，因为它有一个DOM节点作为它的stateNode，但是作为树的根节点，它有一些特殊的地方--它的tag是HOST_ROOT。这个fiber的stateNode就是传入ReactDOM.render的那个DOM节点。      
另一个重要的属性是alternate。大部分时间我们有两棵fiber树，一棵对应已经渲染成DOM的fiber，另一棵树在处理一个新的更新（调用setState或ReactDOM.render）时创建，我们称之为work-in-progress树。      
work-in-progress树不与老的fiber树共享任何节点。一旦我们完成创建work-in-progress树且完成需要的DOM改变，work-in-progress树就变成了old tree。       
所以我们用alternate来将work-in-progress fiber和老树中对应的fiber节点对应起来。fiber节点和它的alternate有同样的tag、type和stateNode。当我们在渲染一个新的节点时，fiber没有alternate。     
最后，fiber节点上有effects链表和effectTag属性。当我们发现work-in-progress上的一个fiber需要改变DOM时，我们将effectTag设置为PLACEMENT、UPDATE或DELETION。为了方便提交所有的DOM变更，我们维护一个链表effects，用来保存所有有effectTag的fiber节点。      
# 调用栈
![avatar](./imgs/2.png)     
以render和setState为起点，到commitAllWork结束。       
1. createElement
```
const TEXT_ELEMENT = "TEXT ELEMENT";

function createElement(type, config, ...args) {
  const props = Object.assign({}, config);
  const hasChildren = args.length > 0;
  const rawChildren = hasChildren ? [].concat(...args) : [];
  props.children = rawChildren
    .filter(c => c != null && c !== false)
    .map(c => c instanceof Object ? c : createTextElement(c));
  return { type, props };
}

function createTextElement(value) {
  return createElement(TEXT_ELEMENT, { nodeValue: value });
}
```
2. updateDomProperties
```
function updateDomProperties(dom, prevProps, nextProps) {
  const isEvent = name => name.startsWith("on");
  const isAttribute = name => !isEvent(name) && name != "children";

  // Remove event listeners
  Object.keys(prevProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.removeEventListener(eventType, prevProps[name]);
  });

  // Remove attributes
  Object.keys(prevProps).filter(isAttribute).forEach(name => {
    dom[name] = null;
  });

  // Set attributes
  Object.keys(nextProps).filter(isAttribute).forEach(name => {
    dom[name] = nextProps[name];
  });

  // Add event listeners
  Object.keys(nextProps).filter(isEvent).forEach(name => {
    const eventType = name.toLowerCase().substring(2);
    dom.addEventListener(eventType, nextProps[name]);
  });
}
```
3. createDomElement
```
function createDomElement(fiber) {
  const isTextElement = fiber.type === TEXT_ELEMENT;
  const dom = isTextElement
    ? document.createTextNode("")
    : document.createElement(fiber.type);
  updateDomProperties(dom, [], fiber.props);
  return dom;
}
```
4. Component
```
class Component {
  constructor(props) {
    this.props = props || {};
    this.state = this.state || {};
  }

  setState(partialState) {
    scheduleUpdate(this, partialState);
  }
}

function createInstance(fiber) {
  const instance = new fiber.type(fiber.props);
  instance.__fiber = fiber;
  return instance;
}
```
setState里面只调用了scheduleUpdate方法。    
![avatar](./imgs/3.png)  
看看这个方法的实现：     
```
//Fiber tags
const HOST_COMPONENT = 'host';
const CLASS_COMPONENT = 'class';
const HOST_ROOT = 'root';

//全局变量
const updateQueue = [];
let nextUnitOfWork = null;
let pendingCommit = null;

function render(elements, containerDOM){
    updateQueue.push({
        from: HOST_ROOT,
        dom: containerDOM,
        newProps: {children: elements}
    });
    requestIdleCallback(performWork);
}

function scheduleUpdate(instance, partialState){
    updateQueue.push({
        from: CLASS_COMPONENT,
        instance: instance,
        partialState: partialState
    });
    requestIdleCallback(performWork);
}
```
我们用updateQueue来保存对pending updates的引用，每次调用render或scheduleUpdate都会push一个新的update对象到数组中。每个update对象中的更新信息是不同的，在resetNextUnitOfWork可以看到这些属性的作用。    
将update放入updateQueue之后，我们申请时间片来执行performWork。    
![avatar](./imgs/4.png)      
```
const ENOUGH_TIME = 1;

function performWork(deadline){
    workLoop(deadline);

    if(nextUnitOfWork || updateQueue.length > 0){
        requestIdleCallback(performWork);
    }
}

function workLoop(deadline){
    if(!nextUnitOfWork){
        resetUnitOfWork();
    }
    while(nextUnitOfWork && timeline.timeRemaining() > ENOUGH_TIME){
        nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    }
    if(pendingCommit){
        commitAllWork(pendingWork);
    }
}
```
这里我们用到了之前提到过的performUnitOfWork。      
requestIdleCallback以deadline作为参数调用目标函数，performWork拿到deadline并将它传给workLoop。在workLoop返回之后，performWork检查是否还有未完成的工作，如果有，则申请下一个时间片。       
workLoop是一直检测时间变化的函数，当deadline剩余时间不够时，它会停止工作循环，保留nextUnitOfWork更新，以保证下次调度时nextUnitOfWork可以被恢复。    
performUnitOfWork会为当前更新创建work-in-progress树，并且找出需要应用在DOM上的更新。这个过程被渐进的执行，每次执行一个fiber节点。      
当performUnitOfWork完成了当前更新的所有工作后，它会返回一个null，并将待提交的DOM更新保存在pendingCommit中。最后，commitAllWork从pendingCommit中取到effects并且更新DOM。      
注意commitAllWork是在循环之外被调用，performUnitOfWork中的工作没有改变DOM，所以它能够被分割。而commitAllWork改变了DOM，所以它必须一次完成，以避免UI抖动。      
我们仍然没有看到第一个nextUnitOfWork是从哪里来的。      
![avatar](./imgs/5.png)       
获得一个update并将其转化为第一个nextUnitOfWork的函数就是resetUnitOfWork：      
```
function resetNextUnitOfWork() {
  const update = updateQueue.shift();
  if (!update) {
    return;
  }

  // 将更新复制到对应的fiber节点上
  if (update.partialState) {
    update.instance.__fiber.partialState = update.partialState;
  }

  const root =
    update.from == HOST_ROOT
      ? update.dom._rootContainerFiber
      : getRoot(update.instance.__fiber);

  nextUnitOfWork = {
    tag: HOST_ROOT,
    stateNode: update.dom || root.stateNode,
    props: update.newProps || root.props,
    alternate: root
  };
}

function getRoot(fiber) {
  let node = fiber;
  while (node.parent) {
    node = node.parent;
  }
  return node;
}
```     
resetNextUnitOfWork函数先将updateQueue中的第一个update取出，如果这个update对象有partialState，我们将它复制到这个component实例对应的fiber对象上，这样在我们调用这个component的render方法时就可以用到它了。   
然后我们找到老fiber树的根节点root，如果这个update来自首次调用ReactDOM.render，这时还没有root fiber，所以root为null；如果这个update来自于之后调用的ReactDOM.render方法，我们可以在DOM节点的_rootContainerFiber属性找到root；如果这个update来自于setState，我们需要从这个实例开始向上寻找，知道找到没有parent属性的那个fiber。     
然后我们将nextUnitOfWork赋值为一个新的fiber节点，这个节点就是work-in-progress树的根节点，它的alternate指向上面找到的老树的根节点root。      
现在已经有了work-in-progress树的根节点，我们来构建它剩下的部分：      
![avatar](./imgs/6.png)       
```
function performUnitOfWork(wipFiber){
    beginWork(wipFiber);
    if(wipFiber.child){
        return wipFiber.child;
    }

    let uow = wipFiber;
    while(uow){
        completeWork(uow);
        if(uow.sibling){
            return uow.sibling;
        }
        uow = uow.parent;
    }
}
```     
performUnitOfWork遍历了work-in-progress树。我们调用beginWork创建当前fiber的子节点，然后返回第一个子节点作为下一个nextUnitOfWork。如果没有子节点（叶子节点），我们调用completeWork并且返回sibling作为nextUnitOfWork。如果也没有sibling，我们返回到父节点调用completeWork，知道找到sibling或者到达根节点。      
反复调用performUnitOfWork会为每个fiber的第一个子节点创建子节点，直到找到没有子节点的节点（叶子节点）。然后右移找到它的兄弟节点。然后上移对它的叔叔节点执行相同的操作。        
![avatar](./imgs/7.png)      
```
function beginWork(wipFiber) {
  if (wipFiber.tag == CLASS_COMPONENT) {
    updateClassComponent(wipFiber);
  } else {
    updateHostComponent(wipFiber);
  }
}

function updateHostComponent(wipFiber) {
  if (!wipFiber.stateNode) {
    wipFiber.stateNode = createDomElement(wipFiber);
  }
  const newChildElements = wipFiber.props.children;
  reconcileChildrenArray(wipFiber, newChildElements);
}

function updateClassComponent(wipFiber) {
  let instance = wipFiber.stateNode;
  if (instance == null) {
    // Call class constructor
    instance = wipFiber.stateNode = createInstance(wipFiber);
  } else if (wipFiber.props == instance.props && !wipFiber.partialState) {
    // No need to render, clone children from last time
    cloneChildFibers(wipFiber);
    return;
  }

  instance.props = wipFiber.props;
  instance.state = Object.assign({}, instance.state, wipFiber.partialState);
  wipFiber.partialState = null;

  const newChildElements = wipFiber.stateNode.render();
  reconcileChildrenArray(wipFiber, newChildElements);
}
```
beginWork执行两个操作：     
* 如果没有stateNode，创建它       
* 拿到节点的子节点，并传递个reconcileChildrenArray       
这两个操作依赖于component的类型，我们将它分为两类：updateClassComponent和updateHostComponent。     
updateHostComponent处理host component和root component。它创建一个DOM节点（仅仅是一个节点，没有子节点，也不插入DOM树）。然后调用reconcileChildrenArray，入参是fiber节点的children属性所指向的子元素。   
updateClassComponent首先验证是否需要调用render，依据是shouldComponentUpdate的返回值。如果不需要重新渲染，我们仅仅克隆当前的子树到work-in-progress树而不用进行调和。      
现在我们有了newChildElements，可以为work-in-progress树上的fiber节点创建子节点了：    
![avatar](./imgs/8.png)      
这是这个库的核心，在这里我们让work-in-progress树生长，并且决定在commit阶段会对DOM作出什么改变。       
```
// Effect tags
const PLACEMENT = 1;
const DELETION = 2;
const UPDATE = 3;

function arrify(val) {
  return val == null ? [] : Array.isArray(val) ? val : [val];
}

function reconcileChildrenArray(wipFiber, newChildElements) {
  const elements = arrify(newChildElements);

  let index = 0;
  let oldFiber = wipFiber.alternate ? wipFiber.alternate.child : null;
  let newFiber = null;
  while (index < elements.length || oldFiber != null) {
    const prevFiber = newFiber;
    const element = index < elements.length && elements[index];
    const sameType = oldFiber && element && element.type == oldFiber.type;

    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        tag: oldFiber.tag,
        stateNode: oldFiber.stateNode,
        props: element.props,
        parent: wipFiber,
        alternate: oldFiber,
        partialState: oldFiber.partialState,
        effectTag: UPDATE
      };
    }

    if (element && !sameType) {
      newFiber = {
        type: element.type,
        tag:
          typeof element.type === "string" ? HOST_COMPONENT : CLASS_COMPONENT,
        props: element.props,
        parent: wipFiber,
        effectTag: PLACEMENT
      };
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = DELETION;
      wipFiber.effects = wipFiber.effects || [];
      wipFiber.effects.push(oldFiber);
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }

    if (index == 0) {
      wipFiber.child = newFiber;
    } else if (prevFiber && element) {
      prevFiber.sibling = newFiber;
    }

    index++;
  }
}
```
调和过程省略。。。       
在performUnitOfWork中，当wipFiber没有新的children或者已经完成了所有子节点的更新工作，我们会调用completeWork：      
```
function completeWork(fiber) {
  if (fiber.tag == CLASS_COMPONENT) {
    fiber.stateNode.__fiber = fiber;
  }

  if (fiber.parent) {
    const childEffects = fiber.effects || [];
    const thisEffect = fiber.effectTag != null ? [fiber] : [];
    const parentEffects = fiber.parent.effects || [];
    fiber.parent.effects = parentEffects.concat(childEffects, thisEffect);
  } else {
    pendingCommit = fiber;
  }
}
```
completeWork先更新fiber对应的component上对fiber的引用，然后创建一个effects链表。这个链表包含workInProgress子树上所有包含effectTag的fiber节点（也包含老树中有DELETION effectTag的fiber）。这样在根节点的effects中就可以拿到所有有effecTag的fiber节点。      
最后，如果节点没有parent节点，说明我们已经到达了workInProgress的根节点。这是我们已经完成了这次更新的所有工作并且得到了所有的副作用列表。我们将workInProgress的root标记为pendingCommit，这样workLoop中的commitAllWork就会被调用。      
![avatar](./imgs/9.png)      
最后一件事就是更新DOM：     
```
function commitAllWork(fiber) {
  fiber.effects.forEach(f => {
    commitWork(f);
  });
  fiber.stateNode._rootContainerFiber = fiber;
  nextUnitOfWork = null;
  pendingCommit = null;
}

function commitWork(fiber) {
  if (fiber.tag == HOST_ROOT) {
    return;
  }

  let domParentFiber = fiber.parent;
  while (domParentFiber.tag == CLASS_COMPONENT) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.stateNode;

  if (fiber.effectTag == PLACEMENT && fiber.tag == HOST_COMPONENT) {
    domParent.appendChild(fiber.stateNode);
  } else if (fiber.effectTag == UPDATE) {
    updateDomProperties(fiber.stateNode, fiber.alternate.props, fiber.props);
  } else if (fiber.effectTag == DELETION) {
    commitDeletion(fiber, domParent);
  }
}

function commitDeletion(fiber, domParent) {
  let node = fiber;
  while (true) {
    if (node.tag == CLASS_COMPONENT) {
      node = node.child;
      continue;
    }
    domParent.removeChild(node.stateNode);
    while (node != fiber && !node.sibling) {
      node = node.parent;
    }
    if (node == fiber) {
      return;
    }
    node = node.sibling;
  }
}
```
一旦完成了所有副作用的更新，我们重置nextUnitOfWork和pendingCommit。workInProgress变为老树。至此，我们就完成了当前更新并准备好开始下一个。        
