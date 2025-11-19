const mysql = require('mysql2/promise');
const dbConfig = require('./config/database.config');

// Singleton instance
let instance = null;

class Database {
    constructor() {
        if (instance) {
            return instance;
        }
        this.pool = null;
        instance = this;
    }

    static getInstance() {
        if (!instance) {
            instance = new Database();
        }
        return instance;
    }

    async init() {
        // 이미 초기화된 경우 재사용
        if (this.pool) {
            console.log('✅ 데이터베이스 이미 연결되어 있습니다.');
            return true;
        }

        try {
            this.pool = mysql.createPool(dbConfig);

            // 연결 테스트
            const connection = await this.pool.getConnection();
            console.log(`✅ MySQL 데이터베이스에 연결되었습니다. (환경: ${dbConfig.environment})`);
            connection.release();

            await this.createTables();
            return true;
        } catch (err) {
            console.error('❌ 데이터베이스 연결 실패:', err.message);
            throw err;
        }
    }

    async createTables() {
        const connection = await this.pool.getConnection();

        try {
            // users 테이블
            await connection.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    total_points INT NOT NULL DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    last_login TIMESTAMP NULL,
                    INDEX idx_username (username),
                    INDEX idx_email (email)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('users 테이블이 생성되었습니다.');

            // PVE 덱 모드 게임 테이블 (문자열 압축 저장)
            await connection.query(`
                CREATE TABLE IF NOT EXISTS pve_games (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT,
                    player_deck VARCHAR(10) NOT NULL COMMENT '플레이어 덱 10자 (R=rock, P=paper, S=scissors)',
                    computer_deck VARCHAR(10) NOT NULL COMMENT '컴퓨터 덱 10자',
                    player_score INT NOT NULL DEFAULT 0 COMMENT '플레이어 점수 (승리당 1점)',
                    computer_score INT NOT NULL DEFAULT 0 COMMENT '컴퓨터 점수',
                    game_result ENUM('win', 'lose', 'draw') NOT NULL COMMENT '게임 결과',
                    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_game_result (game_result),
                    INDEX idx_played_at (played_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('pve_games 테이블이 생성되었습니다.');

            // 연승제 게임 모드 테이블
            await connection.query(`
                CREATE TABLE IF NOT EXISTS streak_games (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    user_id INT,
                    computer_choices VARCHAR(100) NOT NULL COMMENT '100개의 컴퓨터 선택 (R=rock, P=paper, S=scissors)',
                    player_choices VARCHAR(100) NOT NULL DEFAULT '' COMMENT '플레이어가 선택한 패들',
                    current_round INT NOT NULL DEFAULT 0 COMMENT '현재 라운드 (0-99)',
                    current_streak INT NOT NULL DEFAULT 0,
                    max_streak INT NOT NULL DEFAULT 0,
                    total_points INT NOT NULL DEFAULT 0,
                    game_status ENUM('in_progress', 'completed', 'failed') NOT NULL DEFAULT 'in_progress',
                    allow_tie BOOLEAN NOT NULL DEFAULT FALSE,
                    shuffle_positions BOOLEAN NOT NULL DEFAULT FALSE,
                    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    completed_at TIMESTAMP NULL,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    INDEX idx_user_id (user_id),
                    INDEX idx_game_status (game_status),
                    INDEX idx_started_at (started_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('streak_games 테이블이 생성되었습니다.');

            // 연승제 게임 상세 기록
            await connection.query(`
                CREATE TABLE IF NOT EXISTS streak_game_details (
                    id INT PRIMARY KEY AUTO_INCREMENT,
                    streak_game_id INT NOT NULL,
                    game_number INT NOT NULL,
                    computer_choice VARCHAR(20) NOT NULL,
                    player_choice VARCHAR(20) NOT NULL,
                    result ENUM('win', 'lose', 'tie') NOT NULL,
                    time_taken INT NOT NULL COMMENT '소요 시간(초)',
                    points_earned INT NOT NULL DEFAULT 0,
                    streak_at_time INT NOT NULL DEFAULT 0 COMMENT '해당 게임 시점의 연승 횟수',
                    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (streak_game_id) REFERENCES streak_games(id) ON DELETE CASCADE,
                    INDEX idx_streak_game_id (streak_game_id),
                    INDEX idx_played_at (played_at)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            `);
            console.log('streak_game_details 테이블이 생성되었습니다.');

            // 업적 시스템 테이블 생성
            await this.createAchievementTables(connection);

        } catch (err) {
            console.error('테이블 생성 실패:', err.message);
            throw err;
        } finally {
            connection.release();
        }
    }

    async createAchievementTables(connection) {
        // achievements 테이블
        await connection.query(`
            CREATE TABLE IF NOT EXISTS achievements (
                id INT PRIMARY KEY AUTO_INCREMENT,
                achievement_key VARCHAR(100) UNIQUE NOT NULL,
                name VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                category VARCHAR(50) NOT NULL,
                icon VARCHAR(50),
                target_value INT NOT NULL DEFAULT 1,
                reward_points INT NOT NULL DEFAULT 0,
                difficulty ENUM('easy', 'normal', 'hard', 'legendary') DEFAULT 'normal',
                is_hidden BOOLEAN DEFAULT FALSE,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_category (category),
                INDEX idx_difficulty (difficulty)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('achievements 테이블이 생성되었습니다.');

        // user_achievements 테이블
        await connection.query(`
            CREATE TABLE IF NOT EXISTS user_achievements (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                achievement_id INT NOT NULL,
                current_value INT DEFAULT 0,
                is_completed BOOLEAN DEFAULT FALSE,
                completed_at TIMESTAMP NULL,
                notified BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
                UNIQUE KEY unique_user_achievement (user_id, achievement_id),
                INDEX idx_user_id (user_id),
                INDEX idx_completed (is_completed)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('user_achievements 테이블이 생성되었습니다.');

        // achievement_logs 테이블
        await connection.query(`
            CREATE TABLE IF NOT EXISTS achievement_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT NOT NULL,
                achievement_id INT NOT NULL,
                action_type ENUM('progress', 'complete') NOT NULL,
                old_value INT DEFAULT 0,
                new_value INT DEFAULT 0,
                game_context TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_action_type (action_type)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        `);
        console.log('achievement_logs 테이블이 생성되었습니다.');
    }

    async createUser(username, email, passwordHash) {
        const [result] = await this.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return { id: result.insertId, username, email };
    }

    async getUserByUsername(username) {
        const [rows] = await this.pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    async getUserByEmail(email) {
        const [rows] = await this.pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    async getUserById(id) {
        const [rows] = await this.pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    async updateLastLogin(userId) {
        const [result] = await this.pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
        return result.affectedRows;
    }

    async updateUserPoints(userId, points) {
        const [result] = await this.pool.query(
            'UPDATE users SET total_points = total_points + ? WHERE id = ?',
            [points, userId]
        );
        return result.affectedRows;
    }

    async getUserPoints(userId) {
        const [rows] = await this.pool.query(
            'SELECT total_points FROM users WHERE id = ?',
            [userId]
        );
        return rows[0] ? rows[0].total_points : 0;
    }

    async setUserPoints(userId, totalPoints) {
        const [result] = await this.pool.query(
            'UPDATE users SET total_points = ? WHERE id = ?',
            [totalPoints, userId]
        );
        return result.affectedRows;
    }

    async startNewRound(userId) {
        const [result] = await this.pool.query(
            `INSERT INTO round_history (user_id, player_score, computer_score, current_win_stack, current_lose_stack, current_choice, round_result, games_played)
            VALUES (?, 0, 0, 0, 0, NULL, 'in_progress', 0)`,
            [userId]
        );
        return { id: result.insertId };
    }

    async saveGameInRound(roundId, gameNumber, playerChoice, computerChoice, result, pointsEarned, winStackCount, loseStackCount, stackBroken) {
        const [insertResult] = await this.pool.query(
            `INSERT INTO game_details (round_id, game_number, player_choice, computer_choice, result, points_earned, win_stack_count, lose_stack_count, stack_broken)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [roundId, gameNumber, playerChoice, computerChoice, result, pointsEarned, winStackCount, loseStackCount, stackBroken]
        );
        return { id: insertResult.insertId };
    }

    async updateRoundProgress(roundId, playerScore, computerScore, currentWinStack, currentLoseStack, currentChoice, gamesPlayed) {
        let roundResult = 'in_progress';
        if (gamesPlayed === 10) {
            if (playerScore > computerScore) {
                roundResult = 'win';
            } else if (computerScore > playerScore) {
                roundResult = 'lose';
            } else {
                roundResult = 'draw';
            }
        }

        const [result] = await this.pool.query(
            `UPDATE round_history
            SET player_score = ?, computer_score = ?, current_win_stack = ?, current_lose_stack = ?, current_choice = ?, games_played = ?, round_result = ?
            WHERE id = ?`,
            [playerScore, computerScore, currentWinStack, currentLoseStack, currentChoice, gamesPlayed, roundResult, roundId]
        );

        return { roundResult, gamesPlayed, playerScore, computerScore, currentWinStack, currentLoseStack };
    }

    async getUserRoundHistory(userId, limit = 10) {
        const [rounds] = await this.pool.query(
            `SELECT * FROM round_history
            WHERE user_id = ?
            ORDER BY played_at DESC
            LIMIT ?`,
            [userId, limit]
        );

        // 각 라운드의 게임 상세 정보 가져오기
        for (let round of rounds) {
            const [games] = await this.pool.query(
                `SELECT game_number, player_choice, computer_choice, result, points_earned,
                win_stack_count, lose_stack_count, stack_broken, played_at
                FROM game_details
                WHERE round_id = ?
                ORDER BY game_number`,
                [round.id]
            );
            round.games = games;
        }

        return rounds;
    }

    async getCurrentRound(userId) {
        const [rows] = await this.pool.query(
            `SELECT * FROM round_history
            WHERE user_id = ? AND round_result = 'in_progress'
            ORDER BY played_at DESC
            LIMIT 1`,
            [userId]
        );
        return rows[0];
    }

    async getRoundGames(roundId) {
        const [rows] = await this.pool.query(
            'SELECT * FROM game_details WHERE round_id = ? ORDER BY game_number',
            [roundId]
        );
        return rows;
    }

    async getUserStats(userId) {
        const [rows] = await this.pool.query(
            `SELECT
                COUNT(*) as total_rounds,
                SUM(CASE WHEN round_result = 'win' THEN 1 ELSE 0 END) as round_wins,
                SUM(CASE WHEN round_result = 'lose' THEN 1 ELSE 0 END) as round_losses,
                SUM(CASE WHEN round_result = 'draw' THEN 1 ELSE 0 END) as round_draws,
                SUM(player_score) as total_player_points,
                SUM(computer_score) as total_computer_points,
                SUM(games_played) as total_games_played,
                AVG(player_score) as avg_player_score
            FROM round_history
            WHERE user_id = ? AND round_result != 'in_progress'`,
            [userId]
        );

        const row = rows[0];
        return {
            totalRounds: row.total_rounds,
            roundWins: row.round_wins,
            roundLosses: row.round_losses,
            roundDraws: row.round_draws,
            roundWinRate: row.total_rounds > 0 ? (row.round_wins / row.total_rounds * 100).toFixed(1) : 0,
            totalGamesPlayed: row.total_games_played,
            totalPlayerPoints: row.total_player_points || 0,
            totalComputerPoints: row.total_computer_points || 0,
            averagePlayerScore: row.avg_player_score ? row.avg_player_score.toFixed(1) : 0,
            totalPointsDifference: (row.total_player_points || 0) - (row.total_computer_points || 0)
        };
    }

    // ==================== 업적 시스템 메서드 ====================

    async createAchievement(achievementData) {
        const [result] = await this.pool.query(
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

    async getAchievementByKey(key) {
        const [rows] = await this.pool.query(
            'SELECT * FROM achievements WHERE achievement_key = ?',
            [key]
        );
        return rows[0];
    }

    async getAllAchievements() {
        const [rows] = await this.pool.query(
            'SELECT * FROM achievements WHERE is_active = TRUE ORDER BY difficulty, category, target_value'
        );
        return rows;
    }

    async getUserProgress(userId, achievementId) {
        const [rows] = await this.pool.query(
            'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
            [userId, achievementId]
        );
        return rows[0] || { current_value: 0, is_completed: false };
    }

    async updateAchievementProgress(userId, achievementId, newValue) {
        const [result] = await this.pool.query(
            `INSERT INTO user_achievements (user_id, achievement_id, current_value, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
            ON DUPLICATE KEY UPDATE current_value = ?, updated_at = CURRENT_TIMESTAMP`,
            [userId, achievementId, newValue, newValue]
        );
        return result.affectedRows;
    }

    async completeAchievement(userId, achievementId) {
        const [result] = await this.pool.query(
            `UPDATE user_achievements
            SET is_completed = TRUE, completed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ? AND achievement_id = ?`,
            [userId, achievementId]
        );
        return result.affectedRows;
    }

    async getUserAchievements(userId) {
        const [rows] = await this.pool.query(
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

    async getAchievementStats(userId) {
        const [rows] = await this.pool.query(
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

    async logAchievementProgress(userId, achievementId, actionType, oldValue, newValue, gameContext = null) {
        const [result] = await this.pool.query(
            `INSERT INTO achievement_logs (user_id, achievement_id, action_type, old_value, new_value, game_context)
            VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, achievementId, actionType, oldValue, newValue, JSON.stringify(gameContext)]
        );
        return { id: result.insertId };
    }

    async close() {
        if (this.pool) {
            await this.pool.end();
            console.log('데이터베이스 연결이 닫혔습니다.');
        }
    }
}

module.exports = Database;
