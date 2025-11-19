// Import React and necessary hooks for state and lifecycle
import React, { useState, useEffect, useRef } from 'react';
// Import the function to generate a random math question
import { generateQuestion } from '../components/GenerateQuestion';

// How many seconds to show the result before moving to the next question
const TIMER_DURATION = .2; // seconds to show result before next question
const GAME_DURATION = 30; // 2 minutes in seconds

// Main Quiz component
const Play = () => {
  // State to hold the current question and options
  const [quiz, setQuiz] = useState(generateQuestion());
  // State to hold which option the user selected
  const [selected, setSelected] = useState(null);
  // State to track when the question started
  const [startTime, setStartTime] = useState(Date.now());
  // State to hold how much time the user took to answer
  const [timeTaken, setTimeTaken] = useState(null);
  // State to show the live timer as the user thinks
  const [liveTime, setLiveTime] = useState(0);
  // Ref to store the interval so we can clear it later
  const intervalRef = useRef();
  // State for question number
  const [questionNumber, setQuestionNumber] = useState(1);
  // State for notification bar
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  
  // Game state
  const [gameStartTime] = useState(Date.now());
  const [gameTimeLeft, setGameTimeLeft] = useState(GAME_DURATION);
  const [gameFinished, setGameFinished] = useState(false);
  const [gameResults, setGameResults] = useState([]);
  const gameTimerRef = useRef();

  // Start game timer
  useEffect(() => {
    gameTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - gameStartTime) / 1000;
      const timeLeft = Math.max(GAME_DURATION - elapsed, 0);
      setGameTimeLeft(Math.ceil(timeLeft));
      
      if (timeLeft <= 0) {
        setGameFinished(true);
        clearInterval(gameTimerRef.current);
        clearInterval(intervalRef.current);
      }
    }, 1000);

    return () => clearInterval(gameTimerRef.current);
  }, [gameStartTime]);

  // This effect runs every time a new question is loaded
  useEffect(() => {
    if (gameFinished) return;
    
    // Start a timer that updates every 100ms
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      setLiveTime(elapsed.toFixed(1));
    }, 100);

    // Clean up the timer when question changes or component unmounts
    return () => clearInterval(intervalRef.current);
  }, [quiz, startTime, gameFinished]);

  // This effect runs when the user selects an answer
  useEffect(() => {
    if (selected !== null && !gameFinished) {
      // Stop the live timer
      clearInterval(intervalRef.current);
      
      // Store result
      const result = {
        questionNumber,
        question: quiz.question,
        correctAnswer: quiz.answer,
        selectedAnswer: selected,
        isCorrect: selected === quiz.answer,
        timeTaken: parseFloat(timeTaken)
      };
      setGameResults(prev => [...prev, result]);
      
      // Wait TIMER_DURATION seconds, then load the next question
      setTimeout(() => {
        if (!gameFinished) {
          setQuiz(generateQuestion());
          setSelected(null);
          setStartTime(Date.now());
          setTimeTaken(null);
          setQuestionNumber(prev => prev + 1);
        }
      }, TIMER_DURATION * 1000);
    }
  }, [selected, gameFinished]);

  // Called when the user clicks an option
  const handleSelect = (option) => {
    // Prevent selecting again if already answered or game finished
    if (selected !== null || gameFinished) return;
    setSelected(option);
    // Calculate and store the time taken to answer
    setTimeTaken(((Date.now() - startTime) / 1000).toFixed(1));
    
    // Show notification
    const isCorrect = option === quiz.answer;
    setNotificationMessage(isCorrect ? 'Correct!' : `Wrong! Answer: ${quiz.answer}`);
    setNotificationType(isCorrect ? 'success' : 'error');
    setShowNotification(true);
    
    // Hide notification after 1 second
    setTimeout(() => {
      setShowNotification(false);
    }, 1000);
  };

  // Restart game function
  const restartGame = () => {
    setQuiz(generateQuestion());
    setSelected(null);
    setStartTime(Date.now());
    setTimeTaken(null);
    setLiveTime(0);
    setQuestionNumber(1);
    setGameTimeLeft(GAME_DURATION);
    setGameFinished(false);
    setGameResults([]);
    setShowNotification(false);
    
    // Restart game timer
    gameTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - Date.now()) / 1000;
      const timeLeft = Math.max(GAME_DURATION - elapsed, 0);
      setGameTimeLeft(Math.ceil(timeLeft));
      
      if (timeLeft <= 0) {
        setGameFinished(true);
        clearInterval(gameTimerRef.current);
        clearInterval(intervalRef.current);
      }
    }, 1000);
  };

  // Calculate stats
  const correctAnswers = gameResults.filter(r => r.isCorrect).length;
  const totalQuestions = gameResults.length;
  const averageTime = totalQuestions > 0 ? 
    (gameResults.reduce((sum, r) => sum + r.timeTaken, 0) / totalQuestions).toFixed(1) : 0;

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If game is finished, show preview section
  if (gameFinished) {
    return (
      <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
        <div className="max-h-[calc(100vh-64px)] w-full mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Game Complete!</h1>
              <p className="text-gray-600">Here's how you performed</p>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-blue-600">{totalQuestions}</h3>
                <p className="text-gray-600">Questions Answered</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-green-600">{correctAnswers}/{totalQuestions}</h3>
                <p className="text-gray-600">Correct Answers</p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg text-center">
                <h3 className="text-2xl font-bold text-purple-600">{averageTime}s</h3>
                <p className="text-gray-600">Average Time</p>
              </div>
            </div>

            {/* Detailed Results */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Question by Question Results</h2>
              <div className="max-h-96 overflow-y-auto">
                {gameResults.map((result, index) => (
                  <div key={index} className={`p-4 rounded-lg mb-3 border-l-4 ${
                    result.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <span className="font-medium text-gray-700 mr-2">
                            Q{result.questionNumber}: {result.question} = ?
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            result.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {result.isCorrect ? 'Correct' : 'Wrong'}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600">
                          <span>Your answer: <span className="font-medium">{result.selectedAnswer}</span></span>
                          {!result.isCorrect && (
                            <span className="ml-4">Correct answer: <span className="font-medium">{result.correctAnswer}</span></span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-700">{result.timeTaken}s</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="text-center">
              <button
                onClick={restartGame}
                className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 font-medium"
              >
                Play Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the quiz UI
  return (
    // Outer div centers the card on the screen
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex items-center justify-center p-4">
      {/* Notification Bar */}
      {showNotification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg font-semibold text-white shadow-lg ${
          notificationType === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notificationMessage}
        </div>
      )}
      
      {/* Quiz card container */}
      <div className="relative max-w-lg w-full mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          
          {/* Header section */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-gray-600 font-medium">Question {questionNumber}</span>
            
            {/* Game timer */}
            <div className={`px-3 py-1 rounded-full ${
              gameTimeLeft <= 30 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
            }`}>
              <span className="text-sm font-medium">
                Time Left: {formatTime(gameTimeLeft)}
              </span>
            </div>
          </div>

          {/* Question timer */}
          <div className="flex justify-end mb-4">
            <div className="bg-blue-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-blue-600">
                {selected === null ? liveTime : timeTaken}s
              </span>
            </div>
          </div>

          {/* Question section */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              What is <span className="text-indigo-600">{quiz.question}</span>?
            </h1>
          </div>

          {/* Answer options */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {quiz.options.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(option)}
                className={`py-4 px-6 rounded-lg text-lg font-semibold border 
                  ${selected === null ? 
                    'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50' : 
                    ''
                  }
                  ${selected === option && option === quiz.answer ? 
                    'border-green-500 bg-green-100 text-green-700' : 
                    ''
                  }
                  ${selected === option && option !== quiz.answer ? 
                    'border-red-500 bg-red-100 text-red-700' : 
                    ''
                  }
                  ${selected !== null && selected !== option ? 
                    'opacity-40' : 
                    ''
                  }
                `}
                disabled={selected !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {/* Next question indicator */}
          {selected !== null && (
            <div className="text-center">
              <p className="text-gray-500 mt-4 text-sm">
                Time: {timeTaken}s | Next question in {TIMER_DURATION} seconds...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Play;