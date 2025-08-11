// 棋盘尺寸常量 - 修复为中国象棋标准比例，增加边距
export const BOARD_WIDTH = 540;  // 调整为540px，确保左右边距对称
export const BOARD_HEIGHT = 600; // 调整为600px，确保上下边距对称
export const CELL_SIZE = 60;     // 每列60px
export const CELL_HEIGHT = 60;   // 每行60px

// 棋盘边距 - 为边缘棋子留出显示空间
export const BOARD_MARGIN = 30;  // 棋盘边距30px

// 棋盘大小调节相关常量
export const MIN_CELL_SIZE = 30;   // 最小格子大小
export const MAX_CELL_SIZE = 80;   // 最大格子大小
export const DEFAULT_CELL_SIZE = 60; // 默认格子大小

// 棋子位置偏移（让棋子对齐到网格线交叉点）
// 由于网格线从0开始，第一条网格线在x=0, y=0位置
// 所以棋子应该放在网格线的交叉点上，不需要额外偏移
export const PIECE_OFFSET_X = 0;   // 不需要偏移，直接放在网格线交叉点
export const PIECE_OFFSET_Y = 0;   // 不需要偏移，直接放在网格线交叉点

// 棋盘样式常量
export const BOARD_COLORS = {
  BACKGROUND: '#F5DEB3',
  BORDER: '#8B4513',
  GRID_LINE: '#8B4513',
  GRID_LINE_BORDER: '#8B4513'
};

// 棋子样式常量
export const PIECE_COLORS = {
  RED: {
    FILL: '#FF6B6B',
    STROKE: '#E74C3C',
    TEXT: '#FFFFFF'
  },
  BLACK: {
    FILL: '#2C3E50',
    STROKE: '#34495E',
    TEXT: '#FFFFFF'
  }
};

// 指示器样式常量
export const INDICATOR_COLORS = {
  SELECTION: '#FFD700',
  VALID_MOVE: {
    FILL: 'rgba(144, 238, 144, 0.7)',
    STROKE: '#32CD32'
  }
}; 