// Load environment variables first
require('dotenv').config({
    path: process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development'
});

const express = require('express');
const path = require('path');

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

// Controllers
const AuthController = require('./controllers/AuthController');
const AchievementController = require('./controllers/AchievementController');
const StreakGameController = require('./controllers/StreakGameController');
const PVEGameController = require('./controllers/PVEGameController');

// Routes
const authRoutes = require('./routes/auth.routes');
const achievementRoutes = require('./routes/achievement.routes');
const streakGameRoutes = require('./routes/streak-game.routes');
const pveGameRoutes = require('./routes/pve-game.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

    // Controllers
    const authController = new AuthController(userService);
    const achievementController = new AchievementController(achievementService);
    const streakGameController = new StreakGameController(streakGameService);
    const pveGameController = new PVEGameController(pveGameService);

    // Middleware - authenticateToken
    const authenticateToken = userService.authenticateToken.bind(userService);

    // Routes
    app.use('/api/auth', authRoutes(authController, authenticateToken));
    app.use('/api/achievements', achievementRoutes(achievementController, authenticateToken));
    app.use('/api/streak-game', streakGameRoutes(streakGameController, authenticateToken));
    app.use('/api/pve-game', pveGameRoutes(pveGameController, authenticateToken));

    console.log('✅ 라우터 설정 완료');
}

// 서버 시작
async function startServer() {
    try {
        await setupDependencies();

        app.listen(PORT, () => {
            console.log(`🎮 가위바위보 게임 서버가 http://localhost:${PORT} 에서 실행중입니다!`);
        });
    } catch (error) {
        console.error('❌ 서버 시작 실패:', error);
        process.exit(1);
    }
}

startServer();
