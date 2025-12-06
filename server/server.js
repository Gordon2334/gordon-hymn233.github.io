const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// 初始化Express和HTTP服务器
const app = express();
app.use(cors());
const server = http.createServer(app);

// 配置Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*",  // 生产环境需限制为具体域名
    methods: ["GET", "POST"]
  }
});

// 存储在线用户 (userId: socketId)
const users = {};
// 存储房间信息 (roomId: { users: [], caller: string })
const rooms = {};

// 处理Socket连接
io.on('connection', (socket) => {
  console.log('新客户端连接:', socket.id);

  // 用户注册
  socket.on('register', (userId) => {
    users[userId] = socket.id;
    socket.userId = userId;
    console.log(`用户注册: ${userId} -> ${socket.id}`);
    io.to(socket.id).emit('registered', { success: true, userId });
  });

  // 发起通话
  socket.on('call', (data) => {
    const { callerId, calleeId, offer } = data;
    const calleeSocketId = users[calleeId];
    
    if (calleeSocketId) {
      // 创建房间
      const roomId = `${callerId}-${calleeId}`;
      rooms[roomId] = {
        users: [callerId, calleeId],
        caller: callerId
      };
      
      // 加入房间
      socket.join(roomId);
      
      // 向被叫方发送通话请求
      io.to(calleeSocketId).emit('incoming-call', {
        callerId,
        roomId,
        offer
      });
    } else {
      io.to(socket.id).emit('call-error', { message: '被叫用户不在线' });
    }
  });

  // 接受通话
  socket.on('accept-call', (data) => {
    const { roomId, answer } = data;
    const room = rooms[roomId];
    
    if (room) {
      socket.join(roomId);
      // 向呼叫方发送应答
      const callerSocketId = users[room.caller];
      if (callerSocketId) {
        io.to(callerSocketId).emit('call-accepted', { answer, roomId });
      }
    }
  });

  // 拒绝通话
  socket.on('reject-call', (data) => {
    const { callerId } = data;
    const callerSocketId = users[callerId];
    if (callerSocketId) {
      io.to(callerSocketId).emit('call-rejected', { message: '对方拒绝了通话' });
    }
  });

  // 转发ICE候选者
  socket.on('ice-candidate', (data) => {
    const { roomId, candidate } = data;
    // 向房间内其他用户转发候选者
    socket.to(roomId).emit('ice-candidate', { candidate });
  });

  // 结束通话
  socket.on('end-call', (data) => {
    const { roomId } = data;
    socket.to(roomId).emit('call-ended', { message: '对方已结束通话' });
    // 清理房间
    if (rooms[roomId]) {
      delete rooms[roomId];
    }
  });

  // 断开连接处理
  socket.on('disconnect', () => {
    console.log('客户端断开连接:', socket.id);
    // 移除用户
    for (const [userId, socketId] of Object.entries(users)) {
      if (socketId === socket.id) {
        delete users[userId];
        // 通知相关用户
        Object.values(rooms).forEach(room => {
          if (room.users.includes(userId)) {
            socket.to(room.roomId).emit('user-disconnected', { userId });
            delete rooms[room.roomId];
          }
        });
        break;
      }
    }
  });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
