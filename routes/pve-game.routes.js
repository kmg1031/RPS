/**
 * PVE 덱 모드 게임 라우트
 */
const express = require('express');
const router = express.Router();

module.exports = (pveGameController, authenticateToken) => {
    // 게임 플레이 (덱 제출) - 인증 필요
    router.post('/play',
        authenticateToken,
        (req, res) => pveGameController.playGame(req, res)
    );

    // 게임 결과 조회 - 인증 필요
    router.get('/:gameId',
        authenticateToken,
        (req, res) => pveGameController.getGame(req, res)
    );

    // 게임 히스토리 조회 - 인증 필요
    router.get('/history',
        authenticateToken,
        (req, res) => pveGameController.getHistory(req, res)
    );

    // 사용자 통계 조회 - 인증 필요
    router.get('/stats',
        authenticateToken,
        (req, res) => pveGameController.getStats(req, res)
    );

    return router;
};
