import { RoomModel } from "../model/room.model.js";
import { generateMathQuestion } from "../utils/questionGenerator.js";

// Start the game
export const startGame = async (io, socket, { roomCode, userId }) => {
  try {
    console.log("Starting game for room:", roomCode);
    const room = await RoomModel.findOne({ roomCode });
    
    if (!room) {
      console.log("Room not found:", roomCode);
      return { error: "Room does not exist." };
    }
    
    // Check if the user is the host
    if (room.hostId !== userId) {
      console.log("User is not host:", userId, "Host is:", room.hostId);
      return { error: "Only the host can start the game." };
    }
    
    // Check if game is already started
    if (room.gameState.isStarted) {
      console.log("Game already started");
      return { error: "Game already started." };
    }
    
    // Initialize game state
    room.gameState.isStarted = true;
    room.gameState.questionNumber = 1;
    room.gameState.totalQuestions = 10;
    
    // Reset all player scores
    room.players.forEach(player => {
      player.score = 0;
    });
    
    // Generate first question
    const question = generateMathQuestion();
    console.log("Generated question:", question);
    room.gameState.currentQuestion = question;
    room.gameState.answeredPlayers = [];
    room.gameState.hasCorrectAnswer = false;
    
    await room.save();
    
    // Send question to all players (without correct answer)
    const questionData = {
      question: question.question,
      options: question.options,
      questionNumber: room.gameState.questionNumber,
      totalQuestions: 10,
    };
    
    console.log("Emitting gameStarted to room:", roomCode);
    console.log("Question data:", questionData);
    console.log("Players:", room.players);
    
    io.to(roomCode).emit("gameStarted", {
      questionData,
      players: room.players,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error starting game:", error);
    return { error: "Failed to start game." };
  }
};

// Submit answer
export const submitAnswer = async (io, socket, { roomCode, userId, answer }) => {
  try {
    const room = await RoomModel.findOne({ roomCode });
    
    if (!room) {
      return { error: "Room does not exist." };
    }
    
    if (!room.gameState.isStarted) {
      return { error: "Game has not started." };
    }
    
    // Check if player already answered
    if (room.gameState.answeredPlayers.includes(userId)) {
      return { error: "You have already answered this question." };
    }
    
    // Find the player
    const player = room.players.find(p => p.id === userId);
    if (!player) {
      return { error: "Player not found in room." };
    }
    
    // Check if answer is correct
    const isCorrect = answer === room.gameState.currentQuestion.correctAnswer;
    
    // Check if this is the first correct answer (before marking player as answered)
    const isFirstCorrect = isCorrect && room.gameState.answeredPlayers.length === 0;
    
    // Mark player as answered
    room.gameState.answeredPlayers.push(userId);
    
    // Lock the question for all users immediately
    io.to(roomCode).emit("questionLocked");
    
    // Only first correct answer gets points
    if (isFirstCorrect) {
      player.score += 5;
      room.gameState.hasCorrectAnswer = true;
      await room.save();
      
      console.log(`Player ${player.name} got first correct answer! Score: ${player.score}`);
      
      // Notify all players about the score update
      io.to(roomCode).emit("scoreUpdate", {
        players: room.players,
        userId,
        isCorrect: true,
        isFirstCorrect: true,
        winnerName: player.name,
      });
      
      // Check if this was the last question
      if (room.gameState.questionNumber >= 10) {
        // Game over - show final results
        setTimeout(async () => {
          await endGameAutomatically(io, roomCode);
        }, 1000);
      } else {
        // Send next question immediately after first correct answer
        setTimeout(async () => {
          await sendNextQuestion(io, roomCode);
        }, 500);
      }
      
      return { success: true, isCorrect: true, isFirstCorrect: true };
    } else if (isCorrect) {
      // Correct but not first - no points, just save
      await room.save();
      
      io.to(roomCode).emit("scoreUpdate", {
        players: room.players,
        userId,
        isCorrect: true,
        isFirstCorrect: false,
        playerName: player.name,
      });
      
      // Check if all players have answered
      if (room.gameState.answeredPlayers.length >= room.players.length) {
        console.log("All players answered - moving to next question");
        
        if (room.gameState.questionNumber >= 10) {
          setTimeout(async () => {
            await endGameAutomatically(io, roomCode);
          }, 1000);
        } else {
          setTimeout(async () => {
            await sendNextQuestion(io, roomCode);
          }, 1000);
        }
      }
      
      return { success: true, isCorrect: true, isFirstCorrect: false };
    } else {
      // Wrong answer - lose points and advance immediately
      player.score -= 2;
      await room.save();
      
      io.to(roomCode).emit("scoreUpdate", {
        players: room.players,
        userId,
        isCorrect: false,
        isFirstCorrect: false,
        playerName: player.name,
      });
      
      // Advance to next question immediately on wrong answer
      console.log("Wrong answer - moving to next question immediately");
      
      if (room.gameState.questionNumber >= 10) {
        setTimeout(async () => {
          await endGameAutomatically(io, roomCode);
        }, 1000);
      } else {
        setTimeout(async () => {
          await sendNextQuestion(io, roomCode);
        }, 1000);
      }
      
      return { success: true, isCorrect: false };
    }
  } catch (error) {
    console.error("Error submitting answer:", error);
    return { error: "Failed to submit answer." };
  }
};

// Send next question
const sendNextQuestion = async (io, roomCode) => {
  try {
    const room = await RoomModel.findOne({ roomCode });
    
    if (!room) return;
    
    // Check if we've reached 10 questions
    if (room.gameState.questionNumber >= 10) {
      await endGameAutomatically(io, roomCode);
      return;
    }
    
    // Generate new question
    const question = generateMathQuestion();
    room.gameState.currentQuestion = question;
    room.gameState.questionNumber += 1;
    room.gameState.answeredPlayers = [];
    room.gameState.hasCorrectAnswer = false;
    
    await room.save();
    
    console.log(`Sending question ${room.gameState.questionNumber}/10 to room ${roomCode}`);
    
    // Send question to all players
    const questionData = {
      question: question.question,
      options: question.options,
      questionNumber: room.gameState.questionNumber,
      totalQuestions: 10,
    };
    
    const currentQuestionNumber = room.gameState.questionNumber;
    
    io.to(roomCode).emit("newQuestion", questionData);
  } catch (error) {
    console.error("Error sending next question:", error);
  }
};

// End game automatically after 10 questions
const endGameAutomatically = async (io, roomCode) => {
  try {
    const room = await RoomModel.findOne({ roomCode });
    
    if (!room) return;
    
    room.gameState.isStarted = false;
    await room.save();
    
    // Sort players by score (highest first)
    const sortedPlayers = room.players.sort((a, b) => b.score - a.score);
    
    console.log("Game ended for room:", roomCode);
    console.log("Final scores:", sortedPlayers);
    
    io.to(roomCode).emit("gameEnded", {
      players: sortedPlayers,
      winner: sortedPlayers[0],
    });
  } catch (error) {
    console.error("Error ending game:", error);
  }
};

// End game
export const endGame = async (io, socket, { roomCode, userId }) => {
  try {
    const room = await RoomModel.findOne({ roomCode });
    
    if (!room) {
      return { error: "Room does not exist." };
    }
    
    // Check if the user is the host
    if (room.hostId !== userId) {
      return { error: "Only the host can end the game." };
    }
    
    room.gameState.isStarted = false;
    await room.save();
    
    // Sort players by score
    const sortedPlayers = room.players.sort((a, b) => b.score - a.score);
    
    io.to(roomCode).emit("gameEnded", {
      players: sortedPlayers,
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error ending game:", error);
    return { error: "Failed to end game." };
  }
};
