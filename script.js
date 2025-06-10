let username = "";
let currentRoom = "General";
let socket;

function enterChat() {
  const input = document.getElementById("usernameInput");
  const error = document.getElementById("error");
  username = input.value.trim();
  if (!username) {
    error.textContent = "Username is required.";
    return;
  }
  document.getElementById("loginScreen").classList.add("hidden");
  document.getElementById("chatScreen").classList.remove("hidden");
  document.getElementById("currentUser").textContent = username;

  socket = new WebSocket("ws://localhost:3000");
  // Emoji Picker
const picker = new EmojiButton();
const emojiIcon = document.querySelector('.emoji-icon');
const messageInput = document.getElementById('messageInput');

picker.on('emoji', emoji => {
  messageInput.value += emoji;
});

emojiIcon.addEventListener('click', () => {
  picker.togglePicker(emojiIcon);
});
// Voice Input (Mic)
const micIcon = document.querySelector('.mic-icon');

micIcon.addEventListener('click', () => {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Speech recognition not supported in this browser.");
    return;
  }

  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;

  recognition.start();

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value += transcript + " ";
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error", event);
  };
});

  socket.addEventListener("open", () => {
    socket.send(JSON.stringify({ type: "join", username, room: currentRoom }));
  });

  socket.addEventListener("message", (event) => {
    const data = JSON.parse(event.data);
    if (data.type === "message") {
      addMessage(data);
    } else if (data.type === "roomList") {
      updateRoomList(data.rooms);
    }
  });

  document.getElementById("messageForm").addEventListener("submit", e => {
    e.preventDefault();
    const input = document.getElementById("messageInput");
    const message = input.value.trim();
    if (message) {
      socket.send(JSON.stringify({ type: "message", username, room: currentRoom, message }));
      input.value = "";
    }
  });
}

function addMessage({ username, message, timestamp }) {
  const box = document.getElementById("chatBox");
  const msg = document.createElement("div");
  msg.classList.add("message");
  msg.innerHTML = `<strong>${username}</strong>: ${message} <small>${new Date(timestamp).toLocaleTimeString()}</small>`;
  box.appendChild(msg);
  box.scrollTop = box.scrollHeight;
}

function createRoom() {
  const input = document.getElementById("newRoomInput");
  const roomName = input.value.trim();
  if (roomName && socket) {
    currentRoom = roomName;
    socket.send(JSON.stringify({ type: "join", username, room: currentRoom }));
    document.getElementById("currentRoom").textContent = currentRoom;
    document.getElementById("chatBox").innerHTML = "";
    input.value = "";
  }
}

function updateRoomList(rooms) {
  const list = document.getElementById("roomList");
  list.innerHTML = "";
  rooms.forEach(room => {
    const li = document.createElement("li");
    li.textContent = room;
    li.onclick = () => {
      currentRoom = room;
      socket.send(JSON.stringify({ type: "join", username, room }));
      document.getElementById("currentRoom").textContent = room;
      document.getElementById("chatBox").innerHTML = "";
    };
    list.appendChild(li);
  });
}
