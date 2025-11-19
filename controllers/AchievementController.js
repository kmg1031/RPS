/**
 * AchievementController - 업적 컨트롤러
 * HTTP 요청/응답 처리 및 AchievementService 호출
 */
class AchievementController {
    constructor(achievementService) {
        this.achievementService = achievementService;
    }

    /**
     * 사용자 업적 목록 조회
     */
    async getUserAchievements(req, res) {
        try {
            const userId = req.user.id;

            const achievements = await this.achievementService.getUserAchievements(userId);

            res.json({
                success: true,
                achievements
            });

        } catch (error) {
            console.error('업적 조회 오류:', error);

            res.status(500).json({
                success: false,
                message: '업적을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 사용자 업적 통계 조회
     */
    async getUserStats(req, res) {
        try {
            const userId = req.user.id;

            const stats = await this.achievementService.getUserStats(userId);

            res.json({
                success: true,
                stats
            });

        } catch (error) {
            console.error('업적 통계 조회 오류:', error);

            res.status(500).json({
                success: false,
                message: '업적 통계를 가져오는 중 오류가 발생했습니다.'
            });
        }
    }

    /**
     * 모든 업적 목록 조회
     */
    async getAllAchievements(req, res) {
        try {
            const achievements = await this.achievementService.getAllAchievements();

            res.json({
                success: true,
                achievements
            });

        } catch (error) {
            console.error('전체 업적 조회 오류:', error);

            res.status(500).json({
                success: false,
                message: '업적 목록을 가져오는 중 오류가 발생했습니다.'
            });
        }
    }
}

module.exports = AchievementController;
