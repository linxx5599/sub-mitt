## sub-mitt 是一个可跨技术栈通讯的js包

安装

```bash
pnpm add sub-mitt

npm install sub-mitt

yarn add sub-mitt
```

## 使用

### es

```ts
import SubMitt from 'sub-mitt';
const subMitt = new SubMitt();
const client = subMitt.createClient();
//订阅消息
client.sub("TP_1", (res) => {
    console.log(res, 'res');
})
//发送消息
subMitt.pub("TP_1", 'send...', {
    persistent: true,
    type: 0
});
```
### cjs

```ts
const SubMitt require('sub-mitt');
const subMitt = new SubMitt();
const client = subMitt.createClient();
//订阅消息
client.sub("TP_1", (res) => {
    console.log(res, 'res');
})
//发送消息
subMitt.pub("TP_1", 'send...', {
    persistent: true,
    type: 0
});
```

### 浏览器引入

```ts
<script src="https://unpkg.com/sub-mitt"></script>
const subMitt = new window.SubMitt();
const client = subMitt.createClient();
//订阅消息
client.sub("TP_1", (res) => {
    console.log(res, 'res');
})
//发送消息
subMitt.pub("TP_1", 'send...', {
    persistent: true,
    type: 0
});
```
