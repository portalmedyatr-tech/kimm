import { useState, useEffect } from 'react';
import { QUESTIONS, type Question } from '../data/questions';
import TikfinityWidget from '../components/TikfinityWidget';
import './Game.css';

interface Player {
  name: string;
  points: number;
  correctAnswers: number;
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

  // TikTok Chat ile cevap alma
  useEffect(() => {
    if (!gameStarted || !currentQuestion || isAnswered) return;

    function handleKeyPress(e: KeyboardEvent) {
      const key = e.key.toUpperCase();
      if (['A', 'B', 'C', 'D'].includes(key)) {
        submitAnswer(key as 'A' | 'B' | 'C' | 'D');
      }
    }

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameStarted, currentQuestion, isAnswered]);

  function submitAnswer(answer: 'A' | 'B' | 'C' | 'D') {
    if (!currentQuestion || isAnswered) return;

    setSelectedAnswer(answer);
    setIsAnswered(true);

    const isCorrect = answer === currentQuestion.correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + currentQuestion.points);
    }
  }

  function nextQuestion() {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= QUESTIONS.length) {
      setGameOver(true);
      // Top player simulasyonu
      setTopPlayers([
        { name: 'Sen', points: score, correctAnswers: currentQuestionIndex + (selectedAnswer === currentQuestion?.correctAnswer ? 1 : 0) },
        { name: 'Oyuncu 2', points: Math.max(0, score - 100), correctAnswers: currentQuestionIndex - 1 },
        { name: 'Oyuncu 3', points: Math.max(0, score - 250), correctAnswers: currentQuestionIndex - 2 },
      ]);
    } else {
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(QUESTIONS[nextIndex]);
      setSelectedAnswer(null);
      setIsAnswered(false);
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
  }

  if (!gameStarted) {
    return (
      <div className="game-container intro-screen">
        <div className="intro-content">
          <h1>🎬 Kim Milyoner Olmak İster?</h1>
          <p>TikTok canlı yayınında katıl ve soruları cevaplayarak puan kazan!</p>
          <button className="start-button" onClick={() => setGameStarted(true)}>
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

          <div className="top-players">
            <h3>🏆 En İyi Oyuncular</h3>
            <ul>
              {topPlayers.map((player, idx) => (
                <li key={idx}>
                  <span className="rank">#{idx + 1}</span>
                  <span className="name">{player.name}</span>
                  <span className="points">{player.points} Puan</span>
                </li>
              ))}
            </ul>
          </div>

          <button className="restart-button" onClick={restartGame}>
            Tekrar Oyna
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-wrapper">
      <div className="game-main">
        <div className="game-header">
          <div className="score-info">
            <span>Soru: {currentQuestionIndex + 1}/10</span>
            <span className="separator">|</span>
            <span>Puan: {score}</span>
          </div>
        </div>

        {currentQuestion && (
          <div className="game-container">
            <div className="question-section">
              <h2 className="question-text">{currentQuestion.text}</h2>
              <div className="options-grid">
                {currentQuestion.options.map(option => (
                  <button
                    key={option.label}
                    className={`option-button ${selectedAnswer === option.label ? 'selected' : ''} ${
                      isAnswered
                        ? option.label === currentQuestion.correctAnswer
                          ? 'correct'
                          : selectedAnswer === option.label
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
                ))}
              </div>

              {isAnswered && (
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
                  <button className="next-button" onClick={nextQuestion}>
                    {currentQuestionIndex + 1 >= QUESTIONS.length ? 'Sonuçları Göster' : 'Sonraki Soru'}
                  </button>
                </div>
              )}

              {!isAnswered && (
                <div className="hint">
                  <p>💡 Cevap vermek için bir seçeneğe tıkla veya A/B/C/D tuşlarını kullan</p>
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
            className="widget-wrapper"
          />
        </div>
      </div>
    </div>
  );
}
