import { create } from 'zustand';
import { Piece, PieceType, PieceColor, Position, Move, GameStatus, DifficultyLevel, GameMode, GameConfig, GameHistory } from '../types';
import { getValidMoves, executeMove, getGameStatus } from '../engine/rules';
import { createAI } from '../engine/ai';

interface GameStore {
  // 游戏状态
  pieces: Piece[];
  currentTurn: PieceColor;
  status: GameStatus;
  selectedPiece: Piece | null;
  validMoves: Position[];
  history: GameHistory;
  config: GameConfig;
  
  // 游戏控制
  startNewGame: (config: GameConfig) => void;
  makeMove: (from: Position, to: Position) => boolean;
  selectPiece: (piece: Piece | null) => void;
  resetGame: () => void;
  
  // AI相关
  makeAIMove: () => Promise<void>;
  setDifficulty: (difficulty: DifficultyLevel) => void;
  
  // 游戏设置
  setGameMode: (mode: GameMode) => void;
  setTimeLimit: (timeLimit: number) => void;
}

// 创建初始棋盘
function createInitialBoard(): Piece[] {
  const pieces: Piece[] = [];
  let id = 0;

  // 红方棋子（下方）
  pieces.push(
    { id: `red-${id++}`, type: PieceType.CHARIOT, color: PieceColor.RED, position: { x: 0, y: 9 } },
    { id: `red-${id++}`, type: PieceType.HORSE, color: PieceColor.RED, position: { x: 1, y: 9 } },
    { id: `red-${id++}`, type: PieceType.ELEPHANT, color: PieceColor.RED, position: { x: 2, y: 9 } },
    { id: `red-${id++}`, type: PieceType.ADVISOR, color: PieceColor.RED, position: { x: 3, y: 9 } },
    { id: `red-${id++}`, type: PieceType.GENERAL, color: PieceColor.RED, position: { x: 4, y: 9 } },
    { id: `red-${id++}`, type: PieceType.ADVISOR, color: PieceColor.RED, position: { x: 5, y: 9 } },
    { id: `red-${id++}`, type: PieceType.ELEPHANT, color: PieceColor.RED, position: { x: 6, y: 9 } },
    { id: `red-${id++}`, type: PieceType.HORSE, color: PieceColor.RED, position: { x: 7, y: 9 } },
    { id: `red-${id++}`, type: PieceType.CHARIOT, color: PieceColor.RED, position: { x: 8, y: 9 } },
    { id: `red-${id++}`, type: PieceType.CANNON, color: PieceColor.RED, position: { x: 1, y: 7 } },
    { id: `red-${id++}`, type: PieceType.CANNON, color: PieceColor.RED, position: { x: 7, y: 7 } },
    { id: `red-${id++}`, type: PieceType.SOLDIER, color: PieceColor.RED, position: { x: 0, y: 6 } },
    { id: `red-${id++}`, type: PieceType.SOLDIER, color: PieceColor.RED, position: { x: 2, y: 6 } },
    { id: `red-${id++}`, type: PieceType.SOLDIER, color: PieceColor.RED, position: { x: 4, y: 6 } },
    { id: `red-${id++}`, type: PieceType.SOLDIER, color: PieceColor.RED, position: { x: 6, y: 6 } },
    { id: `red-${id++}`, type: PieceType.SOLDIER, color: PieceColor.RED, position: { x: 8, y: 6 } }
  );

  // 黑方棋子（上方）
  pieces.push(
    { id: `black-${id++}`, type: PieceType.CHARIOT, color: PieceColor.BLACK, position: { x: 0, y: 0 } },
    { id: `black-${id++}`, type: PieceType.HORSE, color: PieceColor.BLACK, position: { x: 1, y: 0 } },
    { id: `black-${id++}`, type: PieceType.ELEPHANT, color: PieceColor.BLACK, position: { x: 2, y: 0 } },
    { id: `black-${id++}`, type: PieceType.ADVISOR, color: PieceColor.BLACK, position: { x: 3, y: 0 } },
    { id: `black-${id++}`, type: PieceType.GENERAL, color: PieceColor.BLACK, position: { x: 4, y: 0 } },
    { id: `black-${id++}`, type: PieceType.ADVISOR, color: PieceColor.BLACK, position: { x: 5, y: 0 } },
    { id: `black-${id++}`, type: PieceType.ELEPHANT, color: PieceColor.BLACK, position: { x: 6, y: 0 } },
    { id: `black-${id++}`, type: PieceType.HORSE, color: PieceColor.BLACK, position: { x: 7, y: 0 } },
    { id: `black-${id++}`, type: PieceType.CHARIOT, color: PieceColor.BLACK, position: { x: 8, y: 0 } },
    { id: `black-${id++}`, type: PieceType.CANNON, color: PieceColor.BLACK, position: { x: 1, y: 2 } },
    { id: `black-${id++}`, type: PieceType.CANNON, color: PieceColor.BLACK, position: { x: 7, y: 2 } },
    { id: `black-${id++}`, type: PieceType.SOLDIER, color: PieceColor.BLACK, position: { x: 0, y: 3 } },
    { id: `black-${id++}`, type: PieceType.SOLDIER, color: PieceColor.BLACK, position: { x: 2, y: 3 } },
    { id: `black-${id++}`, type: PieceType.SOLDIER, color: PieceColor.BLACK, position: { x: 4, y: 3 } },
    { id: `black-${id++}`, type: PieceType.SOLDIER, color: PieceColor.BLACK, position: { x: 6, y: 3 } },
    { id: `black-${id++}`, type: PieceType.SOLDIER, color: PieceColor.BLACK, position: { x: 8, y: 3 } }
  );

  return pieces;
}

// 创建游戏历史
function createGameHistory(): GameHistory {
  return {
    moves: [],
    startTime: new Date(),
    status: GameStatus.PLAYING
  };
}

// 创建默认游戏配置
function createDefaultConfig(): GameConfig {
  return {
    mode: GameMode.HUMAN_VS_AI,
            difficulty: DifficultyLevel.INTERMEDIATE_ADVANCED,
    timeLimit: 300
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  // 初始状态
  pieces: createInitialBoard(),
  currentTurn: PieceColor.RED,
  status: GameStatus.PLAYING,
  selectedPiece: null,
  validMoves: [],
  history: createGameHistory(),
  config: createDefaultConfig(),

  // 游戏控制
  startNewGame: (config: GameConfig) => {
    set({
      pieces: createInitialBoard(),
      currentTurn: PieceColor.RED,
      status: GameStatus.PLAYING,
      selectedPiece: null,
      validMoves: [],
      history: createGameHistory(),
      config
    });
  },

  makeMove: (from: Position, to: Position) => {
    const { pieces, currentTurn, selectedPiece } = get();
    
    if (!selectedPiece || 
        selectedPiece.position.x !== from.x || 
        selectedPiece.position.y !== from.y ||
        selectedPiece.color !== currentTurn) {
      return false;
    }

    // 检查移动是否有效
    const validMoves = getValidMoves(selectedPiece, pieces);
    const isValidMove = validMoves.some(pos => pos.x === to.x && pos.y === to.y);
    
    if (!isValidMove) {
      return false;
    }

    // 执行移动
    const capturedPiece = pieces.find(p => p.position.x === to.x && p.position.y === to.y);
    const move: Move = {
      from,
      to,
      piece: selectedPiece,
      captured: capturedPiece || undefined
    };

    const newPieces = executeMove(move, pieces);
    const newStatus = getGameStatus(newPieces, currentTurn);
    const nextTurn = currentTurn === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED;

    // 更新历史
    const newHistory = { ...get().history };
    newHistory.moves.push(move);
    if (newStatus !== GameStatus.PLAYING) {
      newHistory.endTime = new Date();
      newHistory.status = newStatus;
      newHistory.winner = newStatus === GameStatus.CHECKMATE ? nextTurn : undefined;
    }

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      status: newStatus,
      selectedPiece: null,
      validMoves: [],
      history: newHistory
    });

    return true;
  },

  selectPiece: (piece: Piece | null) => {
    const { pieces, currentTurn } = get();
    
    if (!piece || piece.color !== currentTurn) {
      set({ selectedPiece: null, validMoves: [] });
      return;
    }

    const validMoves = getValidMoves(piece, pieces);
    set({ selectedPiece: piece, validMoves });
  },

  resetGame: () => {
    set({
      pieces: createInitialBoard(),
      currentTurn: PieceColor.RED,
      status: GameStatus.PLAYING,
      selectedPiece: null,
      validMoves: [],
      history: createGameHistory()
    });
  },

  // AI相关
  makeAIMove: async () => {
    const { pieces, currentTurn, config, status } = get();
    
    if (status !== GameStatus.PLAYING || 
        config.mode !== GameMode.HUMAN_VS_AI || 
        currentTurn === PieceColor.RED) {
      return;
    }

    const ai = createAI(config.difficulty);
    const evaluation = await ai.findBestMove(pieces, currentTurn);
    
    if (evaluation.bestMove) {
      // AI需要先选中棋子，然后执行移动
      const pieceToMove = pieces.find(p => 
        p.position.x === evaluation.bestMove!.from.x && 
        p.position.y === evaluation.bestMove!.from.y
      );
      
      if (pieceToMove) {
        // 先选中棋子
        set({ selectedPiece: pieceToMove });
        // 然后执行移动
        get().makeMove(evaluation.bestMove!.from, evaluation.bestMove!.to);
      }
    }
  },

  setDifficulty: (difficulty: DifficultyLevel) => {
    const { config } = get();
    set({
      config: { ...config, difficulty }
    });
  },

  // 游戏历史
  undoMove: () => {
    const { history } = get();
    if (history.moves.length === 0) return;

    // 这里可以实现撤销逻辑
    // 为了简化，暂时重置游戏
    get().resetGame();
  },

  redoMove: () => {
    // 这里可以实现重做逻辑
    // 为了简化，暂时不实现
  },

  // 游戏设置
  setGameMode: (mode: GameMode) => {
    const { config } = get();
    set({
      config: { ...config, mode }
    });
  },

  setTimeLimit: (timeLimit: number) => {
    const { config } = get();
    set({
      config: { ...config, timeLimit }
    });
  }
})); 