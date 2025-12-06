实时语音通话应用
 
一个基于WebRTC和Node.js的实时语音通话网站，支持浏览器间的点对点语音通信。
 
功能特点
 
- 基于WebRTC实现实时语音通话
- 简洁直观的用户界面
- 支持静音控制、通话计时
- 来电提醒与通话管理
- 跨设备、跨浏览器支持（推荐使用Chrome、Edge等现代浏览器）
 
技术栈
 
- 前端：HTML、CSS、JavaScript
- 后端：Node.js、Express、Socket.IO（作为信令服务器）
- 实时通信：WebRTC
- 样式：Font Awesome 图标库
 
项目结构
 
plaintext
  
voice-call-app/
├── client/                 # 前端代码
│   ├── index.html          # 主页面
│   ├── styles.css          # 样式文件
│   └── app.js              # 前端逻辑
├── server/                 # 后端代码
│   └── server.js           # 信令服务器
├── package.json            # 项目依赖
└── README.md               # 说明文档
 
 
本地开发环境搭建
 
前置要求
 
- Node.js (v14+) 和 npm
- 现代浏览器（Chrome、Edge、Firefox等）
- 麦克风设备（并授予浏览器访问权限）
 
安装步骤
 
1. 克隆仓库到本地
 
bash
  
git clone <仓库地址>
cd voice-call-app
 
 
2. 安装依赖
 
bash
  
npm install
 
 
3. 启动开发服务器
 
bash
  
# 同时启动前端和后端服务
npm run dev
 
 
4. 访问应用
 
- 后端服务运行在：http://localhost:3000
- 前端页面运行在：http://localhost:8080
 
使用方法
 
1. 打开两个浏览器窗口（或两个设备），均访问应用地址
2. 在每个窗口中输入不同的用户ID（例如 "user1" 和 "user2"）
3. 点击"进入系统"按钮
4. 在第一个窗口中，输入对方的用户ID（例如 "user2"），点击"发起通话"
5. 在第二个窗口中，会收到来电提示，点击"接听"开始通话
6. 通话过程中可使用"静音"按钮关闭麦克风，或"结束通话"按钮挂断
 
部署说明
 
前端部署（GitHub Pages）
 
1. 修改  client/app.js  中的后端连接地址，指向实际部署的后端服务：
 
javascript
  
socket = io('https://your-backend-url'); // 替换为后端服务地址
 
 
2. 将代码推送到GitHub仓库
3. 进入仓库的  Settings  →  Pages 
4. 选择部署源为  main  分支的  /client  目录
5. 部署完成后，前端地址为： https://your-username.github.io/voice-call-app 
 
后端部署（以Render为例）
 
1. 登录 Render 平台
2. 创建新的Web服务，关联你的GitHub仓库
3. 配置部署信息：
- 构建命令： npm install 
- 启动命令： node server/server.js 
4. 部署完成后，获取后端服务地址并更新前端代码中的连接地址
 
注意事项
 
- 本地开发时使用  localhost  无需HTTPS，但生产环境必须使用HTTPS（WebRTC要求）
- 确保浏览器已授予麦克风访问权限
- 部分网络环境下可能需要配置TURN服务器以确保穿透内网
- 生产环境中应限制CORS访问来源，增强安全性
 
可能遇到的问题
 
- 无法访问麦克风：检查浏览器权限设置，确保已允许麦克风访问
- 通话连接失败：检查网络环境，确保后端服务正常运行
- 声音问题：检查设备音量、麦克风是否正常工作
 
许可证
 
本项目采用MIT许可证 - 详见LICENSE文件
