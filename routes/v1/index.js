/**
 * API v1 라우터 통합
 */
const express = require('express');

module.exports = (controllers, authenticateToken) => {
    const router = express.Router();

    // 각 리소스별 라우터
    const gamesRoutes = require('./games.routes');
    const usersRoutes = require('./users.routes');
    const authRoutes = require('./auth.routes');
    const achievementsRoutes = require('./achievements.routes');

    // 라우터 등록
    router.use('/games', gamesRoutes(
        controllers.pveGame,
        controllers.streakGame,
        authenticateToken
    ));

    router.use('/users', usersRoutes(
        controllers.auth,
        controllers.pveGame,
        controllers.streakGame,
        authenticateToken
    ));

    router.use('/auth', authRoutes(controllers.auth));

    router.use('/achievements', achievementsRoutes(
        controllers.achievement,
        authenticateToken
    ));

    return router;
};
