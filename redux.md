## 要点    
应用中所有的 state 都以一个对象树的形式储存在一个单一的 store 中。 惟一改变 state 的办法是触发 action，一个描述发生什么的对象。 为了描述 action 如何改变 state 树，你需要编写 reducers。      
reducer是形式为 (state, action) => state 的纯函数，描述了 action 如何把 state 转变成下一个 state。           
