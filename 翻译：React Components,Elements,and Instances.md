# [React Components, Elements, and Instances](https://reactjs.org/blog/2015/12/18/react-components-elements-and-instances.html)
Components、他们的Instances、以及Elements这三者之间的区别困扰了很多React的初学者。为什么绘制在屏幕上的东西会与三个不同的概念有关？
## Managing the Instances    
如果你是React新手，你之前可能只使用过component classes和instances。举个例子，你可能会通过创建一个class来声明一个Button组件（component）。当app运行时，屏幕上可能会有这个组件（component）的几个实例（instance），每一个实例都有他们各自的属性和本地状态。这是传统的面向对象的UI程序。那为什么要引进elements呢？    
在这个传统的UI模型里面，由你来负责创建和销毁子组件实例。在一个包含Button组建的Form组件里面，需要创建Button的实例，并且在有任何新的信息时让它保持更新。    
```
class Form extends TraditionalObjectOrientedView {
  render() {
    // Read some data passed to the view
    const { isSubmitted, buttonText } = this.attrs;

    if (!isSubmitted && !this.button) {
      // Form is not yet submitted. Create the button!
      this.button = new Button({
        children: buttonText,
        color: 'blue'
      });
      this.el.appendChild(this.button.el);
    }

    if (this.button) {
      // The button is visible. Update its text!
      this.button.attrs.children = buttonText;
      this.button.render();
    }

    if (isSubmitted && this.button) {
      // Form was submitted. Destroy the button!
      this.el.removeChild(this.button.el);
      this.button.destroy();
    }

    if (isSubmitted && !this.message) {
      // Form was submitted. Show the success message!
      this.message = new Message({ text: 'Success!' });
      this.el.appendChild(this.message.el);
    }
  }
}
```
以上是一段伪代码，描述了我们在用像Backbone这样的库来写面向对象的UI代码时干的事。       
每一个组件实例都要保持与DOM节点以及子组件实例的联系，并且在合适的时机创建、更新和销毁他们。代码量以组件可能的状态的平方的速度增长，而且由于父节点可以直接访问子节点的实例，在将来解耦他们会变得十分困难。       
那么React有什么不一样的地方呢？     
## Elements Describe the Tree
在React里面，这就是elements解决的问题。元素（Elements）是描述组件实例或DOM节点及其所需属性的普通对象。它只包含组件类型（例如Button）、属性（例如颜色）和它的子元素的信息。     
Elements并不是真正的节点，相反，它告诉react你想在屏幕上看到什么。你不能在element里面调用任何方法。他仅仅是一个用于描述的对象，包含两个方面：节点类型（string或者ReactClass）和节点属性（对象）。          
### DOM Elements   
当element的type是一个字符串，它表示具有该标签名称的DOM节点，props相当于节点的attributes。这就是React将要渲染的内容。举个例子：   
```
{
  type: 'button',
  props: {
    className: 'button button-blue',
    children: {
      type: 'b',
      props: {
        children: 'OK!'
      }
    }
  }
}
```
这个element将如下的HTML表示为一个普通对象： 
```
<button class='button button-blue'>
  <b>
    OK!
  </b>
</button>
```
···
## 总结
一个Element就是一个普通的对象，用于描述你希望显示在页面上的DOM节点或其他Componen。    
···