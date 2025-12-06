document.addEventListener('DOMContentLoaded', () => {
  // DOM元素
  const loginSection = document.getElementById('loginSection');
  const mainSection = document.getElementById('mainSection');
  const loginBtn = document.getElementById('loginBtn');
  const userIdInput = document.getElementById('userId');
  const currentUserIdEl = document.getElementById('currentUserId');
  const connectionStatusEl = document.getElementById('connectionStatus');
  const calleeIdInput = document.getElementById('calleeId');
  const callBtn = document.getElementById('callBtn');
  const endCallBtn = document.getElementById('endCallBtn');
  const muteBtn = document.getElementById('muteBtn');
  const callStatusSection = document.getElementById('callStatusSection');
  const remoteUserIdEl = document.getElementById('remoteUserId');
  const callTimerEl = document.getElementById('callTimer');
  const incomingCallSection = document.getElementById('incomingCallSection');
  const incomingCallerIdEl = document.getElementById('incomingCallerId');
  const acceptCallBtn = document.getElementById('acceptCallBtn');
  const rejectCallBtn = document.getElementById('rejectCallBtn');

  // 全局变量
  let socket;
  let userId;
  let peerConnection;
  let localStream;
  let isMuted = false;
  let callTimer;
  let callStartTime;
  let currentRoomId;
  let incomingCallData = null;

  // 配置WebRTC ICE服务器
  const configuration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  // 登录处理
  loginBtn.addEventListener('click', () => {
    userId = userIdInput.value.trim();
    if (!userId) {
      alert('请输入用户ID');
      return;
    }

    // 连接到服务器
    connectToServer();
  });

  // 连接到信令服务器
  function connectToServer() {
    socket = io('http://localhost:3000'); // 替换为实际服务器地址

    socket.on('connect', () => {
      console.log('连接到服务器');
      connectionStatusEl.textContent = '已连接';
      connectionStatusEl.className = 'status connected';
      
      // 注册用户ID
      socket.emit('register', userId);
    });

    socket.on('registered', () => {
      // 显示主界面
      loginSection.classList.add('hidden');
      mainSection.classList.remove('hidden');
      currentUserIdEl.textContent = userId;
      
      // 注册事件监听
      setupEventListeners();
    });

    socket.on('disconnect', () => {
      console.log('与服务器断开连接');
      connectionStatusEl.textContent = '未连接';
      connectionStatusEl.className = 'status disconnected';
    });
  }

  // 设置事件监听
  function setupEventListeners() {
    // 发起通话
    callBtn.addEventListener('click', startCall);
    
    // 结束通话
    endCallBtn.addEventListener('click', endCall);
    
    // 静音切换
    muteBtn.addEventListener('click', toggleMute);
    
    // 接受通话
    acceptCallBtn.addEventListener('click', acceptCall);
    
    // 拒绝通话
    rejectCallBtn.addEventListener('click', rejectCall);
    
    // 监听来电
    socket.on('incoming-call', handleIncomingCall);
    
    // 监听通话接受
    socket.on('call-accepted', handleCallAccepted);
    
    // 监听通话拒绝
    socket.on('call-rejected', handleCallRejected);
    
    // 监听ICE候选者
    socket.on('ice-candidate', handleIceCandidate);
    
    // 监听通话结束
    socket.on('call-ended', handleCallEnded);
  }

  // 获取本地媒体流
  async function getLocalStream() {
    try {
      localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });
      return localStream;
    } catch (error) {
      console.error('获取媒体流失败:', error);
      alert('无法访问麦克风，请检查权限');
      throw error;
    }
  }

  // 创建对等连接
  function createPeerConnection() {
    peerConnection = new RTCPeerConnection(configuration);
    
    // 添加本地流到连接
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }
    
    // 监听远程流
    peerConnection.ontrack = (event) => {
      // 远程音频会自动播放
      console.log('收到远程音频流');
    };
    
    // 监听ICE候选者
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', {
          roomId: currentRoomId,
          candidate: event.candidate
        });
      }
    };
    
    // 监听连接状态变化
    peerConnection.oniceconnectionstatechange = () => {
      console.log('ICE连接状态:', peerConnection.iceConnectionState);
      if (peerConnection.iceConnectionState === 'failed' || 
          peerConnection.iceConnectionState === 'disconnected') {
        endCall();
