CSS性能优化主要从以下几个方面进行：      
1. Style 标签的相关调优            
2. 特殊的 CSS 样式使用方式           
3. CSS 缩写           
4. CSS 的声明             
5. CSS 选择器              
       
## 把 Stylesheets 放在 HTML 页面头部，避免使用@import
## 避免使用 CSS Expressions
Expression 只有 IE 支持，而且他的执行比大多数人想象的要频繁的多。不仅页面渲染和改变大小 (resize) 时会执行，页面滚动 (scroll) 时也会执行，甚至连鼠标在页面上滑动时都会执行。在 expression 里面加上一个计数器就会知道，expression 的执行上相当频繁的。鼠标的滚动很容易就会使 expression 的执行次数超过 10000。       
## 避免使用 Filter
IE 特有的 AlphaImageLoader filter 是为了解决 IE6 及以前版本不支持半透明的 PNG 图片而存在的。但是浏览器在下载 filter 里面的图片时会“冻结”浏览器，停止渲染页面。同时 filter 也会增大内存消耗。最不能忍受的是 filter 样式在每个页面元素（使用到该 filter 样式）渲染时都会被浏览器分析一次，而不是像一般的背景图片渲染模式：使用过该背景图片的所有元素都是被浏览器一次性渲染的。              
针对这种情况，最好的解决办法就是使用 PNG8。             
## 使用CSS缩写
```
//颜色缩写
#000000     ------>>     #000 
#336699     ------>>     #369

//属性缩写
Margin-top: 2px; 
Margin-right: 5px; 
Margin-bottom: 2em; 
Margin-left: 15px;     ----->>     Margin: 2px 5px 2em 15px; 
 
Border-width: 1px; 
Border-style: solid; 
Border-color: #000     ----->>     border: 1px solid #000 
 
Font-style: italic; 
Font-variant: small-caps; 
Font-weight: bold; 
Font-size: 1em; 
Line-height: 140%; 
Font-family: sans-serif;  ----->>  font: italic small-caps bold 1em 140% sans-serief 
 
Background-color: #f00; 
Background-image: url(background.gif); 
Background-repeat: no-repeat; 
Background-attachment: fixed; 
Background-position: 0 0; 
 ----->>background: #f00 url(background.gif) no-repeat fixed 0 0 
 
list-style-type: square; 
list-style-position: inside; 
List-style-image: url(image.gif)  ----->> list-style: square inside url(image.gif)
```              
## Multiple Declarations
```
.Class1{position: absolute; left: 20px; top: 30px;} 
.Class2{position: absolute; left: 20px; top: 30px;} 
.Class3{position: absolute; left: 20px; top: 30px;} 
.Class4{position: absolute; left: 20px; top: 30px;} 
.Class5{position: absolute; left: 20px; top: 30px;} 
.Class6{position: absolute; left: 20px; top: 30px;} 
 
 -------------------->>>>>>> 
 
 .class1 .class2 .class3 .class4 .class5 .class6{ 
 Position: absolute; left: 20px; top: 20px; 
 }
```
## CSS选择器
**浏览器读取你的选择器，遵循的原则是从选择器的右边到左边读取。换句话说，浏览器读取选择器的顺序是由右到左进行。**              
选择器的最后一部分，也就是选择器的最右边（在这个例子中就是a[title]部分）部分被称为“关键选择器”，它将决定你的选择器的效率如何，是高还是低。                  
关于选择器性能排序：1.id选择器（#myid）2.类选择器（.myclassname）3.标签选择器（div,h1,p）4.相邻选择器（h1+p）5.子选择器（ul < li）6.后代选择器（li a）7.通配符选择器（*）8.属性选择器（a[rel='external']）9.伪类选择器（a:hover,li:nth-child）。               
* 不要在编写id规则时用标签名或类名。              
* 不要在编写class规则时用标签名。             
* 把多层标签选择规则用class规则替换，减少css查找。          
* 避免使用子选择器；避免使用后代选择器，使用后代选择器的代价十分昂贵。           

**总结**：网站编写CSS时，应该优先考虑使用class选择器，避免使用通配符选择器（*）和属性选择器（a[rel=”external”]），后代选择器与标签选择器结合使用也应避免。使用id选择器的性能最好，但是编写时要注意其唯一性，谨慎使用。CSS3选择器（例如：:nth-child(n)第n个孩子）在帮助我们锁定我们想要的元素的同时保持标记的干净和语义化，但事实是，这些花哨的选择器让更多的浏览器资源被密集使用。引用David Hyatt关于CSS3选择器的论述：如果你关心页面性能的话，他们真不该被使用！              