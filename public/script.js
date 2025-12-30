/**
 * 가위바위보 게임 - 연승제 모드 전용
 * 덱 모드 제거됨
 */

/**
 * 업적 시스템 관리 클래스
 */
class AchievementManager {
    constructor(authManager) {
        this.authManager = authManager;
        this.achievements = [];
        this.userAchievements = [];
        this.categories = ['all', 'GAMEPLAY', 'STREAK', 'COLLECTION', 'MILESTONE', 'SPECIAL'];
        this.currentCategory = 'all';
        this.bindEvents();
    }

    bindEvents() {
        const achievementsBtn = document.getElementById('achievements-btn');
        const achievementsModal = document.getElementById('achievements-modal');
        const achievementsClose = document.getElementById('achievements-close');

        // 업적 버튼 클릭
        if (achievementsBtn) {
            achievementsBtn.addEventListener('click', () => {
                this.showAchievementsModal();
            });
        }

        // 모달 닫기
        if (achievementsClose) {
            achievementsClose.addEventListener('click', () => {
                this.hideAchievementsModal();
            });
        }

        // 모달 배경 클릭으로 닫기
        if (achievementsModal) {
            achievementsModal.addEventListener('click', (e) => {
                if (e.target === achievementsModal) {
                    this.hideAchievementsModal();
                }
            });
        }

        // 카테고리 탭 이벤트
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-tab')) {
                this.switchCategory(e.target.dataset.category);
            }
        });
    }

    async showAchievementsModal() {
        if (!this.authManager.isLoggedIn()) {
            console.warn('업적은 로그인한 사용자만 볼 수 있습니다.');
            return;
        }

        const modal = document.getElementById('achievements-modal');
        if (modal) {
            modal.style.display = 'flex';
            await this.loadAchievements();
            this.renderAchievements();
        }
    }

    hideAchievementsModal() {
        const modal = document.getElementById('achievements-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    async loadAchievements() {
        try {
            // 사용자 업적 목록 로드
            const response = await fetch('/api/v1/achievements/me', {
                headers: this.authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.userAchievements = data.data.achievements || [];
                this.stats = data.data.stats || {};
                this.updateAchievementStats();
            }
        } catch (error) {
            console.error('업적 로드 오류:', error);
        }
    }

    updateAchievementStats() {
        const completedCount = document.getElementById('completed-count');
        const totalCount = document.getElementById('total-count');
        const completionRate = document.getElementById('completion-rate');

        if (this.stats) {
            if (completedCount) completedCount.textContent = this.stats.completed_count || 0;
            if (totalCount) totalCount.textContent = this.stats.total_count || 0;
            if (completionRate) {
                const rate = this.stats.total_count > 0
                    ? Math.round((this.stats.completed_count / this.stats.total_count) * 100)
                    : 0;
                completionRate.textContent = `${rate}%`;
            }
        }
    }

    switchCategory(category) {
        this.currentCategory = category;

        // 탭 활성화 상태 업데이트
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.category === category);
        });

        this.renderAchievements();
    }

    renderAchievements() {
        const container = document.getElementById('achievements-list');
        if (!container) return;

        let filteredAchievements = this.userAchievements;

        // 카테고리 필터링
        if (this.currentCategory !== 'all') {
            filteredAchievements = this.userAchievements.filter(
                achievement => achievement.category === this.currentCategory
            );
        }

        if (filteredAchievements.length === 0) {
            container.innerHTML = '<div class="no-achievements">이 카테고리에는 업적이 없습니다.</div>';
            return;
        }

        container.innerHTML = filteredAchievements.map(achievement => {
            const progress = achievement.current_value || 0;
            const target = achievement.target_value || 1;
            const progressPercent = Math.min((progress / target) * 100, 100);
            const isCompleted = achievement.is_completed;

            return `
                <div class="achievement-item ${isCompleted ? 'completed' : ''}">
                    <div class="achievement-icon">${achievement.icon}</div>
                    <div class="achievement-content">
                        <div class="achievement-header">
                            <h4 class="achievement-name">${achievement.name}</h4>
                            <div class="achievement-difficulty ${achievement.difficulty}">${this.getDifficultyText(achievement.difficulty)}</div>
                        </div>
                        <p class="achievement-description">${achievement.description}</p>
                        <div class="achievement-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${progressPercent}%"></div>
                            </div>
                            <span class="progress-text">${progress}/${target}</span>
                        </div>
                        <div class="achievement-reward">
                            <span class="reward-points">+${achievement.reward_points}점</span>
                            ${isCompleted ? '<span class="completed-badge">완료</span>' : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '쉬움',
            'normal': '보통',
            'hard': '어려움',
            'expert': '전문가'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    // 업적 알림 표시
    showAchievementNotification(achievement) {
        // 알림이 이미 표시중이면 대기열에 추가
        if (!this.notificationQueue) {
            this.notificationQueue = [];
        }

        this.notificationQueue.push(achievement);

        // 현재 알림이 없으면 바로 표시
        if (!this.isShowingNotification) {
            this.processNotificationQueue();
        }
    }

    async processNotificationQueue() {
        if (this.notificationQueue.length === 0) {
            this.isShowingNotification = false;
            return;
        }

        this.isShowingNotification = true;
        const achievement = this.notificationQueue.shift();

        // 알림 컨테이너 생성 (없으면)
        let container = document.getElementById('achievement-notifications');
        if (!container) {
            container = document.createElement('div');
            container.id = 'achievement-notifications';
            container.className = 'achievement-notifications';
            document.body.appendChild(container);
        }

        // 알림 요소 생성
        const notification = document.createElement('div');
        notification.className = 'achievement-notification show';
        notification.innerHTML = `
            <div class="notification-icon">${achievement.icon}</div>
            <div class="notification-content">
                <h4>업적 달성!</h4>
                <p>${achievement.name}</p>
                <span class="notification-reward">+${achievement.reward_points}점</span>
            </div>
        `;

        container.appendChild(notification);

        // 3초 후 알림 제거
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                // 다음 알림 처리
                this.processNotificationQueue();
            }, 300);
        }, 3000);
    }

    // 업적 진행도 업데이트 (게임 완료 후 호출)
    async checkForNewAchievements() {
        if (!this.authManager.isLoggedIn()) return;

        try {
            const response = await fetch('/api/v1/achievements/me', {
                headers: this.authManager.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                const newUserAchievements = data.data.achievements || [];

                // 새로 완료된 업적 찾기
                const newCompletedAchievements = newUserAchievements.filter(newAchievement => {
                    const oldAchievement = this.userAchievements.find(
                        old => old.achievement_key === newAchievement.achievement_key
                    );
                    return newAchievement.is_completed && (!oldAchievement || !oldAchievement.is_completed);
                });

                // 새 업적 알림 표시
                newCompletedAchievements.forEach(achievement => {
                    this.showAchievementNotification(achievement);
                });

                // 업적 배지 업데이트
                if (newCompletedAchievements.length > 0) {
                    this.updateAchievementBadge(newCompletedAchievements.length);
                }

                this.userAchievements = newUserAchievements;
                this.stats = data.data.stats || {};
            }
        } catch (error) {
            console.error('업적 확인 오류:', error);
        }
    }

    // 업적 배지 업데이트
    updateAchievementBadge(newCount) {
        const badge = document.getElementById('achievement-badge');
        if (badge && newCount > 0) {
            badge.style.display = 'block';
            badge.textContent = '+' + newCount;

            // 5초 후 배지 숨김
            setTimeout(() => {
                badge.style.display = 'none';
            }, 5000);
        }
    }
}

class AuthManager {
    constructor() {
        this.token = localStorage.getItem('authToken');
        this.user = null;
        this.bindEvents();
        this.checkAuthStatus();
    }

    bindEvents() {
        // 모달 열기/닫기
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login-modal');
        });

        document.getElementById('register-btn').addEventListener('click', () => {
            this.showModal('register-modal');
        });


        document.getElementById('logout-btn').addEventListener('click', () => {
            this.logout();
        });

        // 모달 닫기 - ID로 직접 처리
        const loginClose = document.getElementById('login-close');
        if (loginClose) {
            loginClose.addEventListener('click', () => {
                this.hideModal('login-modal');
            });
        }

        const registerClose = document.getElementById('register-close');
        if (registerClose) {
            registerClose.addEventListener('click', () => {
                this.hideModal('register-modal');
            });
        }

        // 모달 닫기 - 클래스로도 처리 (하위 호환성)
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.hideModal(modal.id);
                }
            });
        });

        // 모달 배경 클릭으로 닫기 (로그인 모달만 허용, 회원가입은 불가)
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal && modal.id !== 'register-modal') {
                    this.hideModal(modal.id);
                }
            });
        });

        // 로그인 폼 제출
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        // 회원가입 폼 제출
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // 모달 전환 버튼
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');

        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.hideModal('login-modal');
                this.showModal('register-modal');
            });
        }

        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.hideModal('register-modal');
                this.showModal('login-modal');
            });
        }
    }

    showModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    hideModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    isLoggedIn() {
        return !!this.token;
    }

    getAuthHeaders() {
        return this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    }

    async checkAuthStatus() {
        if (this.token) {
            try {
                const response = await fetch('/api/v1/users/me', {
                    headers: this.getAuthHeaders()
                });

                if (response.ok) {
                    const data = await response.json();
                    this.user = data.data;
                    this.updateUI(true);
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('인증 상태 확인 오류:', error);
                this.logout();
            }
        } else {
            this.updateUI(false);
        }
    }

    async login() {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');

        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (data.success) {
                this.token = data.data.token;
                this.user = data.data.user;
                localStorage.setItem('authToken', this.token);

                this.hideModal('login-modal');
                this.updateUI(true);

                errorElement.textContent = '';
                document.getElementById('login-form').reset();
            } else {
                errorElement.textContent = data.error || '로그인에 실패했습니다.';
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            errorElement.textContent = '서버 연결 오류가 발생했습니다.';
        }
    }

    async register() {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorElement = document.getElementById('register-error');

        if (password !== confirmPassword) {
            errorElement.textContent = '비밀번호가 일치하지 않습니다.';
            return;
        }

        try {
            const response = await fetch('/api/v1/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (data.success) {
                // 회원가입 성공 시 토큰과 사용자 정보를 받아서 자동 로그인
                this.token = data.data.token;
                this.user = data.data.user;
                localStorage.setItem('authToken', this.token);

                this.hideModal('register-modal');
                this.updateUI(true);

                errorElement.textContent = '';
                document.getElementById('register-form').reset();
            } else {
                if (data.errors && data.errors.length > 0) {
                    errorElement.textContent = data.errors.map(err => err.msg).join(', ');
                } else {
                    errorElement.textContent = data.error || '회원가입에 실패했습니다.';
                }
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            errorElement.textContent = '서버 연결 오류가 발생했습니다.';
        }
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('authToken');
        this.updateUI(false);
    }

    updateUI(isLoggedIn) {
        const authButtons = document.getElementById('auth-buttons');
        const userInfo = document.getElementById('user-info');
        const usernameElement = document.getElementById('username-display');
        const userPointsElement = document.getElementById('user-points');
        const achievementsBtn = document.getElementById('achievements-btn');

        if (isLoggedIn && this.user) {
            authButtons.style.display = 'none';
            userInfo.style.display = 'flex';

            if (usernameElement) {
                usernameElement.textContent = this.user.username;
            }

            if (userPointsElement) {
                const points = this.user.total_points || 0;
                userPointsElement.textContent = `${points}점`;
            }

            // 로그인한 사용자에게만 업적 버튼 표시
            if (achievementsBtn) {
                achievementsBtn.style.display = 'block';
            }
        } else {
            authButtons.style.display = 'flex';
            userInfo.style.display = 'none';

            // 게스트 사용자에게는 업적 버튼 숨김
            if (achievementsBtn) {
                achievementsBtn.style.display = 'none';
            }
        }
    }


    async refreshUserInfo() {
        if (!this.isLoggedIn()) return;

        try {
            const response = await fetch('/api/v1/users/me', {
                headers: this.getAuthHeaders()
            });

            if (response.ok) {
                const data = await response.json();
                this.user = data.data;
                this.updateUI(true);

                // 승점 증가 애니메이션 효과
                this.animatePointsUpdate();
            }
        } catch (error) {
            console.error('사용자 정보 새로고침 오류:', error);
        }
    }

    animatePointsUpdate() {
        const pointsElement = document.getElementById('user-points');
        if (pointsElement) {
            pointsElement.classList.add('points-update');
            setTimeout(() => {
                pointsElement.classList.remove('points-update');
            }, 2000);
        }
    }
}

/**
 * 연승제 게임 관리 클래스
 */
class StreakGame {
    constructor(authManager) {
        this.authManager = authManager;
        this.gameId = null;
        this.computerChoice = null;
        this.computerChoices = []; // 100개의 미리 생성된 패
        this.currentGameNumber = 0; // 현재 게임 번호
        this.timer = null;
        this.totalTime = 20; // 전체 게임 시간 20초
        this.timeRemaining = 20;
        this.gameStartTime = null; // 게임 전체 시작 시간

        this.choices = ['rock', 'paper', 'scissors'];
        this.choiceEmojis = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };
        this.choiceNames = {
            rock: '바위',
            paper: '보',
            scissors: '가위'
        };

        this.bindEvents();
    }

    bindEvents() {
        // 게임 시작 버튼
        const startBtn = document.getElementById('start-streak-game');
        if (startBtn) {
            startBtn.addEventListener('click', () => this.startGame());
        }

        // 선택 버튼들
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const choice = e.currentTarget.dataset.choice;
                this.makeChoice(choice);
            });
        });

        // 포기 버튼
        const quitBtn = document.getElementById('quit-streak-game');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => this.quitGame());
        }

        // 새 게임 버튼
        const newGameBtn = document.getElementById('new-streak-game');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.showOptions());
        }
    }

    async startGame() {
        if (!this.authManager || !this.authManager.isLoggedIn()) {
            alert('연승제 게임은 로그인이 필요합니다.');
            return;
        }

        const allowTie = document.getElementById('allow-tie').checked;
        const shufflePositions = document.getElementById('shuffle-positions').checked;

        try {
            const response = await fetch('/api/streak-game/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({ allowTie, shufflePositions })
            });

            const data = await response.json();

            if (data.success) {
                this.gameId = data.gameId;
                this.computerChoices = data.computerChoices || [];
                this.computerChoice = data.computerChoice;
                this.currentGameNumber = data.currentGameNumber || 0;

                this.showPlayArea();
                this.displayComputerChoice(data.computerChoice);
                this.startTimer();

                // 재개된 게임인 경우 통계 업데이트
                if (data.resumed) {
                    this.updateStats({
                        currentStreak: data.currentStreak,
                        maxStreak: data.maxStreak,
                        totalPoints: data.totalPoints
                    });
                }

                if (data.shufflePositions || shufflePositions) {
                    this.shuffleChoiceButtons();
                }
            } else {
                alert(data.message || '게임 시작 실패');
            }
        } catch (error) {
            console.error('게임 시작 오류:', error);
            alert('서버 연결 오류');
        }
    }

    async makeChoice(playerChoice) {
        if (!this.gameId || !this.computerChoice) return;

        const totalElapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
        this.disableChoiceButtons();

        try {
            const response = await fetch('/api/streak-game/play', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({
                    gameId: this.gameId,
                    playerChoice,
                    computerChoice: this.computerChoice,
                    timeTaken: totalElapsed
                })
            });

            const data = await response.json();

            if (data.success) {
                this.updateStats(data);
                this.computerChoice = data.nextComputerChoice;
                this.currentGameNumber = data.gameNumber;

                if (this.computerChoice) {
                    this.displayComputerChoice(this.computerChoice);
                    this.enableChoiceButtons();

                    if (document.getElementById('shuffle-positions').checked) {
                        this.shuffleChoiceButtons();
                    }
                } else {
                    this.stopTimer();
                    this.showResult({
                        maxStreak: data.maxStreak,
                        totalPoints: data.totalPoints,
                        gamesPlayed: this.currentGameNumber,
                        message: '모든 패를 완료했습니다!'
                    });
                }
            } else {
                this.stopTimer();
                this.showResult(data.finalStats);
            }
        } catch (error) {
            console.error('선택 처리 오류:', error);
            alert('서버 연결 오류');
            this.enableChoiceButtons();
        }
    }

    async quitGame() {
        this.stopTimer();

        try {
            const response = await fetch('/api/streak-game/quit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...this.authManager.getAuthHeaders()
                },
                body: JSON.stringify({ gameId: this.gameId })
            });

            const data = await response.json();

            if (data.success) {
                this.showResult(data.finalStats);
                this.authManager.refreshUserInfo();
            }
        } catch (error) {
            console.error('게임 포기 오류:', error);
        }
    }

    startTimer() {
        if (!this.gameStartTime) {
            this.gameStartTime = Date.now();
            this.timeRemaining = this.totalTime;
        }

        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.gameStartTime) / 1000);
            this.timeRemaining = this.totalTime - elapsed;

            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                this.stopTimer();
                this.handleTimeout();
            }
        }, 100);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const timerText = document.getElementById('timer-text');
        const timerFill = document.getElementById('timer-fill');

        if (timerText) {
            timerText.textContent = `${this.timeRemaining}초`;
        }

        if (timerFill) {
            const percentage = (this.timeRemaining / 20) * 100;
            timerFill.style.width = `${percentage}%`;

            if (this.timeRemaining <= 5) {
                timerFill.style.backgroundColor = '#ef4444';
            } else if (this.timeRemaining <= 10) {
                timerFill.style.backgroundColor = '#f59e0b';
            } else {
                timerFill.style.backgroundColor = '#10b981';
            }
        }
    }

    async handleTimeout() {
        this.disableChoiceButtons();
        alert('시간 초과! 게임이 종료되었습니다.');
        await this.quitGame();
    }

    displayComputerChoice(choice) {
        const computerChoiceCard = document.getElementById('computer-choice');
        if (computerChoiceCard) {
            computerChoiceCard.innerHTML = `
                <div class="choice-display">
                    <span class="choice-emoji">${this.choiceEmojis[choice]}</span>
                    <span class="choice-name">${this.choiceNames[choice]}</span>
                </div>
            `;
        }
    }

    updateStats(data) {
        document.getElementById('current-streak').textContent = data.currentStreak;
        document.getElementById('max-streak').textContent = data.maxStreak;
        document.getElementById('total-points').textContent = data.totalPoints;
    }

    shuffleChoiceButtons() {
        const container = document.getElementById('player-choices');
        const buttons = Array.from(container.children);

        for (let i = buttons.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            container.appendChild(buttons[j]);
        }
    }

    disableChoiceButtons() {
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.disabled = true;
        });
    }

    enableChoiceButtons() {
        document.querySelectorAll('#player-choices .choice-btn').forEach(btn => {
            btn.disabled = false;
        });
    }

    showOptions() {
        document.querySelector('.streak-game-options').style.display = 'block';
        document.getElementById('streak-game-play').style.display = 'none';
        document.getElementById('streak-game-result').style.display = 'none';
        this.gameId = null;
        this.gameStartTime = null;
    }

    showPlayArea() {
        document.querySelector('.streak-game-options').style.display = 'none';
        document.getElementById('streak-game-play').style.display = 'block';
        document.getElementById('streak-game-result').style.display = 'none';
        this.updateStats({ currentStreak: 0, maxStreak: 0, totalPoints: 0 });
        this.enableChoiceButtons();
    }

    showResult(stats) {
        this.stopTimer();
        document.querySelector('.streak-game-options').style.display = 'none';
        document.getElementById('streak-game-play').style.display = 'none';
        document.getElementById('streak-game-result').style.display = 'block';

        document.getElementById('final-max-streak').textContent = stats.maxStreak;
        document.getElementById('final-total-points').textContent = stats.totalPoints;
        document.getElementById('final-games-played').textContent = stats.gamesPlayed;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.achievementManager = new AchievementManager(window.authManager);
    window.streakGame = new StreakGame(window.authManager);

    // MukjjipaGame은 mukjjipa.js에서 로드됨
    if (typeof MukjjipaGame !== 'undefined') {
        window.mukjjipaGame = new MukjjipaGame(window.authManager);
    }

    // 묵찌빠 게임 영역 표시 (기본)
    const mukjjipaGameArea = document.getElementById('mukjjipa-game-area');
    if (mukjjipaGameArea) {
        mukjjipaGameArea.style.display = 'block';
    }
});
