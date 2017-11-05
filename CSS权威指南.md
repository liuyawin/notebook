# CSS和文档    
### 替换和非替换元素      
**替换元素**：是指用来替换元素内容的部分并非由文档内容直接表示，如img和input。    
**非替换元素**：是指其内容由用户代理（通常是浏览器）在元素本身生成的框中显示。如段落、标题、列表和表单元格等。     
      
### 块级元素和行内元素     
**块级元素**：块级元素生成一个行内框，（默认的）它会填充父元素的内容区，旁边不能有其他元素。列表项是块级元素的一个特例，它会生成一个标记符，无序列表是一个圆点，有序列表是一个数字。     
**行内元素**：行内元素在一个文本行内生成元素框，而不会打断这行文本。     
在HTML和XHTML中，块级元素不能嵌套在行内元素中，而CSS中没有这种限制。       
        
## 在HTML中使用CSS    
* link标记，称为外部样式表。     
* style元素，称为内部样式表或嵌套样式表。    
* @import    
* 内联样式    

CSS注释用/* */包裹。    
     
         
# 选择器    
### 元素选择器    
### 类选择器     
```
    /*p和warning中间没有空格，这个样式会应用到class为warning的p元素*/
    p.warning {color:red};
```
### ID选择器     
### 属性选择器，有四种类型    
1. 简单属性选择器    
```
    /*选择所有有class属性的p元素，将其文本置为银色*/
    p[class] { color:silver; }

    /*选择所有有class和id属性的p元素，将其文本置为银色*/
    p[class][id] { color:silver; }
```
2. 根据具体属性值选择    
```
    /*选择所有title属性值为w3c的p元素，将其文本置为银色*/
    p[title="w3c"] { color:silver; }
```
3. 根据部分属性值选择    
```
    /*选择所有class属性包含warn的p元素，将其文本置为红色*/
    /*包括class="warn danger"，不包括class="warning "*/
    p[class~="warn"] { color:red; }
```
子串匹配属性选择器      
|类型 | 描述|
|---------|----------|
|[foo~="bar"] | 选择foo属性包含bar的所有元素，以空格分离|
|[foo^="bar"] | 选择foo属性以bar开头的所有元素|
|[foo$="bar"] | 选择foo属性以含bar结尾的所有元素|
|[foo*="bar"] | 选择foo属性包含子串bar的所有元素|
     
4. 特定属性选择器     
        
### 后代选择器    
```
    /*选择后代元素*/
    div p { color: red; }

    /*选择子元素*/
    div>p { color: red; }

    /*选择相邻兄弟元素*/
    h1 + p { color: red; }/*选择紧接在h1后面的p元素*/
```
### 伪类和伪元素    
链接伪类：
|伪类名|描述|
|-----|----|
|:link|指示作为超链接（即有一个href属性）并指向一个未访问地址的所有锚|
|:visited|指示作为已访问地址超链接的所有锚|    
       
动态伪类：
|伪类名|描述|
|-----|----|
|:hover|指示鼠标悬停在哪个元素上|
|:active|指示当前被用户激活的元素|    
      
伪类的顺序为：link=>visited=>focus=>hover=>visited      
      
选择第一个子元素： :first-child。容易引起误解，看下面的例子：     
```
    <style>
        ul:first-child{
            color: red;
        }
    </style>

    <ul>
        <li>haha</li>
        <li>zizi</li>
        <li>xixi</li>
        <li>hehe</li>
    </ul>
```
效果：    
![](img/4.png)    
```
    <style>
        li:first-child{
            color: red;
        }
    </style>

    <ul>
        <li>haha</li>
        <li>zizi</li>
        <li>xixi</li>
        <li>hehe</li>
    </ul>
```
效果：    
![](img/5.png)    
由此可以看出，:first-child指的并不是元素的第一个子元素，而是作为子元素的第一个元素。      
      
根据语言选择： :lang(fr)     
伪元素选择器： 
首行和首字母： :first-line，:first-letter
设置之前和之后的元素的样式：:after， :before
```
    body:after{
        content: " The End.";
    }
```
     
# 结构和层叠     

