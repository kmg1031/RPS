/**
 * RESTful Games API Routes (v1)
 * Resource: /api/v1/games
 */
const express = require('express');
const { catchAsync } = require('../../middlewares/errorHandler');

module.exports = (pveGameController, streakGameController, authenticateToken) => {
    const router = express.Router();

    // ===== PVE 게임 (덱 기반) =====

    /**
     * POST /api/v1/games
     * 새 게임 생성 및 플레이 (PVE 덱 모드)
     */
    router.post('/',
        authenticateToken,
        catchAsync((req, res) => pveGameController.playGame(req, res))
    );

    /**
     * GET /api/v1/games
     * 게임 목록 조회 (히스토리)
     */
    router.get('/',
        authenticateToken,
        catchAsync((req, res) => pveGameController.getHistory(req, res))
    );

    /**
     * GET /api/v1/games/:id
     * 특정 게임 조회
     */
    router.get('/:id',
        authenticateToken,
        catchAsync((req, res) => pveGameController.getGame(req, res))
    );

    // ===== 연승제 게임 (Streak Game) =====

    /**
     * POST /api/v1/games/streak
     * 연승제 게임 시작
     */
    router.post('/streak',
        authenticateToken,
        catchAsync((req, res) => streakGameController.startGame(req, res))
    );

    /**
     * GET /api/v1/games/streak/current
     * 현재 진행 중인 연승제 게임 조회
     */
    router.get('/streak/current',
        authenticateToken,
        catchAsync((req, res) => streakGameController.getCurrentGame(req, res))
    );

    /**
     * POST /api/v1/games/streak/play
     * 연승제 게임 라운드 플레이
     */
    router.post('/streak/play',
        authenticateToken,
        catchAsync((req, res) => streakGameController.playRound(req, res))
    );

    /**
     * DELETE /api/v1/games/streak/current
     * 현재 게임 포기 (quit)
     */
    router.delete('/streak/current',
        authenticateToken,
        catchAsync((req, res) => streakGameController.quitGame(req, res))
    );

    /**
     * GET /api/v1/games/streak/history
     * 연승제 게임 히스토리
     */
    router.get('/streak/history',
        authenticateToken,
        catchAsync((req, res) => streakGameController.getHistory(req, res))
    );

    return router;
};
