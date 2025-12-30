/**
 * RESTful Achievement Controller (v1)
 * 리소스: Achievements
 */
const { successResponse } = require('../../utils/response');

class AchievementController {
    constructor(achievementService) {
        this.achievementService = achievementService;
    }

    /**
     * GET /api/v1/achievements
     * 전체 업적 목록 조회
     */
    async getAllAchievements(req, res) {
        const achievements = await this.achievementService.getAllAchievements();

        return successResponse(res, {
            achievements,
            total: achievements.length
        });
    }

    /**
     * GET /api/v1/achievements/me
     * 현재 사용자의 업적 목록
     */
    async getUserAchievements(req, res) {
        const userId = req.user.id;
        const achievements = await this.achievementService.getUserAchievements(userId);

        return successResponse(res, {
            achievements,
            total: achievements.length
        });
    }

    /**
     * GET /api/v1/achievements/me/stats
     * 현재 사용자의 업적 통계
     */
    async getStats(req, res) {
        const userId = req.user.id;
        const stats = await this.achievementService.getAchievementStats(userId);

        return successResponse(res, stats);
    }
}

module.exports = AchievementController;
