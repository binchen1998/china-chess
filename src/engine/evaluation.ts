import { Piece, PieceColor, PieceType, DifficultyLevel } from '../types';
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
  
  // 添加更复杂的战术评估
  score += getTacticalValue(pieces, currentTurn);
  
  // 添加子力协调性评估
  score += getCoordinationValue(pieces, currentTurn);
  
  // 添加王的安全评估
  score += getKingSafetyValue(pieces, currentTurn);
  
  // 添加线路控制评估
  score += getLineControlValue(pieces, currentTurn);
  
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
      return 12;
    case DifficultyLevel.GRANDMASTER:
      return 16;
    case DifficultyLevel.INTERNATIONAL_MASTER:
      return 20;
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
      return 30000; // 30秒
    default:
      return 2000; // 2秒
  }
}

// 战术价值评估
function getTacticalValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  for (const piece of pieces) {
    if (piece.color === currentTurn) {
      // 检查是否有威胁
      if (hasThreat(piece, pieces)) {
        score += 15;
      }
      
      // 检查是否被保护
      if (isProtected(piece, pieces)) {
        score += 10;
      }
    }
  }
  
  return score;
}

// 子力协调性评估
function getCoordinationValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  // 检查车炮配合
  score += getChariotCannonCoordination(pieces, currentTurn);
  
  // 检查马象配合
  score += getHorseElephantCoordination(pieces, currentTurn);
  
  return score;
}

// 王的安全评估
function getKingSafetyValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  const king = pieces.find(p => p.type === PieceType.GENERAL && p.color === currentTurn);
  if (king) {
    // 检查王周围的保护
    const protectors = pieces.filter(p => 
      p.color === currentTurn && 
      Math.abs(p.position.x - king.position.x) <= 1 && 
      Math.abs(p.position.y - king.position.y) <= 1
    );
    score += protectors.length * 8;
  }
  
  return score;
}

// 线路控制评估
function getLineControlValue(pieces: Piece[], currentTurn: PieceColor): number {
  let score = 0;
  
  // 检查开放线控制
  for (let x = 0; x <= 8; x++) {
    const lineControl = getLineControl(pieces, x, currentTurn);
    score += lineControl * 5;
  }
  
  return score;
}

// 辅助函数
function hasThreat(piece: Piece, pieces: Piece[]): boolean {
  // 简化实现：检查是否有敌方棋子可以攻击这个位置
  return pieces.some(p => 
    p.color !== piece.color && 
    Math.abs(p.position.x - piece.position.x) + Math.abs(p.position.y - piece.position.y) <= 2
  );
}

function isProtected(piece: Piece, pieces: Piece[]): boolean {
  // 简化实现：检查是否有友方棋子保护
  return pieces.some(p => 
    p.color === piece.color && 
    p.id !== piece.id &&
    Math.abs(p.position.x - piece.position.x) + Math.abs(p.position.y - piece.position.y) <= 2
  );
}

function getChariotCannonCoordination(pieces: Piece[], currentTurn: PieceColor): number {
  // 简化实现：检查车炮是否在同一条线上
  const chariots = pieces.filter(p => p.type === PieceType.CHARIOT && p.color === currentTurn);
  const cannons = pieces.filter(p => p.type === PieceType.CANNON && p.color === currentTurn);
  
  let score = 0;
  // 检查车炮是否在同一条线上
  for (const chariot of chariots) {
    for (const cannon of cannons) {
      if (chariot.position.x === cannon.position.x || chariot.position.y === cannon.position.y) {
        score += 5;
      }
    }
  }
  return score;
}

function getHorseElephantCoordination(pieces: Piece[], currentTurn: PieceColor): number {
  // 简化实现：检查马象配合
  const horses = pieces.filter(p => p.type === PieceType.HORSE && p.color === currentTurn);
  const elephants = pieces.filter(p => p.type === PieceType.ELEPHANT && p.color === currentTurn);
  
  let score = 0;
  // 检查马象是否形成保护网
  for (const horse of horses) {
    for (const elephant of elephants) {
      if (Math.abs(horse.position.x - elephant.position.x) <= 2 && 
          Math.abs(horse.position.y - elephant.position.y) <= 2) {
        score += 3;
      }
    }
  }
  return score;
}

function getLineControl(pieces: Piece[], x: number, currentTurn: PieceColor): number {
  // 简化实现：计算线路控制
  const currentPieces = pieces.filter(p => p.position.x === x && p.color === currentTurn);
  const enemyPieces = pieces.filter(p => p.position.x === x && p.color !== currentTurn);
  return currentPieces.length - enemyPieces.length;
}