import { Piece, PieceColor, DifficultyLevel } from '../types';
import { PIECE_VALUES } from './rules';

// 中心控制价值
const CENTER_CONTROL_VALUE = 10;

// 过河奖励
const RIVER_CROSSING_BONUS = 5;

// 获取评估函数
export function getEvaluationFunction(difficulty: DifficultyLevel) {
  switch (difficulty) {
    case DifficultyLevel.NOVICE:
    case DifficultyLevel.BEGINNER:
    case DifficultyLevel.ELEMENTARY:
      return basicEvaluation;
    case DifficultyLevel.INTERMEDIATE:
    case DifficultyLevel.INTERMEDIATE_ADVANCED:
      return intermediateEvaluation;
    case DifficultyLevel.ADVANCED:
    case DifficultyLevel.EXPERT:
      return advancedEvaluation;
    case DifficultyLevel.MASTER:
    case DifficultyLevel.GRANDMASTER:
    case DifficultyLevel.INTERNATIONAL_MASTER:
      return expertEvaluation;
    default:
      return intermediateEvaluation;
  }
}

// 基础评估函数
function basicEvaluation(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  for (const piece of pieces) {
    const baseValue = PIECE_VALUES[piece.type];
    if (piece.color === currentTurn) {
      score += baseValue;
    } else {
      score -= baseValue;
    }
  }
  
  return score;
}

// 中级评估函数
function intermediateEvaluation(pieces: Piece[], currentTurn: PieceColor): number {
  let score = basicEvaluation(pieces, currentTurn);
  
  // 添加位置价值
  score += getPositionalValue(pieces, currentTurn);
  
  // 添加中心控制价值
  score += getCenterControlValue(pieces, currentTurn);
  
  return score;
}

// 高级评估函数
function advancedEvaluation(pieces: Piece[], currentTurn: PieceColor): number {
  let score = intermediateEvaluation(pieces, currentTurn);
  
  // 添加过河奖励
  score += getRiverCrossingBonus(pieces, currentTurn);
  
  return score;
}

// 专家级评估函数
function expertEvaluation(pieces: Piece[], currentTurn: PieceColor): number {
  let score = advancedEvaluation(pieces, currentTurn);
  
  return score;
}

// 获取位置价值
function getPositionalValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  for (const piece of pieces) {
    if (piece.color === currentTurn) {
      // 这里可以添加更复杂的位置价值计算
      // 例如：将/帅在九宫格中心、车在开放线上等
      score += 5;
    } else {
      score -= 5;
    }
  }
  
  return score;
}

// 获取中心控制价值
function getCenterControlValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  for (const piece of pieces) {
    if (piece.color === currentTurn) {
      // 检查是否在中心区域
      if (piece.position.x >= 3 && piece.position.x <= 5) {
        score += CENTER_CONTROL_VALUE;
      }
    } else {
      if (piece.position.x >= 3 && piece.position.x <= 5) {
        score -= CENTER_CONTROL_VALUE;
      }
    }
  }
  
  return score;
}

// 获取过河奖励
function getRiverCrossingBonus(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  for (const piece of pieces) {
    if (piece.color === currentTurn) {
      // 红方过河（y < 5），黑方过河（y > 4）
      if (piece.color === PieceColor.RED && piece.position.y < 5) {
        score += RIVER_CROSSING_BONUS;
      } else if (piece.color === PieceColor.BLACK && piece.position.y > 4) {
        score += RIVER_CROSSING_BONUS;
      }
    } else {
      if (piece.color === PieceColor.RED && piece.position.y < 5) {
        score -= RIVER_CROSSING_BONUS;
      } else if (piece.color === PieceColor.BLACK && piece.position.y > 4) {
        score -= RIVER_CROSSING_BONUS;
      }
    }
  }
  
  return score;
}

// 根据难度获取搜索深度
export function getSearchDepth(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case DifficultyLevel.NOVICE:
      return 1;
    case DifficultyLevel.BEGINNER:
      return 2;
    case DifficultyLevel.ELEMENTARY:
      return 3;
    case DifficultyLevel.INTERMEDIATE:
      return 4;
    case DifficultyLevel.INTERMEDIATE_ADVANCED:
      return 5;
    case DifficultyLevel.ADVANCED:
      return 6;
    case DifficultyLevel.EXPERT:
      return 8;
    case DifficultyLevel.MASTER:
      return 10;
    case DifficultyLevel.GRANDMASTER:
      return 12;
    case DifficultyLevel.INTERNATIONAL_MASTER:
      return 15;
    default:
      return 4;
  }
}

// 根据难度获取时间限制
export function getTimeLimit(difficulty: DifficultyLevel): number {
  switch (difficulty) {
    case DifficultyLevel.NOVICE:
    case DifficultyLevel.BEGINNER:
    case DifficultyLevel.ELEMENTARY:
      return 1000; // 1秒
    case DifficultyLevel.INTERMEDIATE:
    case DifficultyLevel.INTERMEDIATE_ADVANCED:
      return 2000; // 2秒
    case DifficultyLevel.ADVANCED:
    case DifficultyLevel.EXPERT:
      return 3000; // 3秒
    case DifficultyLevel.MASTER:
      return 5000; // 5秒
    case DifficultyLevel.GRANDMASTER:
      return 8000; // 8秒
    case DifficultyLevel.INTERNATIONAL_MASTER:
      return 12000; // 12秒
    default:
      return 2000; // 2秒
  }
} 