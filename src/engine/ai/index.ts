import { Piece, PieceColor, Move, DifficultyLevel, AIEvaluation, GameStatus } from '../../types';
import { getValidMoves, executeMove, isCheck, getGameStatus } from '../rules';
import { getEvaluationFunction, getSearchDepth, getTimeLimit } from '../evaluation';

// AI引擎接口
export interface AIEngine {
  findBestMove(pieces: Piece[], currentTurn: PieceColor): Promise<AIEvaluation>;
  getDifficulty(): DifficultyLevel;
}

// 基础AI引擎类
abstract class BaseAIEngine implements AIEngine {
  protected difficulty: DifficultyLevel;
  protected evaluationFunction: (pieces: Piece[], currentTurn: PieceColor) => number;
  protected maxDepth: number;
  protected timeLimit: number;

  constructor(difficulty: DifficultyLevel) {
    this.difficulty = difficulty;
    this.evaluationFunction = getEvaluationFunction(difficulty);
    this.maxDepth = getSearchDepth(difficulty);
    this.timeLimit = getTimeLimit(difficulty);
  }

  abstract findBestMove(pieces: Piece[], currentTurn: PieceColor): Promise<AIEvaluation>;

  getDifficulty(): DifficultyLevel {
    return this.difficulty;
  }

  protected getAllPossibleMoves(pieces: Piece[], currentTurn: PieceColor): Move[] {
    const moves: Move[] = [];
    const currentPieces = pieces.filter(p => p.color === currentTurn);

    for (const piece of currentPieces) {
      const validPositions = getValidMoves(piece, pieces);
      for (const position of validPositions) {
        const capturedPiece = pieces.find(p => 
          p.position.x === position.x && p.position.y === position.y
        );
        
        moves.push({
          from: piece.position,
          to: position,
          piece,
          captured: capturedPiece || undefined
        });
      }
    }

    return moves;
  }

  protected isMoveValid(move: Move, pieces: Piece[], currentTurn: PieceColor): boolean {
    // 执行移动
    const newPieces = executeMove(move, pieces);
    
    // 检查是否会导致自己被将军
    return !isCheck(newPieces, currentTurn);
  }

  protected filterValidMoves(moves: Move[], pieces: Piece[], currentTurn: PieceColor): Move[] {
    return moves.filter(move => this.isMoveValid(move, pieces, currentTurn));
  }
}

// Level 1 AI: 随机走子
export class Level1AI extends BaseAIEngine {
  async findBestMove(pieces: Piece[], currentTurn: PieceColor): Promise<AIEvaluation> {
    const startTime = Date.now();
    const moves = this.getAllPossibleMoves(pieces, currentTurn);
    const validMoves = this.filterValidMoves(moves, pieces, currentTurn);

    if (validMoves.length === 0) {
      return {
        score: -Infinity,
        bestMove: null,
        depth: 0,
        nodesEvaluated: 0,
        timeSpent: Date.now() - startTime
      };
    }

    // 随机选择一个合法移动
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    const score = this.evaluationFunction(pieces, currentTurn);

    return {
      score,
      bestMove: randomMove,
      depth: 0,
      nodesEvaluated: 1,
      timeSpent: Date.now() - startTime
    };
  }
}

// Level 2 AI: 只考虑吃子，优先吃价值高的棋子
export class Level2AI extends BaseAIEngine {
  async findBestMove(pieces: Piece[], currentTurn: PieceColor): Promise<AIEvaluation> {
    const startTime = Date.now();
    const moves = this.getAllPossibleMoves(pieces, currentTurn);
    const validMoves = this.filterValidMoves(moves, pieces, currentTurn);

    if (validMoves.length === 0) {
      return {
        score: -Infinity,
        bestMove: null,
        depth: 0,
        nodesEvaluated: 0,
        timeSpent: Date.now() - startTime
      };
    }

    // 优先选择吃子的移动
    const captureMoves = validMoves.filter(move => move.captured);
    const nonCaptureMoves = validMoves.filter(move => !move.captured);

    let bestMove: Move;
    if (captureMoves.length > 0) {
      // 选择吃价值最高的棋子的移动
      bestMove = captureMoves.reduce((best, current) => {
        const bestValue = best.captured ? getPieceValue(best.captured.type) : 0;
        const currentValue = current.captured ? getPieceValue(current.captured.type) : 0;
        return currentValue > bestValue ? current : best;
      });
    } else {
      // 随机选择非吃子移动
      bestMove = nonCaptureMoves[Math.floor(Math.random() * nonCaptureMoves.length)];
    }

    const score = this.evaluationFunction(pieces, currentTurn);

    return {
      score,
      bestMove,
      depth: 1,
      nodesEvaluated: validMoves.length,
      timeSpent: Date.now() - startTime
    };
  }
}

// Level 3-10 AI: 使用极小化极大算法
export class MinimaxAI extends BaseAIEngine {
  async findBestMove(pieces: Piece[], currentTurn: PieceColor): Promise<AIEvaluation> {
    const startTime = Date.now();
    const moves = this.getAllPossibleMoves(pieces, currentTurn);
    const validMoves = this.filterValidMoves(moves, pieces, currentTurn);

    if (validMoves.length === 0) {
      return {
        score: -Infinity,
        bestMove: null,
        depth: this.maxDepth,
        nodesEvaluated: 0,
        timeSpent: Date.now() - startTime
      };
    }

    let bestMove: Move | null = null;
    let bestScore = -Infinity;
    let nodesEvaluated = 0;

    // 对每个移动进行评估
    for (const move of validMoves) {
      const newPieces = executeMove(move, pieces);
      const score = this.minimax(
        newPieces, 
        this.maxDepth - 1, 
        false, 
        currentTurn,
        -Infinity,
        Infinity,
        startTime,
        this.timeLimit
      );

      nodesEvaluated++;
      
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }

      // 检查时间限制
      if (Date.now() - startTime > this.timeLimit) {
        break;
      }
    }

    return {
      score: bestScore,
      bestMove,
      depth: this.maxDepth,
      nodesEvaluated,
      timeSpent: Date.now() - startTime
    };
  }

  private minimax(
    pieces: Piece[], 
    depth: number, 
    isMaximizing: boolean, 
    currentTurn: PieceColor,
    alpha: number,
    beta: number,
    startTime: number,
    timeLimit: number
  ): number {
    // 检查时间限制
    if (Date.now() - startTime > timeLimit) {
      return 0;
    }

    // 检查游戏是否结束
    const gameStatus = getGameStatus(pieces, currentTurn);
    if (gameStatus === GameStatus.CHECKMATE) {
      return isMaximizing ? -Infinity : Infinity;
    }
    if (gameStatus === GameStatus.STALEMATE || depth === 0) {
      return this.evaluationFunction(pieces, currentTurn);
    }

    if (isMaximizing) {
      let maxScore = -Infinity;
      const moves = this.getAllPossibleMoves(pieces, currentTurn);
      const validMoves = this.filterValidMoves(moves, pieces, currentTurn);

      for (const move of validMoves) {
        const newPieces = executeMove(move, pieces);
        const score = this.minimax(
          newPieces, 
          depth - 1, 
          false, 
          currentTurn,
          alpha,
          beta,
          startTime,
          timeLimit
        );
        
        maxScore = Math.max(maxScore, score);
        alpha = Math.max(alpha, score);
        
        if (beta <= alpha) {
          break; // Alpha-Beta剪枝
        }
      }
      
      return maxScore;
    } else {
      let minScore = Infinity;
      const moves = this.getAllPossibleMoves(pieces, pieces[0]?.color === currentTurn ? 
        (currentTurn === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED) : currentTurn);
      const validMoves = this.filterValidMoves(moves, pieces, pieces[0]?.color === currentTurn ? 
        (currentTurn === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED) : currentTurn);

      for (const move of validMoves) {
        const newPieces = executeMove(move, pieces);
        const score = this.minimax(
          newPieces, 
          depth - 1, 
          true, 
          currentTurn,
          alpha,
          beta,
          startTime,
          timeLimit
        );
        
        minScore = Math.min(minScore, score);
        beta = Math.min(beta, score);
        
        if (beta <= alpha) {
          break; // Alpha-Beta剪枝
        }
      }
      
      return minScore;
    }
  }
}

// AI工厂函数
export function createAI(difficulty: DifficultyLevel): AIEngine {
  switch (difficulty) {
    case DifficultyLevel.NOVICE:
      return new Level1AI(difficulty);
    case DifficultyLevel.BEGINNER:
      return new Level2AI(difficulty);
    case DifficultyLevel.ELEMENTARY:
    case DifficultyLevel.INTERMEDIATE:
    case DifficultyLevel.INTERMEDIATE_ADVANCED:
    case DifficultyLevel.ADVANCED:
    case DifficultyLevel.EXPERT:
    case DifficultyLevel.MASTER:
    case DifficultyLevel.GRANDMASTER:
    case DifficultyLevel.INTERNATIONAL_MASTER:
      return new MinimaxAI(difficulty);
    default:
      return new MinimaxAI(DifficultyLevel.INTERMEDIATE_ADVANCED);
  }
}

// 辅助函数：获取棋子价值
function getPieceValue(pieceType: string): number {
  const valueMap: Record<string, number> = {
    'general': 10000,
    'advisor': 20,
    'elephant': 20,
    'horse': 40,
    'chariot': 90,
    'cannon': 45,
    'soldier': 10
  };
  
  return valueMap[pieceType] || 0;
} 