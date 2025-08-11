import React from 'react';
import { Piece as PieceType, PieceColor } from '../types';
import { BOARD_MARGIN, PIECE_COLORS, INDICATOR_COLORS } from '../constants/board';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
  cellSize?: number; // 添加可选的cellSize参数
}

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isValidMove, onClick, cellSize = 60 }) => {
  const margin = BOARD_MARGIN;
  
  // 棋子位置计算 - 加上边距，确保对齐到网格线交叉点
  const x = margin + piece.position.x * cellSize;
  const y = margin + piece.position.y * cellSize;
  
  // 棋子半径 - 根据格子大小动态调整，保持与格子的比例
  const radius = cellSize * 0.4; // 棋子半径 = 格子大小的40%
  
  const isRed = piece.color === PieceColor.RED;
  const fillColor = isRed ? PIECE_COLORS.RED.FILL : PIECE_COLORS.BLACK.FILL;
  const strokeColor = isRed ? PIECE_COLORS.RED.STROKE : PIECE_COLORS.BLACK.STROKE;
  const textColor = isRed ? PIECE_COLORS.RED.TEXT : PIECE_COLORS.BLACK.TEXT;
  
  // 获取棋子文字
  const getPieceText = () => {
    const textMap = {
      red: {
        general: '帅',
        advisor: '仕',
        elephant: '相',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '兵'
      },
      black: {
        general: '将',
        advisor: '士',
        elephant: '象',
        horse: '马',
        chariot: '车',
        cannon: '炮',
        soldier: '卒'
      }
    };
    
    const color = isRed ? 'red' : 'black';
    return textMap[color][piece.type] || '';
  };

  // 生成棋子SVG
  const renderPiece = () => {
    const basePiece = (
      <g>
        {/* 棋子阴影 */}
        <circle
          cx={x + 2}
          cy={y + 2}
          r={radius}
          fill="rgba(0,0,0,0.3)"
        />
        
        {/* 棋子主体 */}
        <circle
          cx={x}
          cy={y}
          r={radius}
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={Math.max(2, cellSize * 0.03)} // 根据格子大小动态调整边框宽度
        />
        
        {/* 棋子高光 */}
        <circle
          cx={x - radius * 0.3}
          cy={y - radius * 0.3}
          r={radius * 0.2}
          fill="rgba(255,255,255,0.3)"
        />
        
        {/* 棋子文字 */}
        <text
          x={x}
          y={y + radius * 0.3}
          fontSize={radius * 0.8}
          fill={textColor}
          fontWeight="bold"
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {getPieceText()}
        </text>
      </g>
    );

    return basePiece;
  };

  // 生成选中状态指示器
  const renderSelectionIndicator = () => {
    if (!isSelected) return null;
    
    const indicatorRadius = radius + Math.max(4, cellSize * 0.07); // 根据格子大小动态调整指示器大小
    
    return (
      <g>
        {/* 外圈高亮 */}
        <circle
          cx={x}
          cy={y}
          r={indicatorRadius}
          fill="none"
          stroke={INDICATOR_COLORS.SELECTION}
          strokeWidth={Math.max(3, cellSize * 0.05)}
          strokeDasharray="5,5"
        />
        
        {/* 内圈高亮 */}
        <circle
          cx={x}
          cy={y}
          r={indicatorRadius - Math.max(2, cellSize * 0.03)}
          fill="none"
          stroke={INDICATOR_COLORS.SELECTION}
          strokeWidth={Math.max(1, cellSize * 0.02)}
        />
      </g>
    );
  };

  // 生成有效移动位置指示器
  const renderValidMoveIndicator = () => {
    if (!isValidMove) return null;
    
    const moveRadius = radius * 0.3;
    
    return (
      <g>
        {/* 移动位置圆圈 */}
        <circle
          cx={x}
          cy={y}
          r={moveRadius}
          fill={INDICATOR_COLORS.VALID_MOVE.FILL}
          stroke={INDICATOR_COLORS.VALID_MOVE.STROKE}
          strokeWidth={Math.max(2, cellSize * 0.03)}
        />
        
        {/* 中心点 */}
        <circle
          cx={x}
          cy={y}
          r={Math.max(2, cellSize * 0.03)}
          fill={INDICATOR_COLORS.VALID_MOVE.STROKE}
        />
      </g>
    );
  };

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      {renderPiece()}
      {renderSelectionIndicator()}
      {renderValidMoveIndicator()}
    </g>
  );
};

export default Piece; 