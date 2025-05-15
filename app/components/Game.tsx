'use client';
import { useEffect, useState, useCallback } from 'react';

type Position = {
  x: number;
  y: number;
};

type Score = {
  id: number;
  username: string;
  score: number;
  createdAt: string;
};

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const GAME_SPEED = 150;

export default function Game() {
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [food, setFood] = useState<Position>({ x: 5, y: 5 });
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [playerName, setPlayerName] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [inputError, setInputError] = useState('');
  const [highScores, setHighScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHighScores = async () => {
    try {
      const response = await fetch('/api/scores');
      if (response.ok) {
        const data = await response.json();
        setHighScores(data);
      }
    } catch (error) {
      console.error('Error fetching high scores:', error);
    }
  };

  useEffect(() => {
    fetchHighScores();
  }, []);

  const saveScore = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: playerName,
          score: score,
        }),
      });

      if (response.ok) {
        await fetchHighScores();
      }
    } catch (error) {
      console.error('Error saving score:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
    setFood(newFood);
  }, []);

  const startGame = () => {
    if (!playerName.trim()) {
      setInputError('請輸入您的名稱');
      return;
    }
    setInputError('');
    setGameStarted(true);
  };

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setIsGameOver(false);
    setScore(0);
    generateFood();
  };

  const checkCollision = (head: Position) => {
    // 檢查是否撞牆
    if (
      head.x < 0 ||
      head.x >= GRID_SIZE ||
      head.y < 0 ||
      head.y >= GRID_SIZE
    ) {
      return true;
    }

    // 檢查是否撞到自己
    for (let i = 1; i < snake.length; i++) {
      if (head.x === snake[i].x && head.y === snake[i].y) {
        return true;
      }
    }

    return false;
  };

  const moveSnake = useCallback(() => {
    if (isGameOver || !gameStarted) return;

    const newSnake = [...snake];
    const head = {
      x: newSnake[0].x + direction.x,
      y: newSnake[0].y + direction.y,
    };

    if (checkCollision(head)) {
      setIsGameOver(true);
      saveScore();
      return;
    }

    newSnake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
      setScore(prev => prev + 1);
      generateFood();
    } else {
      newSnake.pop();
    }

    setSnake(newSnake);
  }, [snake, direction, food, isGameOver, gameStarted, generateFood]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted) return;
      
      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameStarted]);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  if (!gameStarted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">歡迎來到貪食蛇遊戲</h1>
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-3">最高分排行榜</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              {highScores.length > 0 ? (
                <ul className="space-y-2">
                  {highScores.map((score, index) => (
                    <li key={score.id} className="flex justify-between items-center">
                      <span className="text-gray-800">
                        {index + 1}. {score.username}
                      </span>
                      <span className="font-bold text-gray-800">{score.score}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600 text-center">暫無分數記錄</p>
              )}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="playerName" className="block text-gray-700 mb-2">
              請輸入您的名稱：
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setInputError('');
              }}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
              placeholder="您的名稱"
            />
            {inputError && (
              <p className="text-red-500 text-sm mt-1">{inputError}</p>
            )}
          </div>
          <button
            onClick={startGame}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            開始遊戲
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="relative flex flex-col items-center w-[400px]">
        <div className="mb-4 space-y-2 text-center">
          <div className="text-xl font-bold text-gray-800">玩家：{playerName}</div>
          <div className="text-2xl font-bold text-gray-800">分數：{score}</div>
        </div>
        <div
          className="relative bg-white border-2 border-gray-300"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
          }}
        >
          {snake.map((segment, index) => (
            <div
              key={index}
              className="absolute bg-green-500"
              style={{
                left: segment.x * CELL_SIZE,
                top: segment.y * CELL_SIZE,
                width: CELL_SIZE,
                height: CELL_SIZE,
              }}
            />
          ))}
          <div
            className="absolute bg-red-500"
            style={{
              left: food.x * CELL_SIZE,
              top: food.y * CELL_SIZE,
              width: CELL_SIZE,
              height: CELL_SIZE,
            }}
          />
        </div>
        {isGameOver && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 p-6 rounded-lg shadow-lg text-center w-[300px]">
            <div className="text-xl font-bold text-red-500 mb-4">遊戲結束！</div>
            <div className="mb-4">
              <div className="font-bold text-gray-800">玩家：{playerName}</div>
              <div className="font-bold text-gray-800">最終分數：{score}</div>
            </div>
            <button
              onClick={resetGame}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            >
              {isLoading ? '儲存分數中...' : '重新開始'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 