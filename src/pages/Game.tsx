import { useState, useEffect, useCallback } from 'react';
import { QUESTIONS, type Question } from '../data/questions';
import TikfinityWidget from '../components/TikfinityWidget';
import { getGameSettings, getTTSSettings } from '../config/settings';
import { ttsEngine } from '../config/tts';
import './Game.css';

interface Player {
  name: string;
  answer: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
}

interface AnswerStats {
  A: number;
  B: number;
  C: number;
  D: number;
}

export default function Game() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(QUESTIONS[0]);
  const [selectedAnswer, setSelectedAnswer] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [topPlayers, setTopPlayers] = useState<Player[]>([]);
  
  // New: Timer and stats
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ A: 0, B: 0, C: 0, D: 0 });
  const [chatPlayers, setChatPlayers] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);

  const gameSettings = getGameSettings();
  const ttsSettings = getTTSSettings();

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          return gameSettings.questionTimerSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, gameSettings.questionTimerSeconds, currentQuestion]);

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (timeRemaining === 0 && gameStarted && !gameOver) {
      const timeout = setTimeout(() => {
        nextQuestion();
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [timeRemaining, gameStarted, gameOver]);

  // Handle answer from chat
  const handleChatAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D', username: string) => {
    if (!gameStarted || gameOver || !currentQuestion || isAnswered) return;

    // Add to stats
    setAnswerStats(prev => ({
      ...prev,
      [answer]: prev[answer] + 1
    }));

    // Add to player list
    const newPlayer: Player = {
      name: username,
      answer,
      isCorrect: answer === currentQuestion.correctAnswer
    };
    setChatPlayers(prev => [...prev, newPlayer]);
  }, [gameStarted, gameOver, currentQuestion, isAnswered]);

  function submitAnswer(answer: 'A' | 'B' | 'C' | 'D') {
    if (!currentQuestion || isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);
    setShowResults(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }

    // TTS: Announce result
    if (ttsSettings.enabled) {
      const message = isCorrect 
        ? `Doğru! ${currentQuestion.points} puan kazandınız.`
        : `Yanlış! Doğru cevap ${currentQuestion.correctAnswer} idi.`;
      ttsEngine.speak(message);
    }
  }

  function nextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      setGameOver(true);
      // Calculate top 3 correct answerers
      const correctPlayers = chatPlayers.filter(p => p.isCorrect);
      const topThree = correctPlayers.slice(0, gameSettings.showTopPlayers);
      setTopPlayers(topThree);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(QUESTIONS[nextIndex]);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowResults(false);
      setTimeRemaining(gameSettings.questionTimerSeconds);
      setAnswerStats({ A: 0, B: 0, C: 0, D: 0 });
      setChatPlayers([]);

      // TTS: Read new question
      if (ttsSettings.enabled) {
        ttsEngine.speak(QUESTIONS[nextIndex].text);
      }
    }
  }

  function restartGame() {
    setCurrentQuestionIndex(0);
    setCurrentQuestion(QUESTIONS[0]);
    setSelectedAnswer(null);
    setIsAnswered(false);
    setScore(0);
    setGameStarted(false);
    setGameOver(false);
    setTopPlayers([]);
    setTimeRemaining(gameSettings.questionTimerSeconds);
    setAnswerStats({ A: 0, B: 0, C: 0, D: 0 });
    setChatPlayers([]);
    setShowResults(false);
  }

  if (!gameStarted) {
    return (
      <div className="game-container intro-screen">
        <div className="intro-content">
          <h1>🎬 Kim Milyoner Olmak İster?</h1>
          <p>TikTok canlı yayınında katıl ve soruları cevaplayarak puan kazan!</p>
          <button className="start-button" onClick={() => {
            setGameStarted(true);
            setTimeRemaining(gameSettings.questionTimerSeconds);
            if (ttsSettings.enabled) {
              ttsEngine.speak(QUESTIONS[0].text);
            }
          }}>
            Oyuna Başla
          </button>
        </div>
      </div>
    );
  }

  if (gameOver) {
    return (
      <div className="game-container game-over-screen">
        <div className="game-over-content">
          <h1>🎉 Oyun Bitti!</h1>
          <div className="final-score">
            <div className="score-display">
              <h2>Toplam Puanın</h2>
              <p className="big-score">{score} Puan</p>
            </div>
          </div>

          {topPlayers.length > 0 && (
            <div className="top-players">
              <h3>🏆 En İyi Cevaplamalar</h3>
              <ul>
                {topPlayers.map((player, idx) => (
                  <li key={idx}>
                    <span className="rank">#{idx + 1}</span>
                    <span className="name">{player.name}</span>
                    <span className="points">{player.answer}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button className="restart-button" onClick={restartGame}>
            Tekrar Oyna
          </button>
        </div>
      </div>
    );
  }

  const totalVotes = Object.values(answerStats).reduce((a, b) => a + b, 0);
  const getPercentage = (count: number) => totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 100);

  return (
    <div className="game-wrapper">
      <div className="game-main">
        <div className="game-header">
          <div className="score-info">
            <span>Soru: {currentQuestionIndex + 1}/10</span>
            <span className="separator">|</span>
            <span>Puan: {score}</span>
            <span className="separator">|</span>
            <span className={`timer ${timeRemaining <= 5 ? 'timer-warning' : ''}`}>
              ⏱️ {timeRemaining}s
            </span>
          </div>
        </div>

        {currentQuestion && (
          <div className="game-container">
            <div className="question-section">
              <h2 className="question-text">{currentQuestion.text}</h2>
              <div className="options-grid">
                {currentQuestion.options.map(option => {
                  const percentage = getPercentage(answerStats[option.label]);
                  const isSelected = selectedAnswer === option.label;
                  const isCorrect = option.label === currentQuestion.correctAnswer;

                  return (
                    <div key={option.label} className="option-wrapper">
                      <button
                        className={`option-button ${isSelected ? 'selected' : ''} ${
                          showResults
                            ? isCorrect
                              ? 'correct'
                              : isSelected
                              ? 'incorrect'
                              : ''
                            : ''
                        }`}
                        onClick={() => !isAnswered && submitAnswer(option.label)}
                        disabled={isAnswered}
                      >
                        <span className="option-label">{option.label}</span>
                        <span className="option-text">{option.text}</span>
                      </button>
                      {totalVotes > 0 && (
                        <div className="answer-stats">
                          <div className="stat-bar">
                            <div 
                              className="stat-bar-fill" 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="stat-percentage">{percentage}%</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {showResults && (
                <div className={`answer-feedback ${selectedAnswer === currentQuestion.correctAnswer ? 'correct-feedback' : 'incorrect-feedback'}`}>
                  {selectedAnswer === currentQuestion.correctAnswer ? (
                    <>
                      <p>✅ Doğru! +{currentQuestion.points} Puan</p>
                    </>
                  ) : (
                    <>
                      <p>❌ Yanlış!</p>
                      <p>Doğru cevap: <strong>{currentQuestion.correctAnswer}</strong></p>
                    </>
                  )}
                  
                  {chatPlayers.length > 0 && (
                    <div className="chat-answerers">
                      <h4>İlk Cevaplamalar:</h4>
                      <ul className="answerers-list">
                        {chatPlayers.slice(0, 5).map((player, idx) => (
                          <li key={idx} className={player.isCorrect ? 'correct' : 'incorrect'}>
                            <span className="player-name">{player.name}</span>
                            <span className="player-answer">{player.answer}</span>
                            <span className="player-result">{player.isCorrect ? '✓' : '✗'}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {!showResults && (
                <div className="hint">
                  <p>💡 Chat'ten cevaplar bekleniyor... {totalVotes} kişi cevap verdi</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="game-sidebar">
        <div className="tikfinity-section">
          <h3>📱 TikTok Chat</h3>
          <TikfinityWidget
            cid="1209191"
            apiBaseUrl="https://tikfinity.zerody.one"
            timeoutMs={3000}
            onAnswerSubmitted={handleChatAnswer}
            className="widget-wrapper"
          />
        </div>
      </div>
    </div>
  );
}
