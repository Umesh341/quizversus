import { io } from "socket.io-client";

let socket;

// Initialize the socket connection
export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io("https://guizbackend.onrender.com/", {
      transports: ["websocket"],
      withCredentials: true,
      auth: {
        userId: userId || "guest", // Use userId if available, otherwise default to "guest"
      },
    });
  }
  return socket;
};

// Add event listeners
export const addSocketListeners = (onRoomUpdate, onNewMessage) => {
  if (!socket) return;

  socket.on("roomUpdate", (players) => {
    console.log("Players update:", players);
    onRoomUpdate(players); // Call the callback function
  });

 
};

// Remove event listeners
export const removeSocketListeners = () => {
  if (!socket) return;

  socket.off("roomUpdate");
  socket.off("newMessage");
};

// Emit events
export const createRoom = (playerName, callback) => {
  if (!socket) return;

  socket.emit("createRoom", playerName, (data) => {
    console.log("Room created:", data);
    callback(data);
  });
};

export const joinRoom = (roomCode, playerName, callback) => {
  if (!socket) return;

  socket.emit("joinRoom", { roomCode, playerName }, (data) => {
    console.log("Joined room:", data);
    callback(data);
  });
};

export const sendMessage = (roomCode, message, sender, callback) => {
  if (!socket) return;

  socket.emit("sendMessage", { roomCode, message, sender }, (response) => {
    callback(response);
  });
};

// Disconnect the socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};