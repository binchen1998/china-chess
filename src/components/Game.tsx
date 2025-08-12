import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { PieceColor, GameStatus, DifficultyLevel, GameMode, PieceType } from '../types';
import Board from './Board';
import Piece from './Piece';
import { BOARD_MARGIN, MIN_CELL_SIZE, MAX_CELL_SIZE, DEFAULT_CELL_SIZE } from '../constants/board';
import { getValidMoves, debugCheckStatus, getGameStatus } from '../engine/rules';

const Game: React.FC = () => {
  const {
    pieces,
    currentTurn,
    status,
    selectedPiece,
    validMoves,
    config,
    history,
    selectPiece,
    makeMove,
    makeAIMove,
    startNewGame,
    resetGame,
    setDifficulty,
    setGameMode,
    forceUpdateStatus
  } = useGameStore();

  // 状态管理
  const [showDifficultyDialog, setShowDifficultyDialog] = useState(false);
  const [boardCellSize, setBoardCellSize] = useState(DEFAULT_CELL_SIZE);
  const [showGameOverDialog, setShowGameOverDialog] = useState(false);

  // 当轮到AI时自动走子
  useEffect(() => {
    if (currentTurn === PieceColor.BLACK && config.mode === GameMode.HUMAN_VS_AI && status === GameStatus.PLAYING) {
      const timer = setTimeout(() => {
        makeAIMove();
      }, 500); // 延迟500ms让玩家看到AI在思考
      
      return () => clearTimeout(timer);
    }
  }, [currentTurn, config.mode, status]);

  // 监听游戏状态变化，显示游戏结束弹窗
  useEffect(() => {
    if (status === GameStatus.CHECKMATE || status === GameStatus.STALEMATE || status === GameStatus.DRAW) {
      setShowGameOverDialog(true);
    }
  }, [status]);

  // 自动检查游戏状态，确保将死状态能及时显示
  useEffect(() => {
    // 检查当前回合方是否被将死
    const currentPlayerStatus = getGameStatus(pieces, currentTurn);
    
    // 如果当前玩家被将死，但游戏状态还没有更新，强制更新
    if (currentPlayerStatus === GameStatus.CHECKMATE && status !== GameStatus.CHECKMATE) {
      console.log('检测到将死状态，自动更新游戏状态');
      forceUpdateStatus();
    }
    
    // 也检查对方是否被将死（比如红方走子后，检查黑方是否被将死）
    const oppositeColor = currentTurn === PieceColor.RED ? PieceColor.BLACK : PieceColor.RED;
    const oppositeStatus = getGameStatus(pieces, oppositeColor);
    
    if (oppositeStatus === GameStatus.CHECKMATE && status !== GameStatus.CHECKMATE) {
      console.log('检测到对方将死状态，自动更新游戏状态');
      forceUpdateStatus();
    }
  }, [pieces, currentTurn, status, forceUpdateStatus]);

  // 处理棋子点击
  const handlePieceClick = (piece: any) => {
    if (status !== GameStatus.PLAYING) return;
    
    // 如果点击的是当前回合的棋子，选中它
    if (piece.color === currentTurn) {
      selectPiece(piece);
      return;
    }
    
    // 如果已经选中了棋子，尝试移动到目标位置
    if (selectedPiece && selectedPiece.color === currentTurn) {
      const success = makeMove(selectedPiece.position, piece.position);
      if (success) {
        // 移动成功，AI会自动走子
      }
    }
  };

  // 处理游戏模式切换
  const handleGameModeChange = (mode: GameMode) => {
    if (mode === GameMode.HUMAN_VS_AI) {
      // 人机对战：显示难度选择对话框
      setShowDifficultyDialog(true);
    } else {
      // 人人对战：直接设置模式，不显示难度选择
      setGameMode(mode);
      startNewGame({ ...config, mode });
    }
  };

  // 处理难度选择确认
  const handleDifficultyConfirm = (difficulty: DifficultyLevel) => {
    setDifficulty(difficulty);
    setGameMode(GameMode.HUMAN_VS_AI);
    startNewGame({ ...config, mode: GameMode.HUMAN_VS_AI, difficulty });
    setShowDifficultyDialog(false);
  };

  // 获取游戏状态文本
  const getStatusText = () => {
    switch (status) {
      case GameStatus.PLAYING:
        return `当前回合: ${currentTurn === PieceColor.RED ? '红方' : '黑方'}`;
      case GameStatus.CHECK:
        return `${currentTurn === PieceColor.RED ? '红方' : '黑方'}被将军！`;
      case GameStatus.CHECKMATE:
        return `游戏结束！${currentTurn === PieceColor.RED ? '黑方' : '红方'}获胜！`;
      case GameStatus.STALEMATE:
        return '和棋！';
      case GameStatus.DRAW:
        return '平局！';
      default:
        return '游戏进行中';
    }
  };

  // 获取难度描述
  const getDifficultyDescription = (level: DifficultyLevel) => {
    const descriptions = {
      [DifficultyLevel.NOVICE]: '新手 - 随机走子',
      [DifficultyLevel.BEGINNER]: '入门 - 优先吃子',
      [DifficultyLevel.ELEMENTARY]: '初级 - 基础防守',
      [DifficultyLevel.INTERMEDIATE]: '中级 - 1步前瞻',
      [DifficultyLevel.INTERMEDIATE_ADVANCED]: '中高级 - 2步前瞻',
      [DifficultyLevel.ADVANCED]: '高级 - 3步前瞻',
      [DifficultyLevel.EXPERT]: '专家 - 4-5步前瞻',
      [DifficultyLevel.MASTER]: '大师 - 6-8步前瞻',
      [DifficultyLevel.GRANDMASTER]: '特级大师 - 8-12步前瞻',
      [DifficultyLevel.INTERNATIONAL_MASTER]: '国际大师 - 12步以上前瞻'
    };
    return descriptions[level];
  };

  return (
    <div className="game-container">
      {/* 左侧控制面板 */}
      <div className="game-left-panel">
        {/* 游戏头部 */}
        <div className="game-header">
          <h1>中国象棋AI训练</h1>
          <p>挑战不同难度的AI，提升你的象棋水平</p>
        </div>

        {/* 游戏控制 */}
        <div className="game-controls">
          <button className="btn" onClick={() => startNewGame(config)}>
            新游戏
          </button>
          <button className="btn secondary" onClick={resetGame}>
            重置游戏
          </button>
          <button className="btn danger" onClick={() => handleGameModeChange(GameMode.HUMAN_VS_HUMAN)}>
            人人对战
          </button>
          <button className="btn secondary" onClick={() => handleGameModeChange(GameMode.HUMAN_VS_AI)}>
            人机对战
          </button>
        </div>

        {/* 棋盘大小调节 */}
        <div className="board-size-control">
          <label>棋盘大小:</label>
          <input
            type="range"
            min={MIN_CELL_SIZE}
            max={MAX_CELL_SIZE}
            value={boardCellSize}
            onChange={(e) => setBoardCellSize(Number(e.target.value))}
            className="size-slider"
          />
          <span className="size-value">{boardCellSize}px</span>
        </div>
      </div>

      {/* 中央棋盘区域 */}
      <div className="game-center-panel">
        <div className="game-board">
          <Board cellSize={boardCellSize}>
            {/* 渲染所有棋子 */}
            {pieces.map(piece => (
              <Piece
                key={piece.id}
                piece={piece}
                isSelected={selectedPiece?.id === piece.id}
                isValidMove={validMoves.some(pos => 
                  pos.x === piece.position.x && pos.y === piece.position.y
                )}
                onClick={() => handlePieceClick(piece)}
                cellSize={boardCellSize}
              />
            ))}
            
            {/* 渲染有效移动位置指示器 */}
            {validMoves.map((pos, index) => {
              const margin = BOARD_MARGIN;
              return (
                <circle
                  key={`valid-${index}`}
                  cx={margin + pos.x * boardCellSize}
                  cy={margin + pos.y * boardCellSize}
                  r={Math.max(15, boardCellSize * 0.25)} // 根据格子大小动态调整指示器半径
                  fill="rgba(144, 238, 144, 0.5)"
                  stroke="#32CD32"
                  strokeWidth={Math.max(2, boardCellSize * 0.03)} // 根据格子大小动态调整边框宽度
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (selectedPiece) {
                      makeMove(selectedPiece.position, pos);
                    }
                  }}
                />
              );
            })}
          </Board>
        </div>
      </div>

      {/* 右侧信息面板 */}
      <div className="game-right-panel">
        {/* 游戏信息 */}
        <div className="game-info">
          <div className={`status-display ${status === GameStatus.CHECK ? 'check' : ''} ${status === GameStatus.CHECKMATE ? 'checkmate' : ''}`}>
            {getStatusText()}
          </div>
          
          <div className="game-mode">
            模式: {config.mode === GameMode.HUMAN_VS_AI ? '人机对战' : '人人对战'}
          </div>

          {/* 只在人机对战模式下显示难度信息 */}
          {config.mode === GameMode.HUMAN_VS_AI && (
            <div className="difficulty-info">
              <strong>当前难度:</strong> {getDifficultyDescription(config.difficulty)}
            </div>
          )}
        </div>

        {/* 游戏统计 */}
        <div className="game-stats">
          <div className="stat-item">
            <strong>红方棋子:</strong> {pieces.filter(p => p.color === PieceColor.RED).length}
          </div>
          <div className="stat-item">
            <strong>黑方棋子:</strong> {pieces.filter(p => p.color === PieceColor.BLACK).length}
          </div>
          <div className="stat-item">
            <strong>已走步数:</strong> {history.moves.length}
          </div>
        </div>

        {/* 调试信息 */}
        <div className="debug-info" style={{ marginTop: '20px', padding: '15px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '8px', fontSize: '12px' }}>
          <div><strong>调试信息:</strong></div>
          <div>当前状态: {status}</div>
          <div>当前回合: {currentTurn === PieceColor.RED ? '红方' : '黑方'}</div>
          <div>红方将军: {pieces.some(p => p.color === PieceColor.BLACK && getValidMoves(p, pieces).some(move => {
            const redGeneral = pieces.find(g => g.type === PieceType.GENERAL && g.color === PieceColor.RED);
            return redGeneral && move.x === redGeneral.position.x && move.y === redGeneral.position.y;
          })) ? '是' : '否'}</div>
          <div>黑方将军: {pieces.some(p => p.color === PieceColor.RED && getValidMoves(p, pieces).some(move => {
            const blackGeneral = pieces.find(g => g.type === PieceType.GENERAL && g.color === PieceColor.BLACK);
            return blackGeneral && move.x === blackGeneral.position.x && move.y === blackGeneral.position.y;
          })) ? '是' : '否'}</div>
          
          {/* 强制状态检查 */}
          <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
            <div><strong>强制状态检查:</strong></div>
            <div>红方状态: {getGameStatus(pieces, PieceColor.RED)}</div>
            <div>黑方状态: {getGameStatus(pieces, PieceColor.BLACK)}</div>
            <button 
              onClick={() => {
                const blackStatus = getGameStatus(pieces, PieceColor.BLACK);
                if (blackStatus === GameStatus.CHECKMATE) {
                  console.log('黑方被将死，强制更新游戏状态');
                  forceUpdateStatus();
                }
              }}
              style={{ 
                padding: '5px 10px', 
                margin: '5px', 
                fontSize: '10px',
                background: 'rgba(255,255,255,0.2)',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '4px',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              检查黑方状态
            </button>
          </div>
          
          {/* 详细将军信息 */}
          <div style={{ marginTop: '10px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '10px' }}>
            <div><strong>详细将军信息:</strong></div>
            <div>红方将军详情:</div>
            {debugCheckStatus(pieces, PieceColor.RED).map((info, index) => (
              <div key={index} style={{ fontSize: '10px', marginLeft: '10px' }}>{info}</div>
            ))}
            <div>黑方将军详情:</div>
            {debugCheckStatus(pieces, PieceColor.BLACK).map((info, index) => (
              <div key={index} style={{ fontSize: '10px', marginLeft: '10px' }}>{info}</div>
            ))}
          </div>
        </div>
      </div>

      {/* 难度选择对话框 */}
      {showDifficultyDialog && (
        <div className="dialog-overlay">
          <div className="difficulty-dialog">
            <h3>选择AI难度</h3>
            <div className="difficulty-options">
              {Object.values(DifficultyLevel)
                .filter(value => typeof value === 'number')
                .map(level => (
                  <button
                    key={level}
                    className="difficulty-option"
                    onClick={() => handleDifficultyConfirm(level as DifficultyLevel)}
                  >
                    {getDifficultyDescription(level as DifficultyLevel)}
                  </button>
                ))}
            </div>
            <button 
              className="btn secondary cancel-btn"
              onClick={() => setShowDifficultyDialog(false)}
            >
              取消
            </button>
          </div>
        </div>
      )}

      {/* 游戏结束弹窗 */}
      {showGameOverDialog && (
        <div className="dialog-overlay">
          <div className="game-over-dialog">
            {/* 右上角关闭按钮 */}
            <button 
              className="dialog-close-btn"
              onClick={() => setShowGameOverDialog(false)}
              title="关闭弹窗，保留棋盘学习"
            >
              ✕
            </button>
            
            {/* 胜负图标和标题 */}
            <div className="game-over-header">
              {status === GameStatus.CHECKMATE ? (
                <>
                  <div className="winner-icon">🏆</div>
                  <h3>恭喜获胜！</h3>
                </>
              ) : status === GameStatus.STALEMATE ? (
                <>
                  <div className="draw-icon">🤝</div>
                  <h3>和棋！</h3>
                </>
              ) : (
                <>
                  <div className="game-over-icon">🎯</div>
                  <h3>游戏结束</h3>
                </>
              )}
            </div>
            
            {/* 胜负详细说明 */}
            <div className="game-over-details">
              {status === GameStatus.CHECKMATE ? (
                <div className="winner-announcement">
                  <div className="winner-text">
                    <span className="winner-color">
                      {currentTurn === PieceColor.RED ? '黑方' : '红方'}
                    </span>
                    <span className="winner-label">获胜！</span>
                  </div>
                  <div className="loser-text">
                    <span className="loser-color">
                      {currentTurn === PieceColor.RED ? '红方' : '黑方'}
                    </span>
                    <span className="loser-label">被将死</span>
                  </div>
                </div>
              ) : status === GameStatus.STALEMATE ? (
                <div className="stalemate-announcement">
                  <div className="stalemate-text">
                    双方都无法移动，形成和棋
                  </div>
                </div>
              ) : (
                <div className="game-over-message">
                  {getStatusText()}
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            <div className="game-over-actions">
              <button 
                className="btn primary"
                onClick={() => {
                  setShowGameOverDialog(false);
                  startNewGame(config);
                }}
              >
                🎮 新游戏
              </button>
              <button 
                className="btn secondary"
                onClick={() => {
                  setShowGameOverDialog(false);
                  resetGame();
                }}
              >
                🔄 重新开始
              </button>
            </div>
            
            {/* 提示信息 */}
            <div className="dialog-tip" style={{ 
              marginTop: '15px', 
              fontSize: '12px', 
              color: '#666', 
              fontStyle: 'italic' 
            }}>
              提示：点击右上角 ✕ 按钮可以关闭弹窗，保留当前棋盘供学习研究
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game; 