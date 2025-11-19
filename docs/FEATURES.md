# 🎮 RPS Game 주요 기능 문서

가위바위보 게임의 핵심 기능들을 상세히 설명합니다.

## 📋 목차
- [게임 시스템](#-게임-시스템)
- [인증 시스템](#-인증-시스템)
- [데이터베이스 구조](#-데이터베이스-구조)
- [서버 아키텍처](#-서버-아키텍처)
- [클라이언트 기능](#-클라이언트-기능)

---

## 🎮 게임 시스템

### 핵심 게임 로직 (`game.js`)

#### 🔹 GameLogic 클래스
```javascript
class GameLogic {
    // 승패 판정 로직
    determineWinner(playerChoice, computerChoice)

    // 라운드 게임 처리 (10게임 배치)
    playRoundWithDecks(playerDeck, computerDeck)

    // 점수 계산 시스템
    calculateGamePoints(currentRound, playerChoice, result)
}
```

#### 🎯 점수 계산 시스템
- **연속 점수**: 무승부 + 승리로 연속 증가
- **콤보 점수**: 승리만으로 연속 증가
- **패배 점수**: 패배로 연속 증가
- **선택 변경 페널티**: 다른 선택 시 모든 연속 초기화
- **획득 점수**: 현재 콤보 점수와 동일

#### 🃏 덱 시스템 (`deck.js`)
```javascript
class Deck {
    constructor(maxSize = 10)           // 덱 크기 설정
    addCard(choice)                     // 카드 추가
    removeCard(index)                   // 카드 제거
    generateRandom()                    // 랜덤 덱 생성
    getNextCard()                       // 다음 카드 반환
    validate()                          // 덱 유효성 검사
    static createFromArray(cards)       // 배열에서 덱 생성
    static createRandom(maxSize)        // 랜덤 덱 생성
}
```

### 게임 모드

#### ✅ PvE 모드 (구현 완료)
- **덱 구성**: 플레이어가 10개 선택 미리 구성
- **배치 게임**: 10게임을 한 번에 처리
- **점수 시스템**: 연속/콤보/패배 점수 추적
- **게임 기록**: 로그인 시 자동 저장

#### ⚠️ PvP 모드 (개발 대기)
- **덱 vs 덱**: 두 플레이어의 덱 대결
- **실시간 게임**: WebSocket 통신 예정
- **매칭 시스템**: 플레이어 매칭 기능

---

## 🔐 인증 시스템

### AuthService 클래스 (`auth.js`)

#### 🔹 JWT 토큰 관리
```javascript
static generateToken(payload)          // JWT 토큰 생성
static verifyToken(token)               // JWT 토큰 검증
```

#### 🔹 비밀번호 보안
```javascript
static hashPassword(password)           // bcrypt 해싱
static comparePassword(password, hash)  // 비밀번호 비교
```

#### 🔹 유효성 검사
```javascript
static validateRegister()               // 회원가입 유효성 검사
static validateLogin()                  // 로그인 유효성 검사
```

### 미들웨어

#### 🔹 인증 미들웨어
- **`authenticateToken`**: 필수 인증 (JWT 토큰 필수)
- **`optionalAuth`**: 선택적 인증 (토큰 있으면 인증, 없으면 게스트)

### 보안 설정
- **JWT 만료 시간**: 24시간
- **비밀번호 해싱**: bcrypt (saltRounds: 10)
- **토큰 저장**: localStorage (클라이언트)

---

## 🗄️ 데이터베이스 구조

### Database 클래스 (`database.js`)

**패턴**: MySQL Connection Pool (Singleton)

#### 📋 테이블 구조

##### 👤 users 테이블
```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    total_points INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
)
```

##### 🎯 rounds 테이블
```sql
CREATE TABLE rounds (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    round_result ENUM('win', 'lose', 'draw', 'in_progress') DEFAULT 'in_progress',
    player_score INT DEFAULT 0,
    computer_score INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
```

##### 🎮 games 테이블
```sql
CREATE TABLE games (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_number INT NOT NULL,
    player_choice ENUM('rock', 'paper', 'scissors') NOT NULL,
    computer_choice ENUM('rock', 'paper', 'scissors') NOT NULL,
    result ENUM('win', 'lose', 'draw') NOT NULL,
    points_earned INT DEFAULT 0,
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

##### 🔗 round_games 테이블 (다대다 관계)
```sql
CREATE TABLE round_games (
    round_id INT,
    game_id INT,
    PRIMARY KEY (round_id, game_id),
    FOREIGN KEY (round_id) REFERENCES rounds(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
)
```

##### 🏅 achievements 테이블
```sql
CREATE TABLE achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    achievement_key VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category ENUM('streak', 'combo', 'round', 'total', 'special'),
    icon VARCHAR(10),
    target_value INT NOT NULL,
    reward_points INT DEFAULT 0,
    difficulty ENUM('easy', 'normal', 'hard', 'legendary'),
    is_hidden BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

##### 🏆 user_achievements 테이블
```sql
CREATE TABLE user_achievements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    achievement_id INT,
    current_value INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP NULL,
    notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
)
```

#### 🔹 Repository 레이어 (CRUD)
```javascript
// UserRepository
findById(id)
findByUsername(username)
findByEmail(email)
create(username, email, passwordHash)
updatePoints(userId, points)

// RoundRepository
create(userId)
findById(roundId)
findByUserId(userId, limit)
updateResult(roundId, roundResult, playerScore, computerScore)
getUserStats(userId)

// GameRepository
create(gameNumber, playerChoice, computerChoice, result, pointsEarned)
findByIds(gameIds)

// AchievementRepository
findAll(activeOnly)
findById(achievementId)
findByKey(key)
createUserAchievement(userId, achievementId)
updateProgress(userId, achievementId, value, isCompleted)
getUserAchievements(userId)
```

---

## 🖥️ 서버 아키텍처

### 3계층 아키텍처 (Repository-Service-Controller)

#### 🔹 Express 앱 구조 (`app.js`)

**Dependency Injection 패턴**

```javascript
async function setupDependencies() {
    // 1. Database (Singleton)
    const db = Database.getInstance();
    await db.init();

    // 2. Repositories (DB 주입)
    const userRepository = new UserRepository(db);
    const roundRepository = new RoundRepository(db);
    const gameRepository = new GameRepository(db);
    const achievementRepository = new AchievementRepository(db);

    // 3. Services (Repository 주입)
    const userService = new UserService(userRepository);
    const gameService = new GameService(roundRepository, gameRepository, userRepository);
    const achievementService = new AchievementService(achievementRepository);

    // 4. Controllers (Service 주입)
    const authController = new AuthController(userService);
    const gameController = new GameController(gameService, achievementManager);
    const achievementController = new AchievementController(achievementService);

    // 5. Routes (Controller 주입)
    app.use('/api/auth', authRoutes(authController));
    app.use('/api/game', gameRoutes(gameController));
    app.use('/api/achievements', achievementRoutes(achievementController));
}
```

### 라우터 구조

#### 🔹 인증 라우터 (`routes/auth.routes.js`)
- `POST /api/auth/register` - 회원가입
- `POST /api/auth/login` - 로그인
- `GET /api/auth/me` - 사용자 정보 조회 (인증 필요)

#### 🔹 게임 라우터 (`routes/game.routes.js`)
- `POST /api/game/round/deck` - 덱 기반 게임 (10라운드, 권장)
- `POST /api/game/round` - 개별 게임 (레거시)
- `GET /api/game/stats` - 게임 통계 (인증 필요)

#### 🔹 업적 라우터 (`routes/achievement.routes.js`)
- `GET /api/achievements` - 업적 목록
- `GET /api/achievements/user` - 사용자 업적 (인증 필요)

---

## 🎨 클라이언트 기능

### HTML 구조 (`public/index.html`)

#### 🔹 주요 섹션
- **헤더**: 게임 모드 선택, 인증 메뉴
- **덱 빌더**: 10개 카드 구성 인터페이스
- **게임 결과**: 사용한 덱과 점수 표시
- **라운드 기록**: 최근 5라운드 히스토리
- **모달**: 로그인/회원가입 인터페이스

### JavaScript 클래스들 (`public/script.js`)

#### 🔹 RPSGame 클래스
```javascript
class RPSGame {
    constructor()                           // 게임 초기화
    initializeGame()                        // 이벤트 바인딩

    // 덱 관리
    addToDeck(choice)                       // 덱에 카드 추가
    removeFromDeck(index)                   // 덱에서 카드 제거
    clearDeck()                             // 덱 초기화
    generateRandomDeck()                    // 랜덤 덱 생성
    confirmDeck()                           // 덱 확정 및 게임 시작

    // 게임 플레이
    playBatchRound()                        // 배치 라운드 플레이
    processBatchResult(roundData)           // 게임 결과 처리

    // UI 업데이트
    updateDisplay()                         // 메인 디스플레이 업데이트
    updateHistoryDisplay()                  // 히스토리 표시 업데이트
    showDetailedRoundResult(gameData)       // 상세 결과 표시
}
```

#### 🔹 Deck 클래스 (클라이언트)
```javascript
class Deck {
    constructor(maxSize = 10)               // 덱 초기화
    addCard(choice)                         // 카드 추가
    removeCard(index)                       // 카드 제거
    clear()                                 // 덱 초기화
    generateRandom()                        // 랜덤 생성
    getNextCard()                           // 다음 카드
    validate()                              // 유효성 검사
    getStats()                              // 덱 통계
}
```

#### 🔹 AuthManager 클래스
```javascript
class AuthManager {
    constructor()                           // 인증 관리자 초기화

    // 인증 처리
    login()                                 // 로그인 처리
    register()                              // 회원가입 처리
    logout()                                // 로그아웃 처리
    checkAuthStatus()                       // 인증 상태 확인

    // UI 관리
    showModal(modalId)                      // 모달 표시
    hideModal(modalId)                      // 모달 숨김
    updateUI(isLoggedIn)                    // UI 상태 업데이트
    refreshUserInfo()                       // 사용자 정보 새로고침
}
```

### CSS 스타일링 (`public/styles.css`)

#### 🔹 주요 스타일 컴포넌트
- **반응형 레이아웃**: 모바일/데스크톱 지원
- **덱 빌더**: 카드 슬롯 시각화
- **게임 결과**: 색상 코딩 (승리/패배/무승부)
- **모달 디자인**: 로그인/회원가입 인터페이스
- **애니메이션**: 부드러운 전환 효과

---

## 🚀 주요 특징

### ✅ 완성된 기능들
1. **덱 기반 게임**: 10개 선택을 미리 구성하여 배치 게임
2. **3계층 아키텍처**: Repository-Service-Controller 패턴
3. **완전한 인증 시스템**: JWT + bcrypt 보안
4. **점수 시스템**: 연속/콤보/패배 점수 추적
5. **게임 기록**: MySQL 기반 사용자별 라운드 히스토리
6. **업적 시스템**: 게임 성취도 추적 및 보상
7. **반응형 UI**: 모바일/데스크톱 지원
8. **게스트 모드**: 비로그인 플레이 지원

### 🔄 확장 가능한 구조
1. **3계층 아키텍처**: Repository-Service-Controller 패턴
2. **Dependency Injection**: 수동 DI로 테스트 용이성 확보
3. **MySQL Connection Pool**: Singleton 패턴으로 연결 관리
4. **GameLogic 분리**: 순수 게임 로직과 DB 레이어 분리
5. **라우터 분리**: 인증/게임/업적 API 독립 관리
6. **클라이언트 클래스**: 재사용 가능한 컴포넌트

### 🎯 개발 우선순위
1. **PvP 모드**: WebSocket 기반 실시간 게임
2. **리더보드**: 전체 사용자 순위 시스템
3. **통계 시스템**: 상세한 개인 통계 화면
4. **테마 시스템**: 다크 모드, 커스텀 테마

---

**마지막 업데이트**: 2025-11-12
**버전**: v2.0 (3계층 아키텍처 + MySQL)