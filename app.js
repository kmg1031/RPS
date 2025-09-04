const express = require('express');
const path = require('path');
const Database = require('./database');

// 라우터 import
const authRoutes = require('./routes/authRoutes');
const gameRoutes = require('./routes/gameRoutes');

const app = express();
const PORT = process.env.PORT || 3000;
const db = new Database();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 라우터 연결
app.use('/api/auth', authRoutes);
app.use('/api', gameRoutes);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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