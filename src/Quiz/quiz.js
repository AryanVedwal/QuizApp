import React, { useState, useEffect } from "react";
import { fetchQuestions } from "./api";
import "./quiz.css";

const Quiz = () => {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [violationCount, setViolationCount] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchQuestions();
      setQuestions(data);
    };
    fetchData();

    // Check if the user is in full-screen mode
    const handleFullScreenChange = () => {
      setIsFullScreen(document.fullscreenElement !== null);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);

    // Check if the user has switched tabs
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setViolationCount(violationCount + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Restore the quiz state from localStorage
    const storedState = localStorage.getItem("quizState");
    if (storedState) {
      const { currentQuestion, score, violationCount } =
        JSON.parse(storedState);
      setCurrentQuestion(currentQuestion);
      setScore(score);
      setViolationCount(violationCount);
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [violationCount]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      setScore(score + 1);
    }
    setCurrentQuestion(currentQuestion + 1);

    // Save the current state to localStorage
    localStorage.setItem(
      "quizState",
      JSON.stringify({ currentQuestion, score, violationCount })
    );
  };

  const enterFullScreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    }
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setViolationCount(0);
    localStorage.removeItem("quizState");
  };

  if (!isFullScreen) {
    return (
      <div className="quiz-container">
        <div className="question-container">
          <h1 className="question-text">
            Please enter full-screen mode to start the quiz.
          </h1>
          <button className="answer-button" onClick={enterFullScreen}>
            Enter Full Screen
          </button>
        </div>
      </div>
    );
  }

  if (currentQuestion >= questions.length) {
    localStorage.removeItem("quizState");
    return (
      <div className="quiz-container">
        <div className="question-container">
          <h1 className="question-text">Quiz Completed!</h1>
          <p>
            Your score: {score}/{questions.length}
          </p>
          <p>Violations: {violationCount}</p>
          <button className="reset-button" onClick={resetQuiz}>
            Reset Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const answers = [
    ...currentQuestionData.incorrect_answers,
    currentQuestionData.correct_answer,
  ];
  answers.sort(() => Math.random() - 0.5);

  return (
    <div className="quiz-container">
      <div className="question-container">
        <h1 className="question-text">Question {currentQuestion + 1}</h1>
        <p className="question-text">{currentQuestionData.question}</p>
        {answers.map((answer, index) => (
          <button
            key={index}
            className="answer-button"
            onClick={() =>
              handleAnswer(answer === currentQuestionData.correct_answer)
            }
          >
            {answer}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;
