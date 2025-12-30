// Load environment variables first
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const path = require('path');

// Middlewares
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

// Database
const Database = require('./database');

// Repositories
const UserRepository = require('./repositories/UserRepository');
const AchievementRepository = require('./repositories/AchievementRepository');
const StreakGameRepository = require('./repositories/StreakGameRepository');
const PVEGameRepository = require('./repositories/PVEGameRepository');

// Services
const UserService = require('./services/UserService');
const AchievementService = require('./services/AchievementService');
const StreakGameService = require('./services/StreakGameService');
const PVEGameService = require('./services/PVEGameService');

// Controllers (v1)
const AuthController = require('./controllers/v1/AuthController');
const AchievementController = require('./controllers/v1/AchievementController');
const StreakGameController = require('./controllers/v1/StreakGameController');
const PVEGameController = require('./controllers/v1/PVEGameController');

// Routes
const v1Routes = require('./routes/v1');

const app = express();
const PORT = process.env.PORT || 3000;

// Global Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 헤더 (필요시)
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Dependency Injection 및 라우터 설정
async function setupDependencies() {
    // Database (Singleton)
    const db = Database.getInstance();
    await db.init();
    console.log('✅ 데이터베이스 초기화 완료');

    // Repositories
    const userRepository = new UserRepository(db);
    const achievementRepository = new AchievementRepository(db);
    const streakGameRepository = new StreakGameRepository(db);
    const pveGameRepository = new PVEGameRepository(db);

    // Services
    const userService = new UserService(userRepository);
    const achievementService = new AchievementService(achievementRepository);
    const streakGameService = new StreakGameService(streakGameRepository, userRepository);
    const pveGameService = new PVEGameService(pveGameRepository, userRepository);

    // Controllers (v1)
    const authController = new AuthController(userService);
    const achievementController = new AchievementController(achievementService);
    const streakGameController = new StreakGameController(streakGameService);
    const pveGameController = new PVEGameController(pveGameService);

    // Middleware - authenticateToken
    const authenticateToken = userService.authenticateToken.bind(userService);

    // API v1 Routes
    app.use('/api/v1', v1Routes({
        auth: authController,
        achievement: achievementController,
        streakGame: streakGameController,
        pveGame: pveGameController
    }, authenticateToken));

    // 이전 버전과의 호환성을 위한 리다이렉트 (선택사항)
    app.use('/api/auth/*', (req, res) => {
        res.status(301).json({
            success: false,
            message: 'API가 /api/v1로 이동했습니다. 새로운 엔드포인트를 사용해주세요.',
            newEndpoint: req.originalUrl.replace('/api/auth', '/api/v1/auth')
        });
    });

    console.log('✅ RESTful API v1 라우터 설정 완료');
}

// 서버 시작
async function startServer() {
    try {
        await setupDependencies();

        // 404 핸들러 (모든 라우트 다음에 위치)
        app.use(notFoundHandler);

        // 에러 핸들러 (마지막에 위치)
        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`🎮 RESTful 가위바위보 게임 서버가 http://localhost:${PORT} 에서 실행중입니다!`);
            console.log(`📡 API v1: http://localhost:${PORT}/api/v1`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 SIGINT 신호를 받았습니다. 서버를 종료합니다...');
    process.exit(0);
});

startServer();
