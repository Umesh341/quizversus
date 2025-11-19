import { server } from "../index.js";
import { Server } from "socket.io";
import { RoomModel } from "../model/room.model.js";
import { startGame, submitAnswer, endGame } from "../controllers/game.controller.js";

const io = new Server(server,{
    cors: {
        origin: "http://localhost:5173", // frontend origin
        methods: ["GET", "POST"],
        credentials: true,
    },  
});

// STORES ALL ROOMS
const rooms = {};  // { roomCode: { players: [] } }

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  // ===========================
  // CREATE ROOM
  // ===========================
  socket.on("createRoom", async ({ playerName, userId }, callback) => {
    console.log("Creating room...");
    const roomCode = generateRoomCode();

    try {
      const newRoom = await RoomModel.create({
        roomCode,
        hostId: userId,
        players: [{ id: userId, name: playerName, score: 0 }],
        messages: [],
      });

      socket.join(roomCode);
      callback({ roomCode, players: newRoom.players });
      io.to(roomCode).emit("roomUpdate", newRoom.players);
    } catch (error) {
      console.error("Error creating room:", error);
      callback({ error: "Failed to create room." });
    }
  });

  // ===========================
  // JOIN ROOM
  // ===========================
  socket.on("joinRoom", async ({ roomCode, playerName, userId }, callback) => {
    try {
      const room = await RoomModel.findOne({ roomCode });
      if (!room) return callback({ error: "Room does not exist!" });

      // Check if player already exists
      const playerExists = room.players.some((player) => player.id === userId);
      if (!playerExists) {
        room.players.push({ id: userId, name: playerName, score: 0 });
        await room.save();
      }

      socket.join(roomCode);
      callback({ 
        roomCode, 
        players: room.players, 
        messages: room.messages,
        hostId: room.hostId,
        gameState: room.gameState,
      });
      io.to(roomCode).emit("roomUpdate", room.players);
    } catch (error) {
      console.error("Error joining room:", error);
      callback({ error: "Failed to join room." });
    }
  });

  // ===========================
  // SEND MESSAGE
  // ===========================
  socket.on("sendMessage", async ({ roomCode, message, sender }, callback) => {
    try {
      const room = await RoomModel.findOne({ roomCode });
      if (!room) return callback({ error: "Room does not exist!" });

      const newMessage = { sender, message };
      room.messages.push(newMessage);
      await room.save();

      io.to(roomCode).emit("newMessage", newMessage);
      callback({ success: true });
    } catch (error) {
      console.error("Error sending message:", error);
      callback({ error: "Failed to send message." });
    }
  });

  // ===========================
  // DELETE ROOM
  // ===========================
  socket.on("deleteRoom", async ({ roomCode, userId }, callback) => {
    try {
      const room = await RoomModel.findOne({ roomCode });
      if (!room) return callback({ error: "Room does not exist!" });

      // Check if user is the host
      if (room.hostId !== userId) {
        return callback({ error: "Only the host can delete the room." });
      }

      await RoomModel.deleteOne({ roomCode });
      io.to(roomCode).emit("roomDeleted", { roomCode });
      callback({ success: true });
    } catch (error) {
      console.error("Error deleting room:", error);
      callback({ error: "Failed to delete room." });
    }
  });

  // ===========================
  // START GAME
  // ===========================
  socket.on("startGame", async ({ roomCode, userId }, callback) => {
    const result = await startGame(io, socket, { roomCode, userId });
    callback(result);
  });

  // ===========================
  // SUBMIT ANSWER
  // ===========================
  socket.on("submitAnswer", async ({ roomCode, userId, answer }, callback) => {
    const result = await submitAnswer(io, socket, { roomCode, userId, answer });
    callback(result);
  });

  // ===========================
  // END GAME
  // ===========================
  socket.on("endGame", async ({ roomCode, userId }, callback) => {
    const result = await endGame(io, socket, { roomCode, userId });
    callback(result);
  });

  // ===========================
  // DISCONNECT
  // ===========================
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});
