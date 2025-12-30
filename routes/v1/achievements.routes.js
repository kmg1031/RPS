/**
 * RESTful Achievements API Routes (v1)
 * Resource: /api/v1/achievements
 */
const express = require('express');
const { catchAsync } = require('../../middlewares/errorHandler');

module.exports = (achievementController, authenticateToken) => {
    const router = express.Router();

    /**
     * GET /api/v1/achievements
     * 전체 업적 목록 조회
     */
    router.get('/',
        catchAsync((req, res) => achievementController.getAllAchievements(req, res))
    );

    /**
     * GET /api/v1/achievements/me
     * 현재 사용자의 업적 목록
     */
    router.get('/me',
        authenticateToken,
        catchAsync((req, res) => achievementController.getUserAchievements(req, res))
    );

    /**
     * GET /api/v1/achievements/me/stats
     * 현재 사용자의 업적 통계
     */
    router.get('/me/stats',
        authenticateToken,
        catchAsync((req, res) => achievementController.getStats(req, res))
    );

    return router;
};
