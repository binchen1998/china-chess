import { Piece, PieceType, PieceColor, Position, Move, GameStatus } from '../types';

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;

const PALACE_MIN_X = 3;
const PALACE_MAX_X = 5;
const RED_PALACE_MIN_Y = 7;
const RED_PALACE_MAX_Y = 9;
const BLACK_PALACE_MIN_Y = 0;
const BLACK_PALACE_MAX_Y = 2;

export const PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.GENERAL]: 10000,
  [PieceType.ADVISOR]: 20,
  [PieceType.ELEPHANT]: 20,
  [PieceType.HORSE]: 40,
  [PieceType.CHARIOT]: 90,
  [PieceType.CANNON]: 45,
  [PieceType.SOLDIER]: 10
};

function positionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function getOpponentColor(color: PieceColor): PieceColor {
  return color === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED;
}

function isInsidePalace(position: Position, color: PieceColor): boolean {
  const minY = color === PieceColor.RED ? RED_PALACE_MIN_Y : BLACK_PALACE_MIN_Y;
  const maxY = color === PieceColor.RED ? RED_PALACE_MAX_Y : BLACK_PALACE_MAX_Y;
  return (
    position.x >= PALACE_MIN_X &&
    position.x <= PALACE_MAX_X &&
    position.y >= minY &&
    position.y <= maxY
  );
}

function hasCrossedRiver(position: Position, color: PieceColor): boolean {
  return color === PieceColor.RED ? position.y <= 4 : position.y >= 5;
}

function findGeneral(pieces: Piece[], color: PieceColor): Piece | null {
  return pieces.find(piece => piece.type === PieceType.GENERAL && piece.color === color) ?? null;
}

function isClearVerticalPath(pieces: Piece[], x: number, fromY: number, toY: number): boolean {
  const minY = Math.min(fromY, toY);
  const maxY = Math.max(fromY, toY);

  for (let y = minY + 1; y < maxY; y++) {
    if (getPieceAt({ x, y }, pieces)) {
      return false;
    }
  }

  return true;
}

function createMove(piece: Piece, to: Position, pieces: Piece[]): Move {
  const targetPiece = getPieceAt(to, pieces);
  return {
    from: piece.position,
    to,
    piece,
    captured: targetPiece && targetPiece.color !== piece.color ? targetPiece : undefined
  };
}

function canPseudoAttackSquare(piece: Piece, target: Position, pieces: Piece[]): boolean {
  return getPseudoLegalMoves(piece, pieces).some(move => positionsEqual(move, target));
}

function isCheckByPseudoAttack(pieces: Piece[], color: PieceColor): boolean {
  const general = findGeneral(pieces, color);
  if (!general) {
    return true;
  }

  return pieces.some(
    piece => piece.color !== color && canPseudoAttackSquare(piece, general.position, pieces)
  );
}

function getGeneralPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];

  for (const { dx, dy } of directions) {
    const target = { x: piece.position.x + dx, y: piece.position.y + dy };
    if (!isInsidePalace(target, piece.color)) {
      continue;
    }

    const targetPiece = getPieceAt(target, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push(target);
    }
  }

  const oppositeGeneral = findGeneral(pieces, getOpponentColor(piece.color));
  if (
    oppositeGeneral &&
    oppositeGeneral.position.x === piece.position.x &&
    isClearVerticalPath(pieces, piece.position.x, piece.position.y, oppositeGeneral.position.y)
  ) {
    moves.push(oppositeGeneral.position);
  }

  return moves;
}

function getAdvisorPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: -1, dy: -1 },
    { dx: 1, dy: -1 },
    { dx: -1, dy: 1 },
    { dx: 1, dy: 1 }
  ];

  for (const { dx, dy } of directions) {
    const target = { x: piece.position.x + dx, y: piece.position.y + dy };
    if (!isInsidePalace(target, piece.color)) {
      continue;
    }

    const targetPiece = getPieceAt(target, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push(target);
    }
  }

  return moves;
}

function getElephantPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: -2, dy: -2, eyeX: -1, eyeY: -1 },
    { dx: 2, dy: -2, eyeX: 1, eyeY: -1 },
    { dx: -2, dy: 2, eyeX: -1, eyeY: 1 },
    { dx: 2, dy: 2, eyeX: 1, eyeY: 1 }
  ];

  for (const { dx, dy, eyeX, eyeY } of directions) {
    const target = { x: piece.position.x + dx, y: piece.position.y + dy };
    const elephantEye = { x: piece.position.x + eyeX, y: piece.position.y + eyeY };

    if (!isValidPosition(target)) {
      continue;
    }
    if (piece.color === PieceColor.RED && target.y < 5) {
      continue;
    }
    if (piece.color === PieceColor.BLACK && target.y > 4) {
      continue;
    }
    if (getPieceAt(elephantEye, pieces)) {
      continue;
    }

    const targetPiece = getPieceAt(target, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push(target);
    }
  }

  return moves;
}

function getHorsePseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
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

  for (const { dx, dy, legX, legY } of directions) {
    const target = { x: piece.position.x + dx, y: piece.position.y + dy };
    const horseLeg = { x: piece.position.x + legX, y: piece.position.y + legY };

    if (!isValidPosition(target) || getPieceAt(horseLeg, pieces)) {
      continue;
    }

    const targetPiece = getPieceAt(target, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push(target);
    }
  }

  return moves;
}

function getChariotPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];

  for (const { dx, dy } of directions) {
    let step = 1;

    while (true) {
      const target = { x: piece.position.x + dx * step, y: piece.position.y + dy * step };
      if (!isValidPosition(target)) {
        break;
      }

      const targetPiece = getPieceAt(target, pieces);
      if (!targetPiece) {
        moves.push(target);
        step++;
        continue;
      }

      if (targetPiece.color !== piece.color) {
        moves.push(target);
      }
      break;
    }
  }

  return moves;
}

function getCannonPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const directions = [
    { dx: 0, dy: -1 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 1, dy: 0 }
  ];

  for (const { dx, dy } of directions) {
    let step = 1;
    let platformFound = false;

    while (true) {
      const target = { x: piece.position.x + dx * step, y: piece.position.y + dy * step };
      if (!isValidPosition(target)) {
        break;
      }

      const targetPiece = getPieceAt(target, pieces);
      if (!platformFound) {
        if (!targetPiece) {
          moves.push(target);
        } else {
          platformFound = true;
        }
      } else if (targetPiece) {
        if (targetPiece.color !== piece.color) {
          moves.push(target);
        }
        break;
      }

      step++;
    }
  }

  return moves;
}

function getSoldierPseudoMoves(piece: Piece, pieces: Piece[]): Position[] {
  const moves: Position[] = [];
  const forwardY = piece.position.y + (piece.color === PieceColor.RED ? -1 : 1);
  const forward = { x: piece.position.x, y: forwardY };

  if (isValidPosition(forward)) {
    const targetPiece = getPieceAt(forward, pieces);
    if (!targetPiece || targetPiece.color !== piece.color) {
      moves.push(forward);
    }
  }

  if (hasCrossedRiver(piece.position, piece.color)) {
    const sideways = [
      { x: piece.position.x - 1, y: piece.position.y },
      { x: piece.position.x + 1, y: piece.position.y }
    ];

    for (const target of sideways) {
      if (!isValidPosition(target)) {
        continue;
      }

      const targetPiece = getPieceAt(target, pieces);
      if (!targetPiece || targetPiece.color !== piece.color) {
        moves.push(target);
      }
    }
  }

  return moves;
}

function getPseudoLegalMoves(piece: Piece, pieces: Piece[]): Position[] {
  switch (piece.type) {
    case PieceType.GENERAL:
      return getGeneralPseudoMoves(piece, pieces);
    case PieceType.ADVISOR:
      return getAdvisorPseudoMoves(piece, pieces);
    case PieceType.ELEPHANT:
      return getElephantPseudoMoves(piece, pieces);
    case PieceType.HORSE:
      return getHorsePseudoMoves(piece, pieces);
    case PieceType.CHARIOT:
      return getChariotPseudoMoves(piece, pieces);
    case PieceType.CANNON:
      return getCannonPseudoMoves(piece, pieces);
    case PieceType.SOLDIER:
      return getSoldierPseudoMoves(piece, pieces);
    default:
      return [];
  }
}

export function getPieceAt(position: Position, pieces: Piece[]): Piece | null {
  return pieces.find(piece => positionsEqual(piece.position, position)) ?? null;
}

export function isValidPosition(position: Position): boolean {
  return (
    position.x >= 0 &&
    position.x < BOARD_WIDTH &&
    position.y >= 0 &&
    position.y < BOARD_HEIGHT
  );
}

export function executeMove(move: Move, pieces: Piece[]): Piece[] {
  const targetPiece = getPieceAt(move.to, pieces);
  const capturedPiece =
    move.captured ??
    (targetPiece && targetPiece.color !== move.piece.color ? targetPiece : null);
  const newPieces = pieces.filter(piece => {
    if (piece.id === move.piece.id) {
      return false;
    }
    if (capturedPiece && piece.id === capturedPiece.id) {
      return false;
    }
    return true;
  });

  newPieces.push({
    ...move.piece,
    position: move.to
  });

  return newPieces;
}

export function isCheck(pieces: Piece[], color: PieceColor): boolean {
  return isCheckByPseudoAttack(pieces, color);
}

export function getValidMoves(piece: Piece, pieces: Piece[]): Position[] {
  if (!pieces.some(current => current.id === piece.id)) {
    return [];
  }

  return getPseudoLegalMoves(piece, pieces).filter(target => {
    const nextPieces = executeMove(createMove(piece, target, pieces), pieces);
    return !isCheck(nextPieces, piece.color);
  });
}

export function getAllLegalMoves(pieces: Piece[], color: PieceColor): Move[] {
  const moves: Move[] = [];
  const colorPieces = pieces.filter(piece => piece.color === color);

  for (const piece of colorPieces) {
    for (const target of getValidMoves(piece, pieces)) {
      moves.push(createMove(piece, target, pieces));
    }
  }

  return moves;
}

export function isValidMove(move: Move, pieces: Piece[]): boolean {
  return getValidMoves(move.piece, pieces).some(target => positionsEqual(target, move.to));
}

export function isCheckmate(pieces: Piece[], color: PieceColor): boolean {
  if (!findGeneral(pieces, color)) {
    return true;
  }

  return isCheck(pieces, color) && getAllLegalMoves(pieces, color).length === 0;
}

export function isStalemate(pieces: Piece[], color: PieceColor): boolean {
  if (!findGeneral(pieces, color)) {
    return false;
  }

  return !isCheck(pieces, color) && getAllLegalMoves(pieces, color).length === 0;
}

export function getGameStatus(pieces: Piece[], currentTurn: PieceColor): GameStatus {
  if (!findGeneral(pieces, currentTurn)) {
    return GameStatus.CHECKMATE;
  }

  const legalMoves = getAllLegalMoves(pieces, currentTurn);
  if (legalMoves.length === 0) {
    return isCheck(pieces, currentTurn) ? GameStatus.CHECKMATE : GameStatus.STALEMATE;
  }

  if (isCheck(pieces, currentTurn)) {
    return GameStatus.CHECK;
  }

  return GameStatus.PLAYING;
}

export function debugCheckStatus(pieces: Piece[], color: PieceColor): string[] {
  const general = findGeneral(pieces, color);
  if (!general) {
    return [`找不到${color === PieceColor.RED ? '红' : '黑'}方将/帅`];
  }

  const debugInfo = [
    `${color === PieceColor.RED ? '红' : '黑'}方将/帅位置: (${general.position.x}, ${general.position.y})`
  ];

  for (const piece of pieces) {
    if (piece.color === color) {
      continue;
    }

    const pseudoMoves = getPseudoLegalMoves(piece, pieces);
    if (!pseudoMoves.some(move => positionsEqual(move, general.position))) {
      continue;
    }

    const legalMoves = getValidMoves(piece, pieces);
    debugInfo.push(
      `${piece.type}(${piece.color === PieceColor.RED ? '红' : '黑'}) 在位置(${piece.position.x}, ${piece.position.y}) 正在攻击将/帅`
    );
    debugInfo.push(`  几何攻击点: ${pseudoMoves.map(move => `(${move.x},${move.y})`).join(', ')}`);
    debugInfo.push(`  该子合法着法: ${legalMoves.map(move => `(${move.x},${move.y})`).join(', ')}`);
  }

  return debugInfo;
}