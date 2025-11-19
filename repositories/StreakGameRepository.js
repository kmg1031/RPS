/**
 * StreakGameRepository - 연승제 게임 데이터 액세스 계층
 * 게임 패를 문자열로 압축 저장 (R=rock, P=paper, S=scissors)
 */
class StreakGameRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * 새로운 연승제 게임 시작
     */
    async create(userId, computerChoicesString, allowTie = false, shufflePositions = false) {
        const [result] = await this.db.pool.query(
            `INSERT INTO streak_games (user_id, computer_choices, player_choices, allow_tie, shuffle_positions, game_status)
            VALUES (?, ?, '', ?, ?, 'in_progress')`,
            [userId, computerChoicesString, allowTie, shufflePositions]
        );
        return { id: result.insertId };
    }

    /**
     * 진행 중인 연승제 게임 조회
     */
    async findInProgressGame(userId) {
        const [rows] = await this.db.pool.query(
            `SELECT * FROM streak_games
            WHERE user_id = ? AND game_status = 'in_progress'
            ORDER BY started_at DESC
            LIMIT 1`,
            [userId]
        );
        return rows[0];
    }

    /**
     * 연승제 게임 조회
     */
    async findById(gameId) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM streak_games WHERE id = ?',
            [gameId]
        );
        return rows[0];
    }

    /**
     * 플레이어 선택 추가 및 게임 상태 업데이트
     */
    async addPlayerChoice(gameId, playerChoice, currentStreak, maxStreak, totalPoints) {
        const [result] = await this.db.pool.query(
            `UPDATE streak_games
            SET player_choices = CONCAT(player_choices, ?),
                current_round = current_round + 1,
                current_streak = ?,
                max_streak = ?,
                total_points = ?
            WHERE id = ?`,
            [playerChoice, currentStreak, maxStreak, totalPoints, gameId]
        );
        return result.affectedRows;
    }

    /**
     * 연승 게임 상태 업데이트
     */
    async updateGameProgress(gameId, currentStreak, maxStreak, totalPoints) {
        const [result] = await this.db.pool.query(
            `UPDATE streak_games
            SET current_streak = ?, max_streak = ?, total_points = ?
            WHERE id = ?`,
            [currentStreak, maxStreak, totalPoints, gameId]
        );
        return result.affectedRows;
    }

    /**
     * 게임 완료 처리
     */
    async completeGame(gameId, status = 'completed') {
        const [result] = await this.db.pool.query(
            `UPDATE streak_games
            SET game_status = ?, completed_at = CURRENT_TIMESTAMP
            WHERE id = ?`,
            [status, gameId]
        );
        return result.affectedRows;
    }

    /**
     * 게임 실패 처리
     */
    async failGame(gameId) {
        return await this.completeGame(gameId, 'failed');
    }

    /**
     * 사용자의 연승제 게임 히스토리 조회
     */
    async findUserHistory(userId, limit = 10) {
        const [games] = await this.db.pool.query(
            `SELECT * FROM streak_games
            WHERE user_id = ? AND game_status != 'in_progress'
            ORDER BY started_at DESC
            LIMIT ?`,
            [userId, limit]
        );
        return games;
    }

    /**
     * 게임의 상세 기록 조회 (문자열 기반)
     */
    async findGameDetails(gameId) {
        const [rows] = await this.db.pool.query(
            'SELECT computer_choices, player_choices, current_round FROM streak_games WHERE id = ?',
            [gameId]
        );
        return rows[0];
    }

    /**
     * 사용자의 연승제 게임 통계
     */
    async getUserStats(userId) {
        const [rows] = await this.db.pool.query(
            `SELECT
                COUNT(*) as total_games,
                SUM(CASE WHEN game_status = 'completed' THEN 1 ELSE 0 END) as completed_games,
                SUM(CASE WHEN game_status = 'failed' THEN 1 ELSE 0 END) as failed_games,
                MAX(max_streak) as best_streak,
                AVG(max_streak) as avg_streak,
                SUM(total_points) as total_points_earned
            FROM streak_games
            WHERE user_id = ? AND game_status != 'in_progress'`,
            [userId]
        );

        return rows[0] || {
            total_games: 0,
            completed_games: 0,
            failed_games: 0,
            best_streak: 0,
            avg_streak: 0,
            total_points_earned: 0
        };
    }
}

module.exports = StreakGameRepository;
