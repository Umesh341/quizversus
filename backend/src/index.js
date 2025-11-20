import express from 'express';
import http from 'http';
import { Server } from 'socket.io';



import authRoutes from './routes/auth.routes.js';
import {connectDB} from './libs/db.js';

import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';


dotenv.config();
const app = express();

const PORT = process.env.PORT || 3000;

console.log("🚀 Server MODE:", process.env.MODE);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cookieParser());

// Middleware to parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({extended: true, limit: "25kb"})) 
app.use(cors({
    origin: 'https://quizversus.vercel.app', // frontend origin
    credentials: true,
    secure: true,
    methods: ["GET", "POST", "PUT", "DELETE"], // allow cookies to 
})); 

// =====================================
const allowedOrigins = [
 'https://quizversus.vercel.app',
  "http://localhost:5173"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  console.log("Request received from origin:", origin);

  if (!origin) {
    // Allow non-browser or preflight requests
    res.setHeader("Access-Control-Allow-Origin", "*");
    return next();
  }

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  }

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});









 const server = http.createServer(app);
const io = new Server(server);



// STORES ALL ROOMS
const rooms = {};  // { roomCode: { players: [] } }

import { RoomModel } from './model/room.model.js';
import { startGame, submitAnswer, endGame } from './controllers/game.controller.js';

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const users = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.auth.userId;
  users[socket.id] = userId;
  // join user-specific room
      socket.join("user:" + userId)
        console.log(`User connected: ${userId}`);

  // ===========================
  // CREATE ROOM
  // ===========================
  socket.on("createRoom", async ({ playerName, userId }, callback) => {
    console.log("Creating room...");
    console.log("User ID:", userId);
    const roomCode = generateRoomCode();

    const newRoom = await  RoomModel.create({
      roomCode,
       hostId: userId, 
      players: [{ id: userId, name: playerName, score: 0 }],
      messages: [],
    });

    socket.join(roomCode);
  

    callback({ roomCode, players: newRoom.players });
  });

  // ===========================
  // JOIN ROOM
  // ===========================
  socket.on("joinRoom", async ({ roomCode, playerName, userId }, callback) => {
    const room = await RoomModel.findOne({ roomCode });
    if (!room) return callback({ error: "Room does not exist!" });

    socket.join(roomCode);
   // Check if the player already exists in the room
  const playerExists = room.players.some((player) => player.id === userId);
  if (!playerExists) {
    room.players.push({ id: userId, name: playerName, score: 0 });
    await room.save();
  }

    
    callback({ 
      roomCode, 
      players: room.players, 
      messages: room.messages,
      hostId: room.hostId,
      gameState: room.gameState,
    });
    io.to(roomCode).emit("roomUpdate", room.players);
  });



  // ===========================
  // SEND MESSAGE
  // ===========================
  socket.on("sendMessage", async ({ roomCode, message, sender }, callback) => {
   const room = await RoomModel.findOne({ roomCode });
    if (!room) return callback({ error: "Room does not exist!" });

    const newMessage = { sender, message };
    console.log(newMessage);
    room.messages.push(newMessage); // Save message in room's message history
    await room.save();

    io.to(roomCode).emit("newMessage", newMessage); // Broadcast message to all users in the room
    callback({ success: true });
  });

  // ======================================================
// Backend: Emit roomDeleted event when a room is deleted
// ========================================
// Backend: Room deletion logic
socket.on("deleteRoom", async ({ roomCode, userId }, callback) => {
  const room = await RoomModel.findOne({ roomCode });

  if (!room) {
    return callback({ error: "Room does not exist." });
  }

  // Check if the user is the host
  if (room.hostId !== userId) {
    return callback({ error: "Only the host can delete the room." });
  }

  // Delete the room and notify all users
  await RoomModel.deleteOne({ roomCode });
  io.to(roomCode).emit("roomDeleted", { roomCode }); // Notify all users in the room
  callback({ success: true });
});

  // ===========================
  // START GAME
  // ===========================
  socket.on("startGame", async ({ roomCode, userId }, callback) => {
    console.log("Start game request received:", { roomCode, userId });
    const result = await startGame(io, socket, { roomCode, userId });
    console.log("Start game result:", result);
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

   // Disconnect (only if not refreshing)
  socket.on("disconnect", async () => {
    const disconnectedUser = users[socket.id];
    console.log(`User disconnected: ${disconnectedUser}`);
    delete users[socket.id]; // clean up
  });
});

app.use((req, res, next) => {
    console.log(`Request received from origin: ${req.headers.origin}`);
    next();
});
app.use('/api/auth', authRoutes );


app.get('/', (req, res) => {
    res.send('QuizVersus Backend is running');
});


connectDB().then(() => {
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
})

}).catch((error) => {
    console.log("Failed to connect to DB ", error);
});