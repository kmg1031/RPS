/**
 * UserRepository - 사용자 데이터 액세스 계층
 * 데이터베이스의 users 테이블에 대한 모든 CRUD 작업 담당
 */
class UserRepository {
    constructor(db) {
        this.db = db;
    }

    /**
     * 새 사용자 생성
     */
    async create(username, email, passwordHash) {
        const [result] = await this.db.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return { id: result.insertId, username, email };
    }

    /**
     * 사용자명으로 사용자 조회
     */
    async findByUsername(username) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    /**
     * 이메일로 사용자 조회
     */
    async findByEmail(email) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    }

    /**
     * ID로 사용자 조회
     */
    async findById(id) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    /**
     * 마지막 로그인 시간 업데이트
     */
    async updateLastLogin(userId) {
        const [result] = await this.db.pool.query(
            'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [userId]
        );
        return result.affectedRows;
    }

    /**
     * 사용자 포인트 증가
     */
    async incrementPoints(userId, points) {
        const [result] = await this.db.pool.query(
            'UPDATE users SET total_points = total_points + ? WHERE id = ?',
            [points, userId]
        );
        return result.affectedRows;
    }

    /**
     * 사용자 포인트 조회
     */
    async getPoints(userId) {
        const [rows] = await this.db.pool.query(
            'SELECT total_points FROM users WHERE id = ?',
            [userId]
        );
        return rows[0] ? rows[0].total_points : 0;
    }

    /**
     * 사용자 포인트 설정
     */
    async setPoints(userId, totalPoints) {
        const [result] = await this.db.pool.query(
            'UPDATE users SET total_points = ? WHERE id = ?',
            [totalPoints, userId]
        );
        return result.affectedRows;
    }
}

module.exports = UserRepository;
