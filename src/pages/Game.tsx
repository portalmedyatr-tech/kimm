import { useState, useEffect, useCallback, useRef } from 'react';
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

interface PlayerStats {
  name: string;
  totalAnswers: number;
  correctAnswers: number;
  percentCorrect: number;
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
  
  // Timer and stats
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [answerStats, setAnswerStats] = useState<AnswerStats>({ A: 0, B: 0, C: 0, D: 0 });
  const [chatPlayers, setChatPlayers] = useState<Player[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStats>>(new Map());
  
  // Track when to auto-advance
  const autoAdvanceRef = useRef(false);

  const gameSettings = getGameSettings();
  const ttsSettings = getTTSSettings();

  // Initialize timer
  useEffect(() => {
    if (gameStarted && !gameOver) {
      setTimeRemaining(gameSettings.questionTimerSeconds);
    }
  }, [gameStarted, currentQuestionIndex, gameSettings.questionTimerSeconds, gameOver]);

  // Timer countdown
  useEffect(() => {
    if (!gameStarted || gameOver || !currentQuestion) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, gameOver, currentQuestion]);

  // Auto-advance when timer reaches 0
  useEffect(() => {
    if (timeRemaining <= 0 && gameStarted && !gameOver) {
      if (!autoAdvanceRef.current) {
        autoAdvanceRef.current = true;
        setShowResults(true);
        
        setTimeout(() => {
          nextQuestion();
          autoAdvanceRef.current = false;
        }, 2000);
      }
    }
  }, [timeRemaining, gameStarted, gameOver]);

  // Handle answer from chat
  const handleChatAnswer = useCallback((answer: 'A' | 'B' | 'C' | 'D', username: string) => {
    if (!gameStarted || gameOver || !currentQuestion) return;

    console.log(`Chat answer received: ${username} → ${answer}`); // Debug

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

    // Update player stats
    setPlayerStats(prev => {
      const stats = new Map(prev);
      const current = stats.get(username) || { 
        name: username, 
        totalAnswers: 0, 
        correctAnswers: 0, 
        percentCorrect: 0 
      };
      
      current.totalAnswers += 1;
      if (newPlayer.isCorrect) {
        current.correctAnswers += 1;
      }
      current.percentCorrect = Math.round((current.correctAnswers / current.totalAnswers) * 100);
      
      stats.set(username, current);
      return stats;
    });
  }, [gameStarted, gameOver, currentQuestion]);

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

    // Auto advance after showing results
    setTimeout(() => {
      nextQuestion();
    }, 2000);
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
      autoAdvanceRef.current = false;

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
    setPlayerStats(new Map());
    autoAdvanceRef.current = false;
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
    // Convert playerStats to array and sort
    const sortedStats = Array.from(playerStats.values())
      .sort((a, b) => b.correctAnswers - a.correctAnswers)
      .slice(0, 10);

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

          {sortedStats.length > 0 && (
            <div className="player-analytics">
              <h3>📊 Oyuncu İstatistikleri</h3>
              <div className="analytics-list">
                {sortedStats.map((stat, idx) => (
                  <div key={idx} className="analytics-item">
                    <div className="player-info">
                      <span className="player-name">{stat.name}</span>
                      <span className="answer-count">{stat.totalAnswers} soru</span>
                    </div>
                    <div className="analytics-bar-container">
                      <div className="analytics-bar">
                        <div 
                          className="analytics-bar-fill" 
                          style={{ width: `${stat.percentCorrect}%` }}
                        />
                      </div>
                      <span className="analytics-percentage">{stat.correctAnswers}/{stat.totalAnswers} (%{stat.percentCorrect})</span>
                    </div>
                  </div>
                ))}
              </div>
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
                          <span className="stat-percentage">{percentage}% ({answerStats[option.label]})</span>
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
            demoMode={true}
          />
        </div>
      </div>
    </div>
  );
}
