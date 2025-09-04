const express = require('express');
const router = express.Router();
const GameLogic = require('../game');
const { optionalAuth, authenticateToken } = require('../auth');

const gameLogic = new GameLogic();

// 단일 게임 플레이
router.post('/play', optionalAuth, async (req, res) => {
    try {
        const { playerChoice } = req.body;
        
        if (!playerChoice || !gameLogic.isValidChoice(playerChoice)) {
            return res.status(400).json({ 
                success: false,
                message: '유효하지 않은 선택입니다. rock, paper, scissors 중 선택하세요.' 
            });
        }
        
        const gameResult = gameLogic.playSingleGame(playerChoice);
        
        let gameData = {
            ...gameResult,
            saved: false
        };

        // 로그인한 사용자의 경우 라운드 기반 게임 처리
        if (req.user) {
            const Database = require('../database');
            const db = new Database();
            
            // 현재 진행 중인 라운드 조회
            let currentRound = await db.getCurrentRound(req.user.id);
            
            // 진행 중인 라운드가 없으면 새 라운드 시작
            if (!currentRound) {
                const newRound = await db.startNewRound(req.user.id);
                currentRound = {
                    id: newRound.id,
                    user_id: req.user.id,
                    player_score: 0,
                    computer_score: 0,
                    current_win_stack: 0,
                    current_lose_stack: 0,
                    current_choice: null,
                    games_played: 0
                };
            }

            // 연속 점수 및 콤보 점수 계산
            const pointsInfo = gameLogic.calculateGamePoints(currentRound, playerChoice, gameResult.result);

            const gameNumber = currentRound.games_played + 1;
            const newPlayerScore = currentRound.player_score + pointsInfo.pointsEarned;
            const newComputerScore = currentRound.computer_score + (gameResult.result === 'lose' ? 1 : 0);

            // 게임 상세 정보 저장
            await db.saveGameInRound(
                currentRound.id,
                gameNumber,
                playerChoice,
                gameResult.computerChoice,
                gameResult.result,
                pointsInfo.pointsEarned,
                pointsInfo.streakScore,
                pointsInfo.loseScore,
                pointsInfo.stackBroken
            );

            // 라운드 정보 업데이트
            const roundUpdate = await db.updateRoundProgress(
                currentRound.id,
                newPlayerScore,
                newComputerScore,
                pointsInfo.streakScore,
                pointsInfo.loseScore,
                playerChoice,
                gameNumber
            );

            // 승점 업데이트 (얻은 점수만큼 누적)
            if (pointsInfo.pointsEarned > 0) {
                await db.updateUserPoints(req.user.id, pointsInfo.pointsEarned);
            }

            gameData = {
                ...gameData,
                saved: true,
                roundId: currentRound.id,
                gameNumber,
                pointsEarned: pointsInfo.pointsEarned,
                playerScore: newPlayerScore,
                computerScore: newComputerScore,
                streakScore: pointsInfo.streakScore,
                comboScore: pointsInfo.comboScore,
                loseScore: pointsInfo.loseScore,
                gamesPlayed: gameNumber,
                roundComplete: gameNumber === 10,
                roundResult: roundUpdate.roundResult
            };
        }
        
        res.json({
            success: true,
            ...gameData
        });

    } catch (error) {
        console.error('게임 플레이 오류:', error);
        res.status(500).json({
            success: false,
            message: '게임 처리 중 오류가 발생했습니다.'
        });
    }
});

// 라운드 플레이 (10게임 한번에 처리)
router.post('/play-round', optionalAuth, async (req, res) => {
    try {
        const { playerDeck } = req.body;
        
        // 덱 유효성 검사
        if (!gameLogic.isValidDeck(playerDeck)) {
            return res.status(400).json({ 
                success: false,
                message: '유효하지 않은 덱입니다. 10개의 유효한 선택이 필요합니다.' 
            });
        }

        // 게임 로직으로 라운드 처리
        const roundData = gameLogic.playRoundBatch(playerDeck);
        
        let responseData = {
            success: true,
            ...roundData,
            saved: false
        };

        // 로그인한 사용자의 경우 DB에 저장
        if (req.user) {
            try {
                const Database = require('../database');
                const db = new Database();
                
                // 새 라운드 시작
                const newRound = await db.startNewRound(req.user.id);
                
                // 각 게임별 상세 정보 저장
                for (const game of roundData.gameResults) {
                    await db.saveGameInRound(
                        newRound.id,
                        game.gameNumber,
                        game.playerChoice,
                        game.computerChoice,
                        game.result,
                        game.pointsEarned,
                        game.streakScore,
                        game.loseScore,
                        game.stackBroken
                    );
                }

                // 라운드 완료 처리
                await db.updateRoundProgress(
                    newRound.id,
                    roundData.playerScore,
                    roundData.computerScore,
                    roundData.maxStreakScore,
                    0, // currentLoseScore - 마지막 게임 기준
                    playerDeck[9], // 마지막 선택
                    10 // 게임 완료
                );

                // 승점 업데이트 (플레이어가 얻은 점수만큼 누적)
                if (roundData.playerScore > 0) {
                    await db.updateUserPoints(req.user.id, roundData.playerScore);
                }

                responseData.saved = true;
                responseData.roundId = newRound.id;
            } catch (error) {
                console.error('라운드 저장 중 오류:', error);
                // 저장 실패해도 게임 결과는 반환
            }
        }

        res.json(responseData);

    } catch (error) {
        console.error('라운드 플레이 오류:', error);
        res.status(500).json({
            success: false,
            message: error.message || '라운드 처리 중 오류가 발생했습니다.'
        });
    }
});

// 현재 라운드 정보 조회
router.get('/current-round', authenticateToken, async (req, res) => {
    try {
        const Database = require('../database');
        const db = new Database();
        const currentRound = await db.getCurrentRound(req.user.id);
        
        if (!currentRound) {
            return res.json({
                success: true,
                currentRound: null,
                message: '진행 중인 라운드가 없습니다.'
            });
        }

        const roundGames = await db.getRoundGames(currentRound.id);

        res.json({
            success: true,
            currentRound,
            games: roundGames
        });
    } catch (error) {
        console.error('현재 라운드 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '현재 라운드 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});

// 사용자 게임 통계 조회
router.get('/stats', authenticateToken, async (req, res) => {
    try {
        const Database = require('../database');
        const db = new Database();
        const stats = await db.getUserStats(req.user.id);
        const roundHistory = await db.getUserRoundHistory(req.user.id, 10);

        res.json({
            success: true,
            stats,
            roundHistory
        });
    } catch (error) {
        console.error('통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});

module.exports = router;