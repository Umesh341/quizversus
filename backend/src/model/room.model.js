import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomCode: { type: String, unique: true, required: true },
  hostId: { type: String, required: true },
  players: [
    {
      id: { type: String, required: true },
      name: { type: String, required: true },
      score: { type: Number, default: 0 },
    },
  ],
  messages: [
    {
      sender: { type: String, required: true },
      message: { type: String, required: true },
    },
  ],
  gameState: {
    isStarted: { type: Boolean, default: false },
    currentQuestion: {
      question: String,
      options: [Number],
      correctAnswer: Number,
    },
    questionNumber: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 10 },
    answeredPlayers: [{ type: String }],
    hasCorrectAnswer: { type: Boolean, default: false },
  },
});

const RoomModel = mongoose.model("Room", roomSchema);

export { RoomModel };