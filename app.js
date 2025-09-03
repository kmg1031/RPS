const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

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

app.post('/api/play', (req, res) => {
    const { playerChoice } = req.body;
    
    if (!playerChoice || !choices.includes(playerChoice)) {
        return res.status(400).json({ 
            error: '유효하지 않은 선택입니다. rock, paper, scissors 중 선택하세요.' 
        });
    }
    
    const computerChoice = getComputerChoice();
    const result = determineWinner(playerChoice, computerChoice);
    
    res.json({
        playerChoice,
        computerChoice,
        result,
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🎮 가위바위보 게임 서버가 http://localhost:${PORT} 에서 실행중입니다!`);
    console.log('🚀 브라우저에서 게임을 즐겨보세요!');
});