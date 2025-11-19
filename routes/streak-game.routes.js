const express = require('express');

/**
 * 연승제 게임 라우터
 * StreakGameController를 사용
 */
module.exports = (streakGameController, authenticateToken) => {
    const router = express.Router();

    // 새 게임 시작 (인증 필요)
    router.post('/start',
        authenticateToken,
        (req, res) => streakGameController.startGame(req, res)
    );

    // 라운드 플레이 (인증 필요)
    router.post('/play',
        authenticateToken,
        (req, res) => streakGameController.playRound(req, res)
    );

    // 게임 중도 포기 (인증 필요)
    router.post('/quit',
        authenticateToken,
        (req, res) => streakGameController.quitGame(req, res)
    );

    // 현재 진행 중인 게임 조회 (인증 필요)
    router.get('/current',
        authenticateToken,
        (req, res) => streakGameController.getCurrentGame(req, res)
    );

    // 사용자 게임 히스토리 (인증 필요)
    router.get('/history',
        authenticateToken,
        (req, res) => streakGameController.getHistory(req, res)
    );

    // 사용자 통계 (인증 필요)
    router.get('/stats',
        authenticateToken,
        (req, res) => streakGameController.getStats(req, res)
    );

    return router;
};
