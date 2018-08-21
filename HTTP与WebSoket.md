## 为什么是WebSoket？  
HTTP协议有一个缺陷：通信只能由客户端发起。这种单向请求的特点，注定了如果服务器有连续的状态变化，客户端要获知就非常麻烦。我们只能使用"轮询"：每隔一段时候，就发出一个询问，了解服务器有没有新的信息。但是轮询的效率低，而且非常浪费资源。           

## WebSocket    
最大特点就是，服务器可以主动向客户端推送信息，客户端也可以主动向服务器发送信息。              
![](img/websocket.png)           
其他特点包括：           
（1）建立在 TCP 协议之上，服务器端的实现比较容易。              
（2）与 HTTP 协议有着良好的兼容性。默认端口也是80和443，并且握手阶段采用 HTTP 协议，因此握手时不容易屏蔽，能通过各种 HTTP 代理服务器。              
（3）数据格式比较轻量，性能开销小，通信高效。              
（4）可以发送文本，也可以发送二进制数据。              
（5）没有同源限制，客户端可以与任意服务器通信。              
（6）协议标识符是ws（如果加密，则为wss），服务器网址就是 URL。                 
           
## 与HTTP的区别       
1. HTTP通信只能由客户端发起，而WebSocket通讯既可以由客户端发起，也可以由服务端发起。  
2. HTTP半双工，而WebSocket全双工。单工就是指A只能发信号，而B只能接收信号，通信是单向的；半双工是指一个时间段内只有一个动作发生；全双工（Full Duplex）是指在发送数据的同时也能够接收数据，两者同步进行。             
3. WebSocket在建立握手连接时，数据是通过http协议传输的，但在建立连接之后，真正的数据传输阶段是不需要http协议参与的。         
4. WebSocket传输的数据是二进制流，是以帧为单位的，http传输的是明文传输，是字符串传输，WebSocket的数据帧有序。
5. 二者请求头不同。           

## HTTP长连接与WebSocket持久连接          
长连接由HTTP1.1引入。HTTP短连接每次客户端发起请求，都会建立一次TCP连接，数据传输完毕后连接立即关闭。长连接在客户端与服务器完成一次请求后，TCP连接不会主动关闭，后续的请求依然会使用这个连接。如果一段时间内（具体的时间长短，是可以在header当中进行设置的，也就是所谓的超时时间），这个连接没有HTTP请求发出的话，那么这个长连接就会被断掉。           
由此看来，长连接省去了许多TCP建立和关闭的操作减少浪费，节约时间，适用于短时间内向服务端请求大量的资源、连接数比较少的场景。            
HTTP长连接虽然可以复用TCP连接，但实际上每次连接仍然是Request/Response消息对，会携带一些冗余的头部信息。           
WebSocket持久连接只需建立一次Request/Response消息对，之后都是TCP连接，避免了需要多次建立Request/Response消息对而产生的冗余头部信息。             

## WebSocket握手过程        
### 握手
WS的握手使用HTTP来实现，客户端的握手消息就是一个普通的，带有Upgrade头的HTTP请求消息。          
### 请求报文     
```
GET /chat HTTP/1.1              //1
Host: server.example.com       //2
Upgrade: websocket            //3
Connection: Upgrade          //4
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==      //5
Origin: http://example.com                      //6
Sec-WebSocket-Protocol: chat, superchat        //7
Sec-WebSocket-Version: 13                     //8
```                    
第1行：与HTTP的Request的请求行一样             
第2行：也与HTTP的Request的请求行一样             
第3行：Upgrade是HTTP1.1中用于定义转换协议的header域。如果服务器支持的话，客户端希望使用已经建立好的HTTP（TCP）连接，切换到WebSocket协议。              
第4行：Connection：HTTP1.1中规定Upgrade只能应用在直接连接中带有Upgrade头的HTTP1.1消息必须含有Connection头，因为Connection头的意义就是，任何接收到此消息的人（往往是代理服务器）都要在转发此消息之前处理掉Connection中指定的域（不转发Upgrade域）。
第5行：Sec-WebSocket-Key 是一个Base64encode的值，这个是浏览器随机生成的，用于服务端的验证，服务器会使用此字段组装成另一个key值放在握手返回信息里发送客户端           
第6行：Origin作安全使用，防止跨站攻击，浏览器一般会使用这个来标识原始域。            
第7行：Sec_WebSocket-Protocol是一个用户定义的字符串，用来区分同URL下，不同的服务所需要的协议，识了客户端支持的子协议的列表。               
第8行：Sec-WebSocket-Version标识了客户端支持的WS协议的版本列表。             

### 响应报文
```
HTTP/1.1 101 Switching Protocols   //1
Upgrade: websocket.               //2
Connection: Upgrade.             //3
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  //4
Sec-WebSocket-Protocol: chat.  //5
``` 
第1行：HTTP的版本为HTTP1.1，返回码是101，开始解析header域（不区分大小写）              
第2行：有Upgrade头，且内容包含websocket。             
第3行：有Connection头，且内容包含Upgrade              
第4行：有Sec-WebSocket-Accept头，生成步骤：①将Sec-WebSocket-Key的内容加上字符串258EAFA5-E914-47DA-95CA-C5AB0DC85B11（一个UUID），②将①中生成的字符串进行SHA1编码，③将②中生成的字符串进行Base64编码            
第5行：有Sec-WebSocket-Protocol头，要判断是否之前的Request握手带有此协议，如果没有，则连接失败。              



