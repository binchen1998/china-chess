import { Piece, PieceType, PieceColor, Position, Move, GameStatus } from '../types';

// 棋盘尺寸
export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

// 棋子基础价值
export const PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.GENERAL]: 10000,
  [PieceType.ADVISOR]: 20,
  [PieceType.ELEPHANT]: 20,
  [PieceType.HORSE]: 40,
  [PieceType.CHARIOT]: 90,
  [PieceType.CANNON]: 45,
  [PieceType.SOLDIER]: 10
};

// 获取棋子在指定位置的走法
export function getValidMoves(piece: Piece, pieces: Piece[]): Position[] {
  const validMoves: Position[] = [];
  
  switch (piece.type) {
    case PieceType.GENERAL:
      validMoves.push(...getGeneralMoves(piece, pieces));
      break;
    case PieceType.ADVISOR:
      validMoves.push(...getAdvisorMoves(piece, pieces));
      break;
    case PieceType.ELEPHANT:
      validMoves.push(...getElephantMoves(piece, pieces));
      break;
    case PieceType.HORSE:
      validMoves.push(...getHorseMoves(piece, pieces));
      break;
    case PieceType.CHARIOT:
      validMoves.push(...getChariotMoves(piece, pieces));
      break;
    case PieceType.CANNON:
      validMoves.push(...getCannonMoves(piece, pieces));
      break;
    case PieceType.SOLDIER:
      validMoves.push(...getSoldierMoves(piece, pieces));
      break;
  }
  
  return validMoves.filter(move => isValidPosition(move));
}

// 将/帅的走法
function getGeneralMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  // 九宫格范围
  const isRed = piece.color === PieceColor.RED;
  const minY = isRed ? 7 : 0;
  const maxY = isRed ? 9 : 2;
  const minX = 3;
  const maxX = 5;
  
  // 四个方向的移动
  const directions = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
  ];
  
  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    
    if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
      const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ x: newX, y: newY });
      }
    }
  }
  
  // 将帅对面
  const oppositeGeneral = pieces.find(p => 
    p.type === PieceType.GENERAL && p.color !== piece.color
  );
  
  if (oppositeGeneral && oppositeGeneral.position.x === x) {
    const minY = Math.min(y, oppositeGeneral.position.y);
    const maxY = Math.max(y, oppositeGeneral.position.y);
    let hasBlockingPiece = false;
    
    for (let checkY = minY + 1; checkY < maxY; checkY++) {
      if (getPieceAt({ x, y: checkY }, pieces)) {
        hasBlockingPiece = true;
        break;
      }
    }
    
    if (!hasBlockingPiece) {
      moves.push(oppositeGeneral.position);
    }
  }
  
  return moves;
}

// 士/仕的走法
function getAdvisorMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  const isRed = piece.color === PieceColor.RED;
  const minY = isRed ? 7 : 0;
  const maxY = isRed ? 9 : 2;
  const minX = 3;
  const maxX = 5;
  
  // 斜向移动
  const directions = [
    { dx: -1, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 1 }, { dx: 1, dy: 1 }
  ];
  
  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    
    if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
      const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push({ x: newX, y: newY });
      }
    }
  }
  
  return moves;
}

// 象/相的走法
function getElephantMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  const isRed = piece.color === PieceColor.RED;
  const minY = isRed ? 5 : 0;
  const maxY = isRed ? 9 : 4;
  
  // 象眼位置
  const directions = [
    { dx: -2, dy: -2, eyeX: -1, eyeY: -1 },
    { dx: 2, dy: -2, eyeX: 1, eyeY: -1 },
    { dx: -2, dy: 2, eyeX: -1, eyeY: 1 },
    { dx: 2, dy: 2, eyeX: 1, eyeY: 1 }
  ];
  
  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    
    if (newX >= 0 && newX < BOARD_WIDTH && newY >= minY && newY <= maxY) {
      // 检查象眼是否被阻挡
      const eyePiece = getPieceAt({ x: x + dir.eyeX, y: y + dir.eyeY }, pieces);
      if (!eyePiece) {
        const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push({ x: newX, y: newY });
        }
      }
    }
  }
  
  return moves;
}

// 马的走法
function getHorseMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  // 马腿位置
  const directions = [
    { dx: -2, dy: -1, legX: -1, legY: 0 },
    { dx: -2, dy: 1, legX: -1, legY: 0 },
    { dx: 2, dy: -1, legX: 1, legY: 0 },
    { dx: 2, dy: 1, legX: 1, legY: 0 },
    { dx: -1, dy: -2, legX: 0, legY: -1 },
    { dx: 1, dy: -2, legX: 0, legY: -1 },
    { dx: -1, dy: 2, legX: 0, legY: 1 },
    { dx: 1, dy: 2, legX: 0, legY: 1 }
  ];
  
  for (const dir of directions) {
    const newX = x + dir.dx;
    const newY = y + dir.dy;
    
    if (newX >= 0 && newX < BOARD_WIDTH && newY >= 0 && newY < BOARD_HEIGHT) {
      // 检查马腿是否被阻挡
      const legPiece = getPieceAt({ x: x + dir.legX, y: y + dir.legY }, pieces);
      if (!legPiece) {
        const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
        if (!targetPiece || targetPiece.color !== piece.color) {
          moves.push({ x: newX, y: newY });
        }
      }
    }
  }
  
  return moves;
}

// 车的走法
function getChariotMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  // 四个方向
  const directions = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
  ];
  
  for (const dir of directions) {
    let step = 1;
    while (true) {
      const newX = x + dir.dx * step;
      const newY = y + dir.dy * step;
      
      if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
        break;
      }
      
      const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
      if (targetPiece) {
        if (targetPiece.color !== piece.color) {
          moves.push({ x: newX, y: newY });
        }
        break;
      }
      
      moves.push({ x: newX, y: newY });
      step++;
    }
  }
  
  return moves;
}

// 炮的走法
function getCannonMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  // 四个方向
  const directions = [
    { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
    { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
  ];
  
  for (const dir of directions) {
    let step = 1;
    let hasPlatform = false;
    
    while (true) {
      const newX = x + dir.dx * step;
      const newY = y + dir.dy * step;
      
      if (newX < 0 || newX >= BOARD_WIDTH || newY < 0 || newY >= BOARD_HEIGHT) {
        break;
      }
      
      const targetPiece = getPieceAt({ x: newX, y: newY }, pieces);
      
      if (!hasPlatform) {
        if (!targetPiece) {
          moves.push({ x: newX, y: newY });
        } else {
          hasPlatform = true;
        }
      } else {
        if (targetPiece) {
          if (targetPiece.color !== piece.color) {
            moves.push({ x: newX, y: newY });
          }
          break;
        }
      }
      
      step++;
    }
  }
  
  return moves;
}

// 兵/卒的走法
function getSoldierMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const { x, y } = piece.position;
  
  const isRed = piece.color === PieceColor.RED;
  const forward = isRed ? -1 : 1;
  
  // 向前移动
  const newY = y + forward;
  if (newY >= 0 && newY < BOARD_HEIGHT) {
    const targetPiece = getPieceAt({ x, y: newY }, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push({ x, y: newY });
    }
  }
  
  // 过河后可以左右移动
  const crossedRiver = isRed ? y <= 4 : y >= 5;
  if (crossedRiver) {
    const leftX = x - 1;
    const rightX = x + 1;
    
    if (leftX >= 0) {
      const leftPiece = getPieceAt({ x: leftX, y }, pieces);
      if (!leftPiece || leftPiece.color !== piece.color) {
        moves.push({ x: leftX, y });
      }
    }
    
    if (rightX < BOARD_WIDTH) {
      const rightPiece = getPieceAt({ x: rightX, y }, pieces);
      if (!rightPiece || rightPiece.color !== piece.color) {
        moves.push({ x: rightX, y });
      }
    }
  }
  
  return moves;
}

// 获取指定位置的棋子
export function getPieceAt(position: Position, pieces: Piece[]): Piece | null {
  return pieces.find(p => p.position.x === position.x && p.position.y === position.y) || null;
}

// 检查位置是否有效
export function isValidPosition(position: Position): boolean {
  return position.x >= 0 && position.x < BOARD_WIDTH && 
         position.y >= 0 && position.y < BOARD_HEIGHT;
}

// 检查移动是否有效
export function isValidMove(move: Move, pieces: Piece[]): boolean {
  const validMoves = getValidMoves(move.piece, pieces);
  return validMoves.some(pos => pos.x === move.to.x && pos.y === move.to.y);
}

// 执行移动
export function executeMove(move: Move, pieces: Piece[]): Piece[] {
  const newPieces = pieces.filter(p => p.id !== move.piece.id);
  
  // 移除被吃的棋子
  if (move.captured) {
    newPieces.splice(newPieces.findIndex(p => p.id === move.captured!.id), 1);
  }
  
  // 移动棋子
  const movedPiece = { ...move.piece, position: move.to };
  newPieces.push(movedPiece);
  
  return newPieces;
}

// 检查是否将军
export function isCheck(pieces: Piece[], color: PieceColor): boolean {
  const general = pieces.find(p => p.type === PieceType.GENERAL && p.color === color);
  if (!general) return false;
  
  return pieces.some(piece => 
    piece.color !== color && 
    getValidMoves(piece, pieces).some(move => 
      move.x === general.position.x && move.y === general.position.y
    )
  );
}

// 检查是否将死
export function isCheckmate(pieces: Piece[], color: PieceColor): boolean {
  if (!isCheck(pieces, color)) return false;
  
  const colorPieces = pieces.filter(p => p.color === color);
  
  // 检查是否有任何合法移动可以解除将军
  for (const piece of colorPieces) {
    const validMoves = getValidMoves(piece, pieces);
    for (const move of validMoves) {
      const newPieces = executeMove({ from: piece.position, to: move, piece }, pieces);
      if (!isCheck(newPieces, color)) {
        return false;
      }
    }
  }
  
  return true;
}

// 检查是否和棋（无子可动）
export function isStalemate(pieces: Piece[], color: PieceColor): boolean {
  if (isCheck(pieces, color)) return false;
  
  const colorPieces = pieces.filter(p => p.color === color);
  
  // 检查是否有任何合法移动
  for (const piece of colorPieces) {
    const validMoves = getValidMoves(piece, pieces);
    if (validMoves.length > 0) {
      return false;
    }
  }
  
  return true;
}

// 获取游戏状态
export function getGameStatus(pieces: Piece[], currentTurn: PieceColor): GameStatus {
  if (isCheckmate(pieces, currentTurn)) {
    return GameStatus.CHECKMATE;
  }
  
  if (isStalemate(pieces, currentTurn)) {
    return GameStatus.STALEMATE;
  }
  
  if (isCheck(pieces, currentTurn)) {
    return GameStatus.CHECK;
  }
  
  return GameStatus.PLAYING;
} 