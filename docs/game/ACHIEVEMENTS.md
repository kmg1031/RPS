# 🏆 RPS Game 업적 시스템 설계 문서

가위바위보 게임의 업적 시스템 구현을 위한 상세한 설계 문서입니다.

## 📋 목차
- [업적 시스템 개요](#-업적-시스템-개요)
- [데이터베이스 설계](#-데이터베이스-설계)
- [업적 분류](#-업적-분류)
- [업적 목록](#-업적-목록)
- [구현 가이드](#-구현-가이드)
- [UI/UX 설계](#-uiux-설계)

---

## 🎯 업적 시스템 개요

### 목적
- **사용자 참여 증대**: 게임에 대한 지속적인 관심 유도
- **진행도 시각화**: 플레이어의 성장과 발전 과정 표시
- **컬렉션 요소**: 업적 수집의 재미 제공
- **도전 요소**: 다양한 플레이 스타일 유도

### 핵심 원칙
- **점진적 달성**: 쉬운 것부터 어려운 것까지 단계적 구성
- **다양성**: 여러 플레이 스타일을 포괄하는 업적
- **보상 시스템**: 업적 달성 시 적절한 보상 제공
- **진행도 표시**: 현재 진행 상황을 명확하게 표시

---

## 🗄️ 데이터베이스 설계

### achievements 테이블 (업적 정의)
```sql
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_key TEXT UNIQUE NOT NULL,        -- 업적 고유 키
    name TEXT NOT NULL,                          -- 업적 이름
    description TEXT NOT NULL,                   -- 업적 설명
    category TEXT NOT NULL,                      -- 업적 카테고리
    icon TEXT,                                   -- 업적 아이콘 (이모지)
    target_value INTEGER NOT NULL DEFAULT 1,    -- 달성 목표 수치
    reward_points INTEGER NOT NULL DEFAULT 0,   -- 보상 포인트
    difficulty TEXT DEFAULT 'normal',           -- 난이도 (easy, normal, hard, legendary)
    is_hidden BOOLEAN DEFAULT FALSE,             -- 숨김 업적 여부
    is_active BOOLEAN DEFAULT TRUE,              -- 활성화 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### user_achievements 테이블 (사용자 업적 달성 현황)
```sql
CREATE TABLE user_achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                   -- 사용자 ID
    achievement_id INTEGER NOT NULL,            -- 업적 ID
    current_value INTEGER DEFAULT 0,            -- 현재 진행도
    is_completed BOOLEAN DEFAULT FALSE,         -- 달성 완료 여부
    completed_at DATETIME,                      -- 달성 완료 시간
    notified BOOLEAN DEFAULT FALSE,             -- 알림 발송 여부
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (achievement_id) REFERENCES achievements (id),
    UNIQUE (user_id, achievement_id)
);
```

### achievement_logs 테이블 (업적 진행 로그)
```sql
CREATE TABLE achievement_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,                   -- 사용자 ID
    achievement_id INTEGER NOT NULL,            -- 업적 ID
    action_type TEXT NOT NULL,                  -- 액션 타입 (progress, complete)
    old_value INTEGER DEFAULT 0,               -- 이전 값
    new_value INTEGER DEFAULT 0,               -- 새 값
    game_context TEXT,                         -- 게임 컨텍스트 (JSON)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (achievement_id) REFERENCES achievements (id)
);
```

---

## 📊 업적 분류

### 카테고리별 분류
```javascript
const ACHIEVEMENT_CATEGORIES = {
    GAMEPLAY: '게임 플레이',      // 기본적인 게임 진행 관련
    STREAK: '연속 기록',          // 연승, 연패 등 연속 관련
    SKILL: '실력',                // 승률, 점수 등 실력 관련
    COLLECTION: '컬렉션',         // 다양한 선택, 패턴 등
    MILESTONE: '이정표',          // 특정 수치 달성
    SPECIAL: '특별',              // 특수한 조건의 업적
    SEASONAL: '시즌',             // 기간 한정 업적
    SOCIAL: '소셜'                // PvP 관련 (미래 구현)
};
```

### 난이도별 분류
```javascript
const DIFFICULTY_LEVELS = {
    EASY: {
        name: '쉬움',
        color: '#4CAF50',
        icon: '🟢',
        reward_multiplier: 1
    },
    NORMAL: {
        name: '보통',
        color: '#2196F3',
        icon: '🔵',
        reward_multiplier: 2
    },
    HARD: {
        name: '어려움',
        color: '#FF9800',
        icon: '🟠',
        reward_multiplier: 3
    },
    LEGENDARY: {
        name: '전설',
        color: '#9C27B0',
        icon: '🟣',
        reward_multiplier: 5
    }
};
```

---

## 🏅 업적 목록

### 🎮 게임 플레이 (GAMEPLAY)

#### 쉬움 (EASY)
- **첫 게임** (`first_game`): 첫 번째 게임 완료 (1게임) - 10점 획득
- **첫 라운드** (`first_round`): 첫 번째 라운드 완료 (1라운드) - 50점 획득
- **열정적인 플레이어** (`enthusiastic_player`): 10라운드 완료 - 100점 획득

#### 보통 (NORMAL)
- **게임 애호가** (`game_lover`): 100라운드 완료 - 500점 획득
- **헌신적인 플레이어** (`dedicated_player`): 500라운드 완료 - 1000점 획득

#### 어려움 (HARD)
- **게임 마스터** (`game_master`): 1000라운드 완료 - 2000점 획득
- **불굴의 의지** (`unbreakable_will`): 5000라운드 완료 - 5000점 획득

### 🔥 연속 기록 (STREAK)

#### 쉬움 (EASY)
- **첫 승리** (`first_win`): 첫 게임 승리 달성 - 20점 획득
- **연승 시작** (`game_win_streak_3`): 3게임 연승 달성 - 50점 획득
- **인내의 시작** (`patience_start`): 5게임 연패 달성 - 30점 획득

#### 보통 (NORMAL)
- **승리의 연쇄** (`game_win_streak_10`): 10게임 연승 달성 - 200점 획득
- **불굴의 연승** (`game_win_streak_20`): 20게임 연승 달성 - 500점 획득
- **시련의 길** (`game_lose_streak_10`): 10게임 연패 달성 - 100점 획득

#### 어려움 (HARD)
- **전설의 연승** (`game_win_streak_50`): 50게임 연승 달성 - 2000점 획득
- **절망의 나락** (`game_lose_streak_20`): 20게임 연패 달성 - 300점 획득

#### 전설 (LEGENDARY)
- **무적의 전사** (`invincible_warrior`): 100게임 연승 달성 - 10000점 획득

### 🎯 실력 (SKILL)

#### 보통 (NORMAL)
- **실력자** (`skilled_player`): 게임 승률 70% 달성 (1000게임 이상) - 800점 획득
- **점수 사냥꾼** (`score_hunter`): 한 라운드에서 50점 이상 획득 - 300점 획득

#### 어려움 (HARD)
- **고수** (`expert_player`): 게임 승률 80% 달성 (5000게임 이상) - 2000점 획득
- **완벽한 라운드** (`perfect_round`): 한 라운드에서 100점 달성 - 1000점 획득

#### 전설 (LEGENDARY)
- **신급 플레이어** (`godlike_player`): 게임 승률 90% 달성 (10000게임 이상) - 5000점 획득

### 🎲 컬렉션 (COLLECTION)

#### 쉬움 (EASY)
- **가위 애호가** (`scissors_lover`): 가위를 1000번 사용 - 100점 획득
- **바위 매니아** (`rock_maniac`): 바위를 1000번 사용 - 100점 획득
- **보 수집가** (`paper_collector`): 보를 1000번 사용 - 100점 획득

#### 보통 (NORMAL)
- **균형잡힌 플레이** (`balanced_play`): 모든 선택을 500번씩 사용 - 500점 획득
- **패턴의 달인** (`pattern_master`): 10가지 다른 덱 패턴 사용 - 300점 획득

#### 어려움 (HARD)
- **완전한 수집가** (`complete_collector`): 모든 선택을 10000번씩 사용 - 3000점 획득

### 🚀 이정표 (MILESTONE)

#### 쉬움 (EASY)
- **백점 돌파** (`hundred_points`): 총 100점 달성 - 50점 획득
- **천점 돌파** (`thousand_points`): 총 1000점 달성 - 200점 획득

#### 보통 (NORMAL)
- **만점 돌파** (`ten_thousand_points`): 총 10000점 달성 - 1000점 획득
- **십만점 돌파** (`hundred_thousand_points`): 총 100000점 달성 - 5000점 획득

#### 어려움 (HARD)
- **백만점 달성** (`million_points`): 총 1000000점 달성 - 20000점 획득

### ⭐ 특별 (SPECIAL)

#### 보통 (NORMAL)
- **완벽한 예측** (`perfect_prediction`): 상대의 선택을 10연속 정확히 예측 - 500점 획득
- **시간의 지배자** (`time_master`): 자정에 게임 플레이 - 200점 획득

#### 어려움 (HARD)
- **운명의 선택** (`destiny_choice`): 모든 게임에서 같은 선택으로 라운드 승리 - 1000점 획득
- **역전의 왕** (`comeback_king`): 0:9에서 10:9로 역전승 - 2000점 획득

#### 전설 (LEGENDARY)
- **전설의 덱** (`legendary_deck`): 한 라운드에서 150점 이상 달성 - 10000점 획득

### 🎄 시즌 (SEASONAL) - 예시

#### 특별 (SPECIAL)
- **새해 첫 승리** (`new_year_victory`): 새해 첫날 첫 게임 승리 - 1000점 획득
- **크리스마스 기적** (`christmas_miracle`): 12월 25일에 25게임 연승 달성 - 2500점 획득

---

## 🛠️ 구현 가이드

### AchievementManager 클래스 설계

```javascript
class AchievementManager {
    constructor(database) {
        this.db = database;
        this.achievements = new Map(); // 캐시된 업적 정보
        this.userProgress = new Map(); // 사용자 진행도 캐시
    }

    // 업적 시스템 초기화
    async init() {
        await this.loadAchievements();
        await this.createDefaultAchievements();
    }

    // 기본 업적들 생성
    async createDefaultAchievements() {
        const achievements = [
            {
                key: 'first_game',
                name: '첫 게임',
                description: '첫 번째 게임을 완료하세요',
                category: 'GAMEPLAY',
                icon: '🎮',
                target: 1,
                reward_points: 10,
                difficulty: 'EASY'
            }
            // ... 더 많은 업적들
        ];

        for (const achievement of achievements) {
            await this.createAchievement(achievement);
        }
    }

    // 게임 이벤트 처리
    async onGameComplete(userId, gameData) {
        await this.checkAchievements(userId, 'GAME_COMPLETE', gameData);
    }

    async onRoundComplete(userId, roundData) {
        await this.checkAchievements(userId, 'ROUND_COMPLETE', roundData);
    }

    async onStreak(userId, streakData) {
        await this.checkAchievements(userId, 'STREAK', streakData);
    }

    // 업적 확인 및 업데이트
    async checkAchievements(userId, eventType, eventData) {
        const relevantAchievements = this.getAchievementsByEvent(eventType);

        for (const achievement of relevantAchievements) {
            await this.updateProgress(userId, achievement.id, eventData);
        }
    }

    // 진행도 업데이트
    async updateProgress(userId, achievementId, eventData) {
        const current = await this.getUserProgress(userId, achievementId);
        const increment = this.calculateIncrement(achievementId, eventData);
        const newValue = current.current_value + increment;

        await this.db.updateAchievementProgress(userId, achievementId, newValue);

        // 달성 확인
        const achievement = this.achievements.get(achievementId);
        if (newValue >= achievement.target_value && !current.is_completed) {
            await this.completeAchievement(userId, achievementId);
        }
    }

    // 업적 달성 처리
    async completeAchievement(userId, achievementId) {
        const achievement = this.achievements.get(achievementId);

        // 업적 완료 마킹
        await this.db.completeAchievement(userId, achievementId);

        // 보상 지급
        await this.db.updateUserPoints(userId, achievement.reward_points);

        // 알림 전송
        await this.sendAchievementNotification(userId, achievement);

        // 로그 기록
        await this.db.logAchievement(userId, achievementId, 'COMPLETE');
    }
}
```

### Database 메서드 추가

```javascript
// database.js에 추가할 메서드들

async createAchievement(achievementData) {
    // 업적 생성
}

async getUserAchievements(userId) {
    // 사용자 업적 목록 조회
}

async getUserProgress(userId, achievementId) {
    // 특정 업적 진행도 조회
}

async updateAchievementProgress(userId, achievementId, newValue) {
    // 업적 진행도 업데이트
}

async completeAchievement(userId, achievementId) {
    // 업적 완료 처리
}

async getAchievementStats(userId) {
    // 업적 통계 (완료율, 카테고리별 현황 등)
}
```

### API 엔드포인트 설계

```javascript
// routes/achievementRoutes.js

// GET /api/achievements - 모든 업적 목록
router.get('/achievements', async (req, res) => {
    // 업적 목록 반환 (숨김 업적 제외)
});

// GET /api/achievements/user - 사용자 업적 현황
router.get('/achievements/user', authenticateToken, async (req, res) => {
    // 사용자의 업적 진행 현황 반환
});

// GET /api/achievements/categories - 카테고리별 업적
router.get('/achievements/categories', async (req, res) => {
    // 카테고리별로 그룹화된 업적 반환
});

// POST /api/achievements/claim/:id - 업적 보상 수령
router.post('/achievements/claim/:id', authenticateToken, async (req, res) => {
    // 업적 보상 수령 처리
});
```

---

## 🎨 UI/UX 설계

### 업적 메뉴 추가
```html
<!-- header에 업적 버튼 추가 -->
<div class="header-controls">
    <button id="achievements-btn" class="header-btn">
        <span class="icon">🏆</span>
        <span>업적</span>
        <span class="notification-badge" id="achievement-badge" style="display: none;"></span>
    </button>
</div>
```

### 업적 모달 디자인
```html
<div id="achievements-modal" class="modal">
    <div class="modal-content large">
        <div class="modal-header">
            <h2>🏆 업적</h2>
            <div class="achievement-stats">
                <span>완료: <span id="completed-count">0</span></span>
                <span>전체: <span id="total-count">0</span></span>
                <span>완료율: <span id="completion-rate">0%</span></span>
            </div>
        </div>
        <div class="modal-body">
            <div class="achievement-categories">
                <button class="category-tab active" data-category="all">전체</button>
                <button class="category-tab" data-category="GAMEPLAY">게임 플레이</button>
                <button class="category-tab" data-category="STREAK">연속 기록</button>
                <!-- 더 많은 카테고리... -->
            </div>
            <div class="achievements-list" id="achievements-list">
                <!-- 업적 목록이 동적으로 생성됨 -->
            </div>
        </div>
    </div>
</div>
```

### 업적 아이템 디자인
```html
<div class="achievement-item" data-difficulty="normal" data-completed="false">
    <div class="achievement-icon">🎮</div>
    <div class="achievement-info">
        <h4 class="achievement-name">첫 게임</h4>
        <p class="achievement-description">첫 번째 게임을 완료하세요</p>
        <div class="achievement-progress">
            <div class="progress-bar">
                <div class="progress-fill" style="width: 80%"></div>
            </div>
            <span class="progress-text">8/10</span>
        </div>
    </div>
    <div class="achievement-reward">+50점</div>
</div>
```

### CSS 스타일 가이드
```css
.achievement-item {
    display: flex;
    align-items: center;
    padding: 1rem;
    margin: 0.5rem 0;
    border: 2px solid transparent;
    border-radius: 10px;
    transition: all 0.3s ease;
}

.achievement-item[data-completed="true"] {
    background: linear-gradient(135deg, #4CAF50, #45a049);
    border-color: #4CAF50;
    color: white;
}

.achievement-item[data-difficulty="legendary"] {
    background: linear-gradient(135deg, #9C27B0, #7B1FA2);
    border-color: #9C27B0;
    color: white;
}

.achievement-notification {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, #FFD700, #FFA500);
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: achievementPop 3s ease-in-out;
}
```

### 알림 시스템
```javascript
class AchievementNotification {
    static show(achievement) {
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div class="achievement-icon-large">${achievement.icon}</div>
            <h3>업적 달성!</h3>
            <h4>${achievement.name}</h4>
            <p>${achievement.description}</p>
            <div class="reward">+${achievement.reward_points}점</div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}
```

---

## 📈 진행도 추적

### 이벤트 트리거 맵핑
```javascript
const EVENT_ACHIEVEMENT_MAP = {
    'GAME_COMPLETE': [
        'first_game', 'scissors_lover', 'rock_maniac', 'paper_collector'
    ],
    'ROUND_COMPLETE': [
        'first_round', 'enthusiastic_player', 'game_lover', 'perfect_round'
    ],
    'GAME_WIN_STREAK': [
        'first_win', 'game_win_streak_3', 'game_win_streak_10', 'invincible_warrior'
    ],
    'GAME_LOSE_STREAK': [
        'patience_start', 'game_lose_streak_10', 'game_lose_streak_20'
    ],
    'SCORE_MILESTONE': [
        'hundred_points', 'thousand_points', 'million_points'
    ]
};
```

### 통계 수집 포인트
1. **게임 완료 시**: 선택 통계, 연속 기록 업데이트
2. **라운드 완료 시**: 승률, 점수, 라운드 수 업데이트
3. **로그인 시**: 연속 로그인 업적 확인
4. **특별 조건**: 시간 기반, 패턴 기반 업적 확인

---

**마지막 업데이트**: 2025-09-16

---

## 🚀 구현 우선순위

### Phase 1 (기본 구현)
1. 데이터베이스 스키마 생성
2. AchievementManager 클래스 구현
3. 기본 업적 10개 구현
4. 업적 진행도 추적 시스템

### Phase 2 (UI 구현)
1. 업적 모달 UI 구현
2. 알림 시스템 구현
3. 진행도 시각화
4. 카테고리별 필터링

### Phase 3 (고도화)
1. 숨김 업적 시스템
2. 시즌 업적 시스템
3. 업적 공유 기능
4. 리더보드 연동