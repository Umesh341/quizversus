import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import { useAuthStore } from "../Store/authStore";
import { btn, dangerBtn } from "../components/styleComponent.js";
import {Toaster,toast } from "react-hot-toast";


let socket; // Declare the socket variable outside the component

const PlayGround = () => {
  const { getRoomInfo, user, leaveRoom, deleteRoom, isLoading, setIsLoading } = useAuthStore();

  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState(
    localStorage.getItem("roomCode") || ""
  );
  const [playerName, setPlayerName] = useState(user?.username || "Guest");
  const [players, setPlayers] = useState([
    { id: "", name: "", score: 0 }
  ]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isRoomJoined, setIsRoomJoined] = useState(false);
  const [hostId, setHostId] = useState("");
  const [gameState, setGameState] = useState({
    isStarted: false,
    currentQuestion: null,
    questionNumber: 0,
  });
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null);
  const [isQuestionLocked, setIsQuestionLocked] = useState(false);

  useEffect(() => {
    // Initialize the socket connection

    if (!socket) {
      socket = io(import.meta.env.MODE === "production" ? "https://guizbackend.onrender.com/" : "http://localhost:8000/", {
        transports: ["websocket"],
        withCredentials: true,
        secure: true,
        auth: {
          userId: user?._id || "guest", // Use userId if available, otherwise default to "guest"
        },
      });
    }

    // Add socket event listeners
    socket.on("newMessage", (message) => {
      console.log("New message received:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socket.on("roomUpdate", (players) => {
      console.log("Players update:", players);
      setPlayers(players);
    });

    // Game event listeners
    socket.on("gameStarted", ({ questionData, players: updatedPlayers }) => {
      console.log("🎮 Game started event received!");
      console.log("Question data:", questionData);
      console.log("Players:", updatedPlayers);
      setGameState({
        isStarted: true,
        currentQuestion: questionData,
        questionNumber: questionData.questionNumber,
        totalQuestions: questionData.totalQuestions || 10,
      });
      setPlayers(updatedPlayers);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
      setIsQuestionLocked(false);
    });

    socket.on("newQuestion", (questionData) => {
      console.log("New question:", questionData);
      setGameState({
        isStarted: true,
        currentQuestion: questionData,
        questionNumber: questionData.questionNumber,
        totalQuestions: questionData.totalQuestions || 10,
      });
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
      setIsQuestionLocked(false);
    });

    socket.on("scoreUpdate", ({ players: updatedPlayers, userId, isCorrect, isFirstCorrect, winnerName, playerName }) => {
      console.log("Score update:", updatedPlayers);
      setPlayers(updatedPlayers);
      
      if (userId === user?._id) {
        if (isCorrect) {
          if (isFirstCorrect) {
            setAnswerFeedback("🎉 Correct! You were first! +5 points");
          } else {
            setAnswerFeedback("✓ Correct but someone else answered first! No points");
          }
        } else {
          setAnswerFeedback("✗ Wrong! -2 points");
        }
      } else {
        // Show feedback for other players' answers
        if (isFirstCorrect && winnerName) {
          setAnswerFeedback(`${winnerName} answered first! 🏆`);
        } else if (!isCorrect && playerName) {
          setAnswerFeedback(`${playerName} answered wrong! ❌`);
        } else if (isCorrect && playerName) {
          setAnswerFeedback(`${playerName} answered correct (late) ✓`);
        }
      }
    });

    socket.on("questionLocked", () => {
      console.log("Question locked - no more answers allowed");
      setIsQuestionLocked(true);
    });

    socket.on("gameEnded", ({ players: sortedPlayers, winner }) => {
      console.log("Game ended:", sortedPlayers);
      setGameState({
        isStarted: false,
        currentQuestion: null,
        questionNumber: 0,
      });
      setPlayers(sortedPlayers);
      setHasAnswered(false);
      setSelectedAnswer(null);
      setAnswerFeedback(null);
      
      // Show final results
      const results = sortedPlayers.map((p, i) => `${i + 1}. ${p.name}: ${p.score} points`).join('\n');
      alert(`🏆 Game Over!\n\nWinner: ${winner?.name} with ${winner?.score} points!\n\nFinal Scores:\n${results}`);
    });

    // Automatically rejoin the room if the user was in one before the refresh
   // Automatically rejoin the room if the user was in one before the refresh
  const storedRoomCode = localStorage.getItem("roomCode");
  if (storedRoomCode && !isRoomJoined) {
    setIsLoading(true);
    socket.emit(
      "joinRoom",
      { roomCode: storedRoomCode, playerName, userId: user?._id },
      (data) => {
        if (data.error) {
          console.error("Error rejoining room:", data.error);
          localStorage.removeItem("roomCode");
          setIsLoading(false);
          return;
        }
        setRoomCode(data.roomCode);
        setPlayers(data.players);
        setMessages(data.messages || []);
        setHostId(data.hostId);
        setGameState(data.gameState || { isStarted: false, currentQuestion: null, questionNumber: 0 });
        setIsRoomJoined(true);
        setIsLoading(false);
      }
    );
  }
 // Listen for roomDeleted event
  socket.on("roomDeleted", ({ roomCode: deletedRoomCode }) => {
     toast("The room has been deleted.");
   console.log(`Received roomDeleted event for room: ${deletedRoomCode}`);
   console.log(`Current roomCode: ${roomCode}`);
  
      setIsRoomJoined(false);
      console.log(`Room ${deletedRoomCode} has been deleted.`);
      localStorage.removeItem("roomCode");
      setRoomCode("");
      setMessages([]);
      setPlayers([]);

  });

    // Clean up socket connection on component unmount
    return () => {
      socket.off("newMessage");
      socket.off("roomUpdate");
      socket.off("roomDeleted");
      socket.off("gameStarted");
      socket.off("newQuestion");
      socket.off("scoreUpdate");
      socket.off("questionLocked");
      socket.off("gameEnded");
      setIsLoading(false);
    };
  }, [user]);

const createRoom = () => {
  console.log("Creating room...",user?._id);
  setIsLoading(true);
  socket.emit("createRoom", { playerName, userId: user?._id }, (data) => {
    console.log("My room:", data.roomCode);
    console.log("Players:", data.players);
    setRoomCode(data.roomCode);
    setPlayers(data.players);
    setHostId(user?._id);
    localStorage.setItem("roomCode", data.roomCode);
    setIsRoomJoined(true);
    setIsLoading(false);
    toast.success("Room created successfully!");
  });
};
  const joinRoom = () => {
    const code = joinCode.trim();
    if (!code) return alert("Please enter a valid room code.");
    console.log("Joining room:", code);
    setIsLoading(true);
    socket.emit("joinRoom", { roomCode: code, playerName, userId: user?._id }, (data) => {
      setIsLoading(false);
      if (data.error) return toast.error(data.error);
      localStorage.setItem("roomCode", data.roomCode);
      setRoomCode(data.roomCode);
      setPlayers(data.players);
      setMessages(data.messages || []);
      setHostId(data.hostId);
      setGameState(data.gameState || { isStarted: false, currentQuestion: null, questionNumber: 0 });
      setIsRoomJoined(true);
      toast.success("Joined room successfully!");
    });
  };

  const startGame = () => {
    console.log("Starting game with:", { roomCode, userId: user?._id });
    socket.emit("startGame", { roomCode, userId: user?._id }, (response) => {
      console.log("Start game response:", response);
      toast.success("Game started successfully!");
      if (response.error) {
        alert(response.error);
      }
    });
  };

  const submitAnswer = (answer) => {
    if (hasAnswered || isQuestionLocked) return;
    
    setSelectedAnswer(answer);
    setHasAnswered(true);
    
    socket.emit("submitAnswer", { roomCode, userId: user?._id, answer }, (response) => {
      if (response.error) {
        alert(response.error);
        setHasAnswered(false);
        setSelectedAnswer(null);
      }
    });
  };

  const endGame = () => {
    socket.emit("endGame", { roomCode, userId: user?._id }, (response) => {

      if (response.error) {
        alert(response.error);
      }
    });
  };



  const sendMessage = () => {
    if (newMessage.trim() === "") return;
    socket.emit(
      "sendMessage",
      { roomCode, message: newMessage, sender: playerName },
      (response) => {
        if (response.success) {
          setNewMessage(""); // Clear input field after sending
        }
      }
    );
  };

  return (
    <div className="wrapper p-3 mx-auto max-w-5xl">
      {/* Loader */}
      <Toaster position="top-center" reverseOrder={false} />
      {isLoading && (
        <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-700 font-semibold">Loading...</p>
          </div>
        </div>
      )}

      <div className="wrapper">
        {!isRoomJoined ? (
          <>
            <button className={btn}  onClick={createRoom}>
              Create Room
            </button>
            <div className="flex gap-3 mt-4 w-70">
              <input
                type="text"
                placeholder="Enter Code"
                className="input"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button type="button" className={btn} onClick={joinRoom}>
                Join
              </button>
            </div>
          </>
        ) : (
          user?._id === hostId ?(        
                <button
  type="button"
  className={dangerBtn}
  onClick={() => {
    console.log("Deleting room:", roomCode);
    console.log("User ID:", user?._id);
    socket.emit("deleteRoom", { roomCode, userId: user?._id }, (response) => {
      if (response.error) {
       console.error(response.error); // Show error if the user is not the host
      } else {
        localStorage.removeItem("roomCode");
        setRoomCode("");
        setMessages([]);
        setPlayers([]);
        setIsRoomJoined(false);
      }
    });
  }}
>
  Delete Room
</button>
          ) : (
  
 <button
            type="button"
            className={dangerBtn}
            onClick={() => {
             
              localStorage.removeItem("roomCode");
              setRoomCode("");
              setMessages([]);
              setPlayers([]);
              setIsRoomJoined(false);
              leaveRoom(roomCode, user?._id);
              toast.success("Left room successfully!");
            }}
          >
            Leave Room
          </button>
           )
        )}
      </div>

      <div id="join-info">
        {isRoomJoined
          ? `Connected to room: ${roomCode}`
          : "Not connected to any room."}
      </div>
{isRoomJoined && (
      <div className="play-ground">
        {/* Player Scores */}
        <div className="players-section mb-4 p-4 border rounded">
          <h3 className="text-xl font-bold mb-2">Players</h3>
          <div className="grid grid-cols-2 gap-2">
            {players
              .filter((player, index, self) => 
                index === self.findIndex((p) => p.id === player.id)
              )
              .sort((a, b) => (b.score || 0) - (a.score || 0))
              .map((player, index) => (
                <div key={player.id} className="p-2 bg-gray-100 rounded">
                  <span className="font-semibold">{player.name}</span>
                  {player.id === hostId && <span className="ml-2 text-xs bg-yellow-400 px-2 py-1 rounded">HOST</span>}
                  <span className="ml-2 text-blue-600 font-bold">Score: {player.score || 0}</span>
                </div>
              ))
            }
          </div>
        </div>

        {/* Game Controls */}
        {user?._id === hostId && !gameState.isStarted && (
          <button className={`${btn} mb-4`} onClick={startGame}>
            Start Game
          </button>
        )}

        {user?._id === hostId && gameState.isStarted && (
          <button className={`${btn} mb-4 bg-red-500`} onClick={endGame}>
            End Game
          </button>
        )}

        {/* Question Display */}
        {gameState.isStarted && gameState.currentQuestion && (
          <div className="question-section mb-4 p-4 border rounded bg-blue-50">
            <h3 className="text-lg font-bold mb-2">Question {gameState.questionNumber} / {gameState.totalQuestions || 10}</h3>
            <p className="text-2xl mb-4">{gameState.currentQuestion.question}</p>
            
            <div className="grid grid-cols-2 gap-3">
              {gameState.currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => submitAnswer(option)}
                  disabled={hasAnswered || isQuestionLocked}
                  className={`p-3 rounded border-2 font-semibold transition ${
                    selectedAnswer === option
                      ? "bg-blue-500 text-white border-blue-700"
                      : hasAnswered || isQuestionLocked
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-white hover:bg-blue-100 border-blue-300"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            {answerFeedback && (
              <div className={`mt-4 p-3 rounded font-bold ${
                answerFeedback.includes("Correct") ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
              }`}>
                {answerFeedback}
              </div>
            )}
          </div>
        )}

        {/* Chat Section */}
        <div className="chat-box border rounded p-4">
          <h3 className="text-lg font-bold mb-2">Chat</h3>
          <div className="messages h-40 overflow-y-auto mb-2 p-2 bg-gray-50 rounded">
            {messages.map((msg, index) => (
              <div key={index} className="mb-1">
                <strong>{msg.sender}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded"
            />
            <button type="submit" className={btn}>Send</button>
          </form>
        </div>
      </div>
    )}
    </div>
  );
};

export default PlayGround;
