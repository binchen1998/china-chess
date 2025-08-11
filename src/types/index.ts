// 棋子类型
export enum PieceType {
  GENERAL = 'general',    // 将/帅
  ADVISOR = 'advisor',    // 士/仕
  ELEPHANT = 'elephant', // 象/相
  HORSE = 'horse',       // 马
  CHARIOT = 'chariot',   // 车
  CANNON = 'cannon',     // 炮
  SOLDIER = 'soldier'    // 兵/卒
}

// 棋子颜色
export enum PieceColor {
  RED = 'red',
  BLACK = 'black'
}

// 棋子位置
export interface Position {
  x: number;
  y: number;
}

// 棋子
export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  id: string;
}

// 移动
export interface Move {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
}

// 游戏状态
export enum GameStatus {
  PLAYING = 'playing',
  CHECK = 'check',
  CHECKMATE = 'checkmate',
  STALEMATE = 'stalemate',
  DRAW = 'draw'
}

// 游戏模式
export enum GameMode {
  HUMAN_VS_AI = 'human_vs_ai',
  HUMAN_VS_HUMAN = 'human_vs_human',
  AI_VS_AI = 'ai_vs_ai'
}

// AI难度级别
export enum DifficultyLevel {
  NOVICE = 1,           // 新手 - 随机走子
  BEGINNER = 2,         // 入门 - 优先吃子
  ELEMENTARY = 3,       // 初级 - 基础防守
  INTERMEDIATE = 4,     // 中级 - 1步前瞻
  INTERMEDIATE_ADVANCED = 5, // 中高级 - 2步前瞻
  ADVANCED = 6,         // 高级 - 3步前瞻
  EXPERT = 7,           // 专家 - 4-5步前瞻
  MASTER = 8,           // 大师 - 6-8步前瞻
  GRANDMASTER = 9,      // 特级大师 - 8-12步前瞻
  INTERNATIONAL_MASTER = 10  // 国际大师 - 12步以上前瞻
}

// 游戏配置
export interface GameConfig {
  mode: GameMode;
  difficulty: DifficultyLevel;
  timeLimit?: number; // 时间限制（秒）
}

// 游戏历史记录
export interface GameHistory {
  moves: Move[];
  startTime: Date;
  endTime?: Date;
  winner?: PieceColor;
  status: GameStatus;
}

// 棋盘状态
export interface BoardState {
  pieces: Piece[];
  currentTurn: PieceColor;
  status: GameStatus;
  selectedPiece: Piece | null;
  validMoves: Position[];
  history: GameHistory;
  config: GameConfig;
}

// AI评估结果
export interface AIEvaluation {
  score: number;
  bestMove: Move | null;
  depth: number;
  nodesEvaluated: number;
  timeSpent: number;
} 