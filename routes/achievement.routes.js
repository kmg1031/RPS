const express = require('express');

/**
 * 업적 라우터
 * AchievementController를 사용한 라우터
 */
module.exports = (achievementController, authenticateToken) => {
    const router = express.Router();

    // 사용자 업적 목록 조회 (인증 필요)
    router.get('/user',
        authenticateToken,
        (req, res) => achievementController.getUserAchievements(req, res)
    );

    // 사용자 업적 통계 조회 (인증 필요)
    router.get('/stats',
        authenticateToken,
        (req, res) => achievementController.getUserStats(req, res)
    );

    // 전체 업적 목록 조회 (공개)
    router.get('/all',
        (req, res) => achievementController.getAllAchievements(req, res)
    );

    return router;
};
