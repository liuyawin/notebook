# [Reconciliation](https://reactjs.org/docs/reconciliation.html)
React提供声明性API，因此您无需担心每次更新的具体更改。这使得编写应用程序变得更加容易，但在React中如何实现它可能并不明显。本文解释了我们在React的“diffing”算法中做出的选择，使得组件更新变得可预测，同时对于高性能应用程序来说足够快。       
## 动机
当您使用React时，render（）函数在某一个时间点创建了React元素树。 在下一个state或props更新中，render（）函数将返回一个不同的React元素树。 然后，React需要弄清楚如何有效地更新UI以匹配最新的树。       
这个问题有一些通用的解决方案，用最少的操作次数将一棵树转换为另一棵树。然而，现有技术的算法的复杂度为O（n3），其中n是树中元素的数量。      
如果我们在React中使用它，显示1000个元素将需要大约10亿次比较，这个代价过于昂贵。 相反，React基于两个假设实现了一个创造性的O（n）算法：   
1. 类型不同的两个元素将产生不同的树；
2. 开发者可以通过key属性来标示唯一的元素。     
实际上，这些假设对几乎所有实际用例都有效。      
## diffing算法
当比较两棵树时，react首先比较两个根元素。根据根元素类型的不同，算法将采取不同的行为。     
### 不同类型的元素
只要两个根元素的类型不同，React会销毁旧树，重新构建一棵新树。     
当销毁旧树时，旧的DOM节点会被销毁，组件实例接收componentWillUnmount()。当构建一棵新树，新的DOM节点会插入DOM，组件实例接受componentWillMount()，然后是componentDidMount()，与旧树相关的所有状态将会丢失，旧树下的所有子节点也会进行卸载并销毁他们的状态。      
### 相同类型的DOM元素
当比较两个相同类型的React DOM元素时，React查看两者的属性，保持相同的底层DOM节点，仅更新已更改的属性。 例如：       
```
<div className="before" title="stuff" />

<div className="after" title="stuff" />
```
通过比较这两个元素，React知道只需要修改底层DOM节点上的className。
当更新样式时。react同样知道只更新发生改变的饿属性。例如：
```
<div style={{color: 'red', fontWeight: 'bold'}} />

<div style={{color: 'green', fontWeight: 'bold'}} />
```   
由旧节点转化为新节点时，react知道只需要改变color样式，而不是fontWeight。    
### 相同类型的节点元素
组件更新时，实例保持不变，因此state可以在渲染时保持不变。React更新底层组件实例的props以匹配新元素，并在底层实例上调用componentWillReceiveProps()和componentWillUpdate()。      
接下来，调用render()方法，diff算法对前一个结果和新结果进行递归。     
### 递归子节点
默认情况下，当对DOM节点的子节点进行递归时，React会同时迭代两个子节点列表，并在出现差异时发生转变。      
举个例子，当把一个元素插在子元素的结尾时，两棵树之间的转换效果很好：
```
<ul>
  <li>first</li>
  <li>second</li>
</ul>

<ul>
  <li>first</li>
  <li>second</li>
  <li>third</li>
</ul>
```
React会先匹配第一个< li >，然后匹配第二个< li >，最后往树里面插入一个< li >。     
如果把一个元素插在子元素开头时，效果则会很糟糕：   
```
<ul>
  <li>Duke</li>
  <li>Villanova</li>
</ul>

<ul>
  <li>Connecticut</li>
  <li>Duke</li>
  <li>Villanova</li>
</ul>
```
React将会改变每一个子节点，而不是保持Duke和Villanova两个自己点，这回降低运行效率。     
### keys
为了解决这个问题，React提供一个key属性。当子节点有keys时，React使用key来对新旧树上的子节点进行匹配。例如，给上面例子中的子元素加上key会提高转变的效率：
```
<ul>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>

<ul>
  <li key="2014">Connecticut</li>
  <li key="2015">Duke</li>
  <li key="2016">Villanova</li>
</ul>
```
现在，React知道key为2014的子元素是新加的，而key为2015和2016的子元素只需要移动一下。       
在实践中，通常使用一个独一无二的ID作为key，所以key通常来自你的数据：
```
<li key={item.id}>{item.name}</li>
```
如果不是这种情况，您可以向数据中添加新的ID属性，或者对内容的某些部分进行哈希以生成key。key只需要在其兄弟节点中唯一，而不是全局唯一。      
对于有序的数组，你可以使用数组索引作为key。如果数组不会被重排序，这种方法能很好的工作，一旦重新排序，它将会变得很慢。     
使用数组索引作为key时重排序也会引起组件state的一些问题。组件实例根据他们的key进行更新和重用。如果用索引作为key，移除一个条目它就改变了，结果，想非受控的input之类的组件的state就会混合并发生一些以外的更新。      
### 权衡
很重要的一点是记住调度算法是实现的细节，在每一个action之后React会重新渲染整个应用；最终结果是一样的。在这种情况下的重新渲染意味着调用所有组件的render方法，而不是卸载并中心安装他们。它会按照上文中介绍的规则仅仅更改差异的部分。     
编写React应用时遵循以下规则，否则会使效率变低：
1. 这个算法不会匹配不同节点类型的节点的子树。如果您发现自己在具有非常相似输出的两种组件类型之间交替，则可能需要将其设置为相同类型。在实践中，我们没有发现这是一个问题。    
2. Keys应该是稳定的、可预测的和唯一的。不稳定的key（如使用随机数）会引起一些组件和DOM节点进行不必要的重建，这可能会导致子组件性能下降和状态丢失。