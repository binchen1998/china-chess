import React from 'react';
import { BOARD_MARGIN, BOARD_COLORS } from '../constants/board';

interface BoardProps {
  children: React.ReactNode;
  cellSize?: number; // 添加可选的cellSize参数
}

const Board: React.FC<BoardProps> = ({ children, cellSize = 60 }) => {
  const margin = BOARD_MARGIN;
  
  // 动态计算棋盘尺寸
  const actualBoardWidth = margin * 2 + 8 * cellSize;  // 8列 + 左右边距
  const actualBoardHeight = margin * 2 + 9 * cellSize; // 9行 + 上下边距

  // 生成棋盘网格线 - 修复网格线对齐问题
  const generateGridLines = () => {
    const lines: JSX.Element[] = [];
    
    // 垂直线 - 从0到8列，共9条线
    // 第一条线在x=margin，最后一条线在x=margin+8*cellSize
    for (let x = 0; x <= 8; x++) {
      const xPos = margin + x * cellSize;
      lines.push(
        <line
          key={`v-${x}`}
          x1={xPos}
          y1={margin}
          x2={xPos}
          y2={margin + 9 * cellSize}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={x === 0 || x === 8 ? 2 : 1}
          fill="none"
        />
      );
    }
    
    // 水平线 - 从0到9行，共10条线
    // 第一条线在y=margin，最后一条线在y=margin+9*cellSize
    for (let y = 0; y <= 9; y++) {
      const yPos = margin + y * cellSize;
      lines.push(
        <line
          key={`h-${y}`}
          x1={margin}
          y1={yPos}
          x2={margin + 8 * cellSize}
          y2={yPos}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={y === 0 || y === 9 ? 2 : 1}
          fill="none"
        />
      );
    }
    
    return lines;
  };

  // 生成九宫格 - 修复位置计算
  const generatePalace = () => {
    const palaceElements: JSX.Element[] = [];
    
    // 上方九宫格（黑方）- 第0-2行
    const topPalace = (
      <g key="top-palace">
        {/* 斜线 */}
        <line
          x1={margin + 3 * cellSize}
          y1={margin}
          x2={margin + 5 * cellSize}
          y2={margin + 2 * cellSize}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={1}
          fill="none"
        />
        <line
          x1={margin + 5 * cellSize}
          y1={margin}
          x2={margin + 3 * cellSize}
          y2={margin + 2 * cellSize}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={1}
          fill="none"
        />
      </g>
    );
    
    // 下方九宫格（红方）- 第7-9行
    const bottomPalace = (
      <g key="bottom-palace">
        {/* 斜线 */}
        <line
          x1={margin + 3 * cellSize}
          y1={margin + 7 * cellSize}
          x2={margin + 5 * cellSize}
          y2={margin + 9 * cellSize}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={1}
          fill="none"
        />
        <line
          x1={margin + 5 * cellSize}
          y1={margin + 7 * cellSize}
          x2={margin + 3 * cellSize}
          y2={margin + 9 * cellSize}
          stroke={BOARD_COLORS.GRID_LINE}
          strokeWidth={1}
          fill="none"
        />
      </g>
    );
    
    palaceElements.push(topPalace, bottomPalace);
    return palaceElements;
  };

  // 生成河界标记 - 修复位置计算
  const generateRiverMarkings = () => {
    const actualBoardWidth = 8 * cellSize; // 实际棋盘宽度（8列）
    const centerX = margin + actualBoardWidth / 2; // 中心位置
    const fontSize = Math.max(12, cellSize * 0.3); // 根据格子大小动态调整字体大小
    
    return (
      <g key="river-markings">
        {/* 楚河 - 第4-5行之间 */}
        <text
          x={centerX - fontSize * 1.5}
          y={margin + 4.5 * cellSize + fontSize * 0.3}
          fontSize={fontSize}
          fill={BOARD_COLORS.GRID_LINE}
          fontWeight="bold"
          textAnchor="middle"
        >
          楚河
        </text>
        {/* 汉界 - 第4-5行之间 */}
        <text
          x={centerX + fontSize * 1.5}
          y={margin + 4.5 * cellSize + fontSize * 0.3}
          fontSize={fontSize}
          fill={BOARD_COLORS.GRID_LINE}
          fontWeight="bold"
          textAnchor="middle"
        >
          汉界
        </text>
      </g>
    );
  };

  // 生成兵位和炮位标记 - 修复位置计算
  const generatePositionMarkings = () => {
    const markings: JSX.Element[] = [];
    
    // 兵位标记（小十字）
    const soldierPositions = [
      // 红方兵位 - 第6行
      { x: 0, y: 6 }, { x: 2, y: 6 }, { x: 4, y: 6 }, { x: 6, y: 6 }, { x: 8, y: 6 },
      // 黑方兵位 - 第3行
      { x: 0, y: 3 }, { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 8, y: 3 }
    ];
    
    // 炮位标记（大十字）
    const cannonPositions = [
      // 红方炮位 - 第7行
      { x: 1, y: 7 }, { x: 7, y: 7 },
      // 黑方炮位 - 第2行
      { x: 1, y: 2 }, { x: 7, y: 2 }
    ];
    
    // 生成兵位标记 - 直接放在网格线交叉点，不需要偏移
    soldierPositions.forEach(pos => {
      const x = margin + pos.x * cellSize;
      const y = margin + pos.y * cellSize;
      const size = Math.max(3, cellSize * 0.05); // 根据格子大小动态调整标记大小
      
      markings.push(
        <g key={`soldier-${pos.x}-${pos.y}`}>
          <line x1={x - size} y1={y} x2={x + size} y2={y} stroke={BOARD_COLORS.GRID_LINE} strokeWidth={1} />
          <line x1={x} y1={y - size} x2={x} y2={y + size} stroke={BOARD_COLORS.GRID_LINE} strokeWidth={1} />
        </g>
      );
    });
    
    // 生成炮位标记 - 直接放在网格线交叉点，不需要偏移
    cannonPositions.forEach(pos => {
      const x = margin + pos.x * cellSize;
      const y = margin + pos.y * cellSize;
      const size = Math.max(4, cellSize * 0.07); // 根据格子大小动态调整标记大小
      
      markings.push(
        <g key={`cannon-${pos.x}-${pos.y}`}>
          <line x1={x - size} y1={y} x2={x + size} y2={y} stroke={BOARD_COLORS.GRID_LINE} strokeWidth={2} />
          <line x1={x} y1={y - size} x2={x} y2={y + size} stroke={BOARD_COLORS.GRID_LINE} strokeWidth={2} />
        </g>
      );
    });
    
    return markings;
  };

  return (
    <div className="board-container" style={{ display: 'inline-block' }}>
      <svg
        width={actualBoardWidth}
        height={actualBoardHeight}
        viewBox={`0 0 ${actualBoardWidth} ${actualBoardHeight}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ 
          backgroundColor: BOARD_COLORS.BACKGROUND,
          border: `3px solid ${BOARD_COLORS.BORDER}`,
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          maxWidth: '100%',
          maxHeight: '100%'
        }}
      >
        {/* 棋盘背景 */}
        <rect
          x={0}
          y={0}
          width={actualBoardWidth}
          height={actualBoardHeight}
          fill={BOARD_COLORS.BACKGROUND}
        />
        
        {/* 网格线 */}
        {generateGridLines()}
        
        {/* 九宫格 */}
        {generatePalace()}
        
        {/* 河界标记 */}
        {generateRiverMarkings()}
        
        {/* 兵位和炮位标记 */}
        {generatePositionMarkings()}
        
        {/* 棋子 */}
        {children}
      </svg>
    </div>
  );
};

export default Board; 