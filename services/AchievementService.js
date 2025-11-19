/**
 * AchievementService - 업적 비즈니스 로직 계층
 * AchievementManager를 감싸는 서비스 레이어
 */
class AchievementService {
    constructor(achievementRepository) {
        this.achievementRepository = achievementRepository;
    }

    /**
     * 사용자 업적 목록 조회
     */
    async getUserAchievements(userId) {
        return await this.achievementRepository.findUserAchievements(userId);
    }

    /**
     * 사용자 업적 통계 조회
     */
    async getUserStats(userId) {
        return await this.achievementRepository.getUserAchievementStats(userId);
    }

    /**
     * 모든 활성 업적 조회
     */
    async getAllAchievements() {
        return await this.achievementRepository.findAllActive();
    }
}

module.exports = AchievementService;
