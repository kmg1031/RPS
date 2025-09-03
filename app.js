const express = require('express');
const path = require('path');
const Database = require('./database');
const { AuthService, authenticateToken, optionalAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const choices = ['rock', 'paper', 'scissors'];

function getComputerChoice() {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
}

function determineWinner(playerChoice, computerChoice) {
    if (playerChoice === computerChoice) {
        return 'draw';
    }
    
    const winConditions = {
        rock: 'scissors',
        paper: 'rock',
        scissors: 'paper'
    };
    
    return winConditions[playerChoice] === computerChoice ? 'win' : 'lose';
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 회원가입
app.post('/api/auth/register', 
    AuthService.validateRegister(),
    AuthService.checkValidation,
    async (req, res) => {
        try {
            const { username, email, password } = req.body;

            // 중복 체크
            const existingUser = await db.getUserByUsername(username);
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: '이미 존재하는 사용자명입니다.'
                });
            }

            const existingEmail = await db.getUserByEmail(email);
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: '이미 사용 중인 이메일입니다.'
                });
            }

            // 비밀번호 해싱 및 사용자 생성
            const passwordHash = await AuthService.hashPassword(password);
            const user = await db.createUser(username, email, passwordHash);

            // JWT 토큰 생성
            const token = AuthService.generateToken({
                id: user.id,
                username: user.username
            });

            res.status(201).json({
                success: true,
                message: '회원가입이 완료되었습니다.',
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });

        } catch (error) {
            console.error('회원가입 오류:', error);
            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    }
);

// 로그인
app.post('/api/auth/login',
    AuthService.validateLogin(),
    AuthService.checkValidation,
    async (req, res) => {
        try {
            const { username, password } = req.body;

            // 사용자 조회
            const user = await db.getUserByUsername(username);
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
                });
            }

            // 비밀번호 확인
            const isPasswordValid = await AuthService.comparePassword(password, user.password_hash);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: '사용자명 또는 비밀번호가 올바르지 않습니다.'
                });
            }

            // 마지막 로그인 시간 업데이트
            await db.updateLastLogin(user.id);

            // JWT 토큰 생성
            const token = AuthService.generateToken({
                id: user.id,
                username: user.username
            });

            res.json({
                success: true,
                message: '로그인에 성공했습니다.',
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            });

        } catch (error) {
            console.error('로그인 오류:', error);
            res.status(500).json({
                success: false,
                message: '로그인 처리 중 오류가 발생했습니다.'
            });
        }
    }
);

// 사용자 정보 조회
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: '사용자를 찾을 수 없습니다.'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                created_at: user.created_at,
                last_login: user.last_login
            }
        });
    } catch (error) {
        console.error('사용자 정보 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '사용자 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});

app.post('/api/play', optionalAuth, async (req, res) => {
    try {
        const { playerChoice } = req.body;
        
        if (!playerChoice || !choices.includes(playerChoice)) {
            return res.status(400).json({ 
                success: false,
                message: '유효하지 않은 선택입니다. rock, paper, scissors 중 선택하세요.' 
            });
        }
        
        const computerChoice = getComputerChoice();
        const result = determineWinner(playerChoice, computerChoice);
        
        // 로그인한 사용자의 경우 게임 기록 저장
        if (req.user) {
            await db.saveGameHistory(req.user.id, playerChoice, computerChoice, result);
        }
        
        res.json({
            success: true,
            playerChoice,
            computerChoice,
            result,
            timestamp: new Date().toISOString(),
            saved: !!req.user
        });

    } catch (error) {
        console.error('게임 플레이 오류:', error);
        res.status(500).json({
            success: false,
            message: '게임 처리 중 오류가 발생했습니다.'
        });
    }
});

// 사용자 게임 통계 조회
app.get('/api/stats', authenticateToken, async (req, res) => {
    try {
        const stats = await db.getUserStats(req.user.id);
        const history = await db.getUserGameHistory(req.user.id, 10);

        res.json({
            success: true,
            stats,
            recentGames: history
        });
    } catch (error) {
        console.error('통계 조회 오류:', error);
        res.status(500).json({
            success: false,
            message: '통계 정보를 가져오는 중 오류가 발생했습니다.'
        });
    }
});

// 서버 시작
async function startServer() {
    try {
        await db.init();
        console.log('✅ 데이터베이스 초기화 완료');
        
        app.listen(PORT, () => {
            console.log(`🎮 가위바위보 게임 서버가 http://localhost:${PORT} 에서 실행중입니다!`);
            console.log('🚀 브라우저에서 게임을 즐겨보세요!');
            console.log('🔐 인증 기능이 활성화되었습니다.');
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer();