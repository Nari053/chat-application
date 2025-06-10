const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let users = {};
let rooms = { General: [] };

function broadcastToRoom(room, messageObj) {
  rooms[room]?.forEach(userSocket => {
    if (userSocket.readyState === WebSocket.OPEN) {
      userSocket.send(JSON.stringify(messageObj));
    }
  });
}

wss.on('connection', (ws) => {
  let currentUser = null;
  let currentRoom = 'General';

  ws.on('message', (msg) => {
    let data;
    try {
      data = JSON.parse(msg);
    } catch (e) {
      console.error("Invalid JSON", msg);
      return;
    }

    if (data.type === 'join') {
      currentUser = data.username;
      currentRoom = data.room;

      if (!rooms[currentRoom]) {
        rooms[currentRoom] = [];
      }

      // Prevent same username in same room
      rooms[currentRoom] = rooms[currentRoom].filter(socket => socket !== ws);
      rooms[currentRoom].push(ws);

      users[ws] = { username: currentUser, room: currentRoom };
      const roomNames = Object.keys(rooms);
      ws.send(JSON.stringify({ type: 'roomList', rooms: roomNames }));

      broadcastToRoom(currentRoom, {
        type: 'message',
        username: 'System',
        message: `${currentUser} joined the room.`,
        timestamp: Date.now()
      });
    }

    if (data.type === 'message') {
      broadcastToRoom(currentRoom, {
        type: 'message',
        username: currentUser,
        message: data.message,
        timestamp: Date.now()
      });
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom] = rooms[currentRoom].filter(socket => socket !== ws);
      broadcastToRoom(currentRoom, {
        type: 'message',
        username: 'System',
        message: `${currentUser} left the room.`,
        timestamp: Date.now()
      });
    }
    delete users[ws];
  });
});

console.log('WebSocket server running on ws://localhost:3000');
