/**
 * PVEGameRepository - PVE 덱 모드 게임 데이터 액세스 계층
 * 게임 덱을 문자열로 압축 저장 (R=rock, P=paper, S=scissors)
 */
class PVEGameRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * 새 게임 저장
     */
    async create(userId, playerDeck, computerDeck, playerScore, computerScore, gameResult) {
        const [result] = await this.db.pool.query(
            `INSERT INTO pve_games (user_id, player_deck, computer_deck, player_score, computer_score, game_result)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, playerDeck, computerDeck, playerScore, computerScore, gameResult]
        );
        return { id: result.insertId };
    }

    /**
     * 게임 ID로 조회
     */
    async findById(gameId) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM pve_games WHERE id = ?',
            [gameId]
        );
        return rows[0];
    }

    /**
     * 사용자의 게임 히스토리 조회
     */
    async findUserHistory(userId, limit = 10) {
        const [games] = await this.db.pool.query(
            `SELECT * FROM pve_games
            WHERE user_id = ?
            ORDER BY played_at DESC
            LIMIT ?`,
            [userId, limit]
        );
        return games;
    }

    /**
     * 사용자 통계
     */
    async getUserStats(userId) {
        const [rows] = await this.db.pool.query(
            `SELECT
                COUNT(*) as total_games,
                SUM(CASE WHEN game_result = 'win' THEN 1 ELSE 0 END) as wins,
                SUM(CASE WHEN game_result = 'lose' THEN 1 ELSE 0 END) as losses,
                SUM(CASE WHEN game_result = 'draw' THEN 1 ELSE 0 END) as draws,
                SUM(player_score) as total_player_score,
                SUM(computer_score) as total_computer_score,
                AVG(player_score) as avg_player_score,
                AVG(computer_score) as avg_computer_score
            FROM pve_games
            WHERE user_id = ?`,
            [userId]
        );

        const row = rows[0];
        return {
            totalGames: row.total_games || 0,
            wins: row.wins || 0,
            losses: row.losses || 0,
            draws: row.draws || 0,
            winRate: row.total_games > 0 ? ((row.wins / row.total_games) * 100).toFixed(1) : 0,
            totalPlayerScore: row.total_player_score || 0,
            totalComputerScore: row.total_computer_score || 0,
            avgPlayerScore: row.avg_player_score ? row.avg_player_score.toFixed(1) : 0,
            avgComputerScore: row.avg_computer_score ? row.avg_computer_score.toFixed(1) : 0
        };
    }
}

module.exports = PVEGameRepository;
