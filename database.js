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
                    total_points INTEGER NOT NULL DEFAULT 0,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    last_login DATETIME
                )
            `;

            const createRoundHistoryTable = `
                CREATE TABLE IF NOT EXISTS round_history (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    player_score INTEGER NOT NULL DEFAULT 0,
                    computer_score INTEGER NOT NULL DEFAULT 0,
                    current_win_stack INTEGER NOT NULL DEFAULT 0,
                    current_lose_stack INTEGER NOT NULL DEFAULT 0,
                    current_choice TEXT,
                    round_result TEXT NOT NULL DEFAULT 'in_progress' CHECK(round_result IN ('win', 'lose', 'draw', 'in_progress')),
                    games_played INTEGER NOT NULL DEFAULT 0,
                    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            `;

            const createGameDetailsTable = `
                CREATE TABLE IF NOT EXISTS game_details (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    round_id INTEGER,
                    game_number INTEGER NOT NULL,
                    player_choice TEXT NOT NULL,
                    computer_choice TEXT NOT NULL,
                    result TEXT NOT NULL CHECK(result IN ('win', 'lose', 'draw')),
                    points_earned INTEGER NOT NULL DEFAULT 0,
                    win_stack_count INTEGER NOT NULL DEFAULT 0,
                    lose_stack_count INTEGER NOT NULL DEFAULT 0,
                    stack_broken BOOLEAN NOT NULL DEFAULT 0,
                    played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (round_id) REFERENCES round_history (id)
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

                this.db.run(createRoundHistoryTable, (err) => {
                    if (err) {
                        console.error('round_history 테이블 생성 실패:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('round_history 테이블이 생성되었습니다.');
                });

                this.db.run(createGameDetailsTable, (err) => {
                    if (err) {
                        console.error('game_details 테이블 생성 실패:', err.message);
                        reject(err);
                        return;
                    }
                    console.log('game_details 테이블이 생성되었습니다.');
                    
                    // 기존 users 테이블에 total_points 컬럼이 없는 경우 추가
                    this.addTotalPointsColumn().then(() => {
                        resolve();
                    }).catch(reject);
                });
            });
        });
    }

    async addTotalPointsColumn() {
        return new Promise((resolve, reject) => {
            // 먼저 컬럼이 존재하는지 확인
            this.db.all("PRAGMA table_info(users)", (err, rows) => {
                if (err) {
                    console.error('테이블 정보 조회 실패:', err.message);
                    reject(err);
                    return;
                }

                const hasPointsColumn = rows.some(row => row.name === 'total_points');
                
                if (!hasPointsColumn) {
                    // total_points 컬럼 추가
                    this.db.run("ALTER TABLE users ADD COLUMN total_points INTEGER NOT NULL DEFAULT 0", (err) => {
                        if (err) {
                            console.error('total_points 컬럼 추가 실패:', err.message);
                            reject(err);
                        } else {
                            console.log('users 테이블에 total_points 컬럼을 추가했습니다.');
                            resolve();
                        }
                    });
                } else {
                    console.log('total_points 컬럼이 이미 존재합니다.');
                    resolve();
                }
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

    async updateUserPoints(userId, points) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET total_points = total_points + ? WHERE id = ?`;
            this.db.run(sql, [points, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    async getUserPoints(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT total_points FROM users WHERE id = ?`;
            this.db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.total_points : 0);
                }
            });
        });
    }

    async setUserPoints(userId, totalPoints) {
        return new Promise((resolve, reject) => {
            const sql = `UPDATE users SET total_points = ? WHERE id = ?`;
            this.db.run(sql, [totalPoints, userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    async startNewRound(userId) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO round_history (user_id, player_score, computer_score, current_win_stack, current_lose_stack, current_choice, round_result, games_played) 
                        VALUES (?, 0, 0, 0, 0, NULL, 'in_progress', 0)`;
            this.db.run(sql, [userId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async saveGameInRound(roundId, gameNumber, playerChoice, computerChoice, result, pointsEarned, winStackCount, loseStackCount, stackBroken) {
        return new Promise((resolve, reject) => {
            const sql = `INSERT INTO game_details (round_id, game_number, player_choice, computer_choice, result, points_earned, win_stack_count, lose_stack_count, stack_broken) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            this.db.run(sql, [roundId, gameNumber, playerChoice, computerChoice, result, pointsEarned, winStackCount, loseStackCount, stackBroken], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    async updateRoundProgress(roundId, playerScore, computerScore, currentWinStack, currentLoseStack, currentChoice, gamesPlayed) {
        return new Promise((resolve, reject) => {
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

            const sql = `UPDATE round_history 
                        SET player_score = ?, computer_score = ?, current_win_stack = ?, current_lose_stack = ?, current_choice = ?, games_played = ?, round_result = ?
                        WHERE id = ?`;
            this.db.run(sql, [playerScore, computerScore, currentWinStack, currentLoseStack, currentChoice, gamesPlayed, roundResult, roundId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ roundResult, gamesPlayed, playerScore, computerScore, currentWinStack, currentLoseStack });
                }
            });
        });
    }

    async getUserRoundHistory(userId, limit = 10) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM round_history WHERE user_id = ? 
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

    async getCurrentRound(userId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM round_history WHERE user_id = ? AND round_result = 'in_progress' 
                        ORDER BY played_at DESC LIMIT 1`;
            this.db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    async getRoundGames(roundId) {
        return new Promise((resolve, reject) => {
            const sql = `SELECT * FROM game_details WHERE round_id = ? ORDER BY game_number`;
            this.db.all(sql, [roundId], (err, rows) => {
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
                    COUNT(*) as total_rounds,
                    SUM(CASE WHEN round_result = 'win' THEN 1 ELSE 0 END) as round_wins,
                    SUM(CASE WHEN round_result = 'lose' THEN 1 ELSE 0 END) as round_losses,
                    SUM(CASE WHEN round_result = 'draw' THEN 1 ELSE 0 END) as round_draws,
                    SUM(player_score) as total_player_points,
                    SUM(computer_score) as total_computer_points,
                    SUM(games_played) as total_games_played,
                    AVG(player_score) as avg_player_score
                FROM round_history 
                WHERE user_id = ? AND round_result != 'in_progress'
            `;
            this.db.get(sql, [userId], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const stats = {
                        totalRounds: row.total_rounds,
                        roundWins: row.round_wins,
                        roundLosses: row.round_losses,
                        roundDraws: row.round_draws,
                        roundWinRate: row.total_rounds > 0 ? (row.round_wins / row.total_rounds * 100).toFixed(1) : 0,
                        totalGamesPlayed: row.total_games_played,
                        totalPlayerPoints: row.total_player_points,
                        totalComputerPoints: row.total_computer_points,
                        averagePlayerScore: row.avg_player_score ? row.avg_player_score.toFixed(1) : 0,
                        totalPointsDifference: (row.total_player_points || 0) - (row.total_computer_points || 0)
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