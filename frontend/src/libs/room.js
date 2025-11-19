import { createRoom, joinRoom } from "./socket.js";

// Fetch room info
export const fetchRoomInfo = async (roomCode, getRoomInfo, setRoomCode, setMessages, setIsConnected) => {
  if (roomCode) {
    setRoomCode(roomCode);
    setIsConnected(true);
    const roomInfo = await getRoomInfo(roomCode);
    console.log(roomInfo);
    setMessages(roomInfo.messages || []);
  }
};

// Handle creating a room
export const handleCreateRoom = (playerName, setRoomCode, setIsConnected) => {
  createRoom(playerName, (data) => {
    setRoomCode(data.roomCode);
    localStorage.setItem("roomCode", data.roomCode);
    setIsConnected(true);
  });
};

// Handle joining a room
export const handleJoinRoom = (playerName, setRoomCode, fetchRoomInfo, getRoomInfo, setIsConnected, setMessages) => {
  const code = prompt("Enter room code");
  joinRoom(code, playerName, (data) => {
    if (data.error) return alert(data.error);
    setRoomCode(data.roomCode);
    localStorage.setItem("roomCode", data.roomCode);
    fetchRoomInfo(data.roomCode, getRoomInfo, setRoomCode, setMessages, setIsConnected);
    setIsConnected(true);
  });
};