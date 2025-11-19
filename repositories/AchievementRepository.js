/**
 * AchievementRepository - 업적 데이터 액세스 계층
 * 데이터베이스의 achievements, user_achievements, achievement_logs 테이블 담당
 */
class AchievementRepository {
    constructor(db) {
        this.db = db;
    }

    // ==================== Achievement 메서드 ====================

    /**
     * 업적 생성
     */
    async createAchievement(achievementData) {
        const [result] = await this.db.pool.query(
            `INSERT INTO achievements (achievement_key, name, description, category, icon, target_value, reward_points, difficulty, is_hidden)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                achievementData.key,
                achievementData.name,
                achievementData.description,
                achievementData.category,
                achievementData.icon,
                achievementData.target_value,
                achievementData.reward_points,
                achievementData.difficulty,
                achievementData.is_hidden || false
            ]
        );
        return { id: result.insertId, ...achievementData };
    }

    /**
     * Key로 업적 조회
     */
    async findByKey(key) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM achievements WHERE achievement_key = ?',
            [key]
        );
        return rows[0];
    }

    /**
     * 모든 활성 업적 조회
     */
    async findAllActive() {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM achievements WHERE is_active = TRUE ORDER BY difficulty, category, target_value'
        );
        return rows;
    }

    // ==================== User Achievement 메서드 ====================

    /**
     * 사용자 업적 진행도 조회
     */
    async findUserProgress(userId, achievementId) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
            [userId, achievementId]
        );
        return rows[0] || { current_value: 0, is_completed: false };
    }

    /**
     * 업적 진행도 업데이트
     */
    async updateProgress(userId, achievementId, newValue) {
        const [result] = await this.db.pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id, current_value, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE current_value = ?, updated_at = CURRENT_TIMESTAMP`,
            [userId, achievementId, newValue, newValue]
        );
        return result.affectedRows;
    }

    /**
     * 업적 완료 처리
     */
    async completeAchievement(userId, achievementId) {
        const [result] = await this.db.pool.query(
            `UPDATE user_achievements
            SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND achievement_id = ?`,
            [userId, achievementId]
        );
        return result.affectedRows;
    }

    /**
     * 사용자의 모든 업적 조회 (진행도 포함)
     */
    async findUserAchievements(userId) {
        const [rows] = await this.db.pool.query(
            `SELECT
                a.*,
                ua.current_value,
                ua.is_completed,
                ua.completed_at,
                ua.notified
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE a.is_active = TRUE AND (a.is_hidden = FALSE OR ua.id IS NOT NULL)
            ORDER BY ua.is_completed ASC, a.difficulty, a.target_value`,
            [userId]
        );

        return rows.map(row => ({
            ...row,
            current_value: row.current_value || 0,
            is_completed: Boolean(row.is_completed),
            progress_percentage: Math.min(100, Math.round((row.current_value || 0) / row.target_value * 100))
        }));
    }

    /**
     * 사용자 업적 통계 조회
     */
    async getUserAchievementStats(userId) {
        const [rows] = await this.db.pool.query(
            `SELECT
                COUNT(*) as total_achievements,
                SUM(CASE WHEN ua.is_completed = TRUE THEN 1 ELSE 0 END) as completed_count,
                SUM(CASE WHEN ua.is_completed = TRUE THEN a.reward_points ELSE 0 END) as total_points_earned,
                COUNT(CASE WHEN a.difficulty = 'easy' AND ua.is_completed = TRUE THEN 1 END) as easy_completed,
                COUNT(CASE WHEN a.difficulty = 'normal' AND ua.is_completed = TRUE THEN 1 END) as normal_completed,
                COUNT(CASE WHEN a.difficulty = 'hard' AND ua.is_completed = TRUE THEN 1 END) as hard_completed,
                COUNT(CASE WHEN a.difficulty = 'legendary' AND ua.is_completed = TRUE THEN 1 END) as legendary_completed
            FROM achievements a
            LEFT JOIN user_achievements ua ON a.id = ua.achievement_id AND ua.user_id = ?
            WHERE a.is_active = TRUE`,
            [userId]
        );

        const row = rows[0];
        return {
            ...row,
            completion_rate: row.total_achievements > 0 ?
                Math.round((row.completed_count / row.total_achievements) * 100) : 0
        };
    }

    // ==================== Achievement Log 메서드 ====================

    /**
     * 업적 진행 로그 기록
     */
    async logProgress(userId, achievementId, actionType, oldValue, newValue, gameContext = null) {
        const [result] = await this.db.pool.query(
            `INSERT INTO achievement_logs (user_id, achievement_id, action_type, old_value, new_value, game_context)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, achievementId, actionType, oldValue, newValue, JSON.stringify(gameContext)]
        );
        return { id: result.insertId };
    }
}

module.exports = AchievementRepository;
