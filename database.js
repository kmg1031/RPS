const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'game.db');

class Database {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('데이터베이스 연결 실패:', err.message);
                    reject(err);
                } else {
                    console.log('SQLite 데이터베이스에 연결되었습니다.');
                    this.createTables().then(resolve).catch(reject);
                }
            });
        });
    }

    async createTables() {
        return new Promise((resolve, reject) => {
            const createUsersTable = `
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `;

            const createGameHistoryTable = `
                CREATE TABLE IF NOT EXISTS game_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    player_choice TEXT NOT NULL,
                    computer_choice TEXT NOT NULL,
                    result TEXT NOT NULL,
                    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `;

            this.db.serialize(() => {
                this.db.run(createUsersTable, (err) => {
                    if (err) {
                        console.error('users 테이블 생성 실패:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('users 테이블이 생성되었습니다.');
                });

                this.db.run(createGameHistoryTable, (err) => {
                    if (err) {
                        console.error('game_history 테이블 생성 실패:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('game_history 테이블이 생성되었습니다.');
                    resolve();
                });
            });
        });
    }

    async createUser(username, email, passwordHash) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)`;
            this.db.run(sql, [username, email, passwordHash], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, username, email });
                }
            });
        });
    }

    async getUserByUsername(username) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE username = ?`;
            this.db.get(sql, [username], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserByEmail(email) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE email = ?`;
            this.db.get(sql, [email], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getUserById(id) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM users WHERE id = ?`;
            this.db.get(sql, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async updateLastLogin(userId) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
            this.db.run(sql, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    async saveGameHistory(userId, playerChoice, computerChoice, result) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO game_history (user_id, player_choice, computer_choice, result) 
                        VALUES (?, ?, ?, ?)`;
            this.db.run(sql, [userId, playerChoice, computerChoice, result], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ 
                        id: this.lastID, 
                        userId, 
                        playerChoice, 
                        computerChoice, 
                        result 
                    });
                }
            });
        });
    }

    async getUserGameHistory(userId, limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM game_history WHERE user_id = ? 
                        ORDER BY played_at DESC LIMIT ?`;
            this.db.all(sql, [userId, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    async getUserStats(userId) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    COUNT(*) as total_games,
                    SUM(CASE WHEN result = 'win' THEN 1 ELSE 0 END) as wins,
                    SUM(CASE WHEN result = 'lose' THEN 1 ELSE 0 END) as losses,
                    SUM(CASE WHEN result = 'draw' THEN 1 ELSE 0 END) as draws
                FROM game_history 
                WHERE user_id = ?
            `;
            this.db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const stats = {
                        totalGames: row.total_games,
                        wins: row.wins,
                        losses: row.losses,
                        draws: row.draws,
                        winRate: row.total_games > 0 ? (row.wins / row.total_games * 100).toFixed(1) : 0
                    };
                    resolve(stats);
                }
            });
        });
    }

    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('데이터베이스 닫기 실패:', err.message);
                } else {
                    console.log('데이터베이스 연결이 닫혔습니다.');
                }
            });
        }
    }
}

module.exports = Database;