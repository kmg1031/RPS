# 🗄️ RPS Game Database Documentation

가위바위보 게임의 데이터베이스 구조와 기능을 상세히 설명합니다.

## 📋 목차
- [데이터베이스 개요](#-데이터베이스-개요)
- [테이블 구조](#-테이블-구조)
- [테이블 관계](#-테이블-관계)
- [Database 클래스](#-database-클래스)
- [주요 기능별 메서드](#-주요-기능별-메서드)
- [데이터 흐름](#-데이터-흐름)

---

## 📊 데이터베이스 개요

### 기본 정보
- **DBMS**: MySQL 8.0+
- **연결 방식**: mysql2/promise 드라이버 (Connection Pool)
- **문자 인코딩**: utf8mb4 (완전한 유니코드 지원)
- **패턴**: Singleton 패턴으로 단일 인스턴스 관리

### 설계 철학
- **정규화**: 3NF 기준으로 설계
- **성능**: 인덱스 최적화 및 Connection Pool 활용
- **확장성**: 향후 기능 추가를 고려한 구조
- **무결성**: 외래키 제약 조건 및 체크 제약
- **싱글톤**: Database 클래스의 단일 인스턴스로 연결 관리

---

## 🏗️ 테이블 구조

### 👤 users (사용자 테이블)

```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,       -- 사용자 고유 ID
    username VARCHAR(50) UNIQUE NOT NULL,    -- 사용자명 (중복 불가)
    email VARCHAR(100) UNIQUE NOT NULL,      -- 이메일 (중복 불가)
    password_hash VARCHAR(255) NOT NULL,     -- bcrypt 해시된 비밀번호
    total_points INT NOT NULL DEFAULT 0,     -- 누적 획득 점수
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 회원가입 시간
    last_login TIMESTAMP NULL,               -- 마지막 로그인 시간
    INDEX idx_username (username),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 🔹 필드 상세 설명
- **`id`**: 자동 증가하는 기본키, 다른 테이블에서 외래키로 참조
- **`username`**: 3-20자 영문/숫자/밑줄, 로그인 시 사용
- **`email`**: 유효한 이메일 형식, 계정 복구용
- **`password_hash`**: bcrypt로 해시된 비밀번호 (saltRounds: 10)
- **`total_points`**: 모든 라운드에서 획득한 점수 합계
- **`created_at`**: 자동 설정되는 회원가입 타임스탬프
- **`last_login`**: 로그인 시마다 업데이트

#### 🔹 제약 조건
- `username` UNIQUE: 중복된 사용자명 불가
- `email` UNIQUE: 중복된 이메일 불가
- `total_points` NOT NULL DEFAULT 0: 기본값 0

### 🎯 round_history (라운드 기록 테이블)

```sql
CREATE TABLE round_history (
    id INT PRIMARY KEY AUTO_INCREMENT,       -- 라운드 고유 ID
    user_id INT,                             -- 사용자 ID (외래키)
    player_score INT NOT NULL DEFAULT 0,     -- 플레이어가 획득한 점수
    computer_score INT NOT NULL DEFAULT 0,   -- 컴퓨터 승리 횟수
    current_win_stack INT NOT NULL DEFAULT 0, -- 현재 연승 스택
    current_lose_stack INT NOT NULL DEFAULT 0, -- 현재 연패 스택
    current_choice VARCHAR(20),              -- 현재 선택 (연속 판단용)
    round_result ENUM('win', 'lose', 'draw', 'in_progress') NOT NULL DEFAULT 'in_progress', -- 라운드 결과
    games_played INT NOT NULL DEFAULT 0,     -- 플레이한 게임 수 (0-10)
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 라운드 시작 시간
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_round_result (round_result),
    INDEX idx_played_at (played_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 🔹 필드 상세 설명
- **`id`**: 라운드 고유 식별자
- **`user_id`**: users 테이블 참조, NULL 허용 (게스트 모드용)
- **`player_score`**: 연속/콤보 점수 시스템으로 획득한 점수
- **`computer_score`**: 컴퓨터가 승리한 게임 수 (단순 카운트)
- **`current_win_stack`**: 현재 연속 점수 (무승부+승리)
- **`current_lose_stack`**: 현재 연속 패배 점수
- **`current_choice`**: 마지막 선택, 선택 변경 감지용
- **`round_result`**: 라운드 최종 결과 상태
- **`games_played`**: 진행된 게임 수, 라운드 완료 판단용

#### 🔹 제약 조건
- `round_result` CHECK: 'win', 'lose', 'draw', 'in_progress' 중 하나만 허용
- `FOREIGN KEY`: user_id는 users.id를 참조

### 🎮 game_details (게임 상세 기록 테이블)

```sql
CREATE TABLE game_details (
    id INT PRIMARY KEY AUTO_INCREMENT,       -- 게임 고유 ID
    round_id INT,                            -- 라운드 ID (외래키)
    game_number INT NOT NULL,                -- 게임 순서 (1-10)
    player_choice VARCHAR(20) NOT NULL,      -- 플레이어 선택
    computer_choice VARCHAR(20) NOT NULL,    -- 컴퓨터 선택
    result ENUM('win', 'lose', 'draw') NOT NULL, -- 게임 결과
    points_earned INT NOT NULL DEFAULT 0,    -- 획득 점수
    win_stack_count INT NOT NULL DEFAULT 0,  -- 게임 시점 연승 스택
    lose_stack_count INT NOT NULL DEFAULT 0, -- 게임 시점 연패 스택
    stack_broken BOOLEAN NOT NULL DEFAULT 0, -- 연속 기록 깨짐 여부
    played_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 게임 시간
    FOREIGN KEY (round_id) REFERENCES round_history(id) ON DELETE CASCADE,
    INDEX idx_round_id (round_id),
    INDEX idx_played_at (played_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 🔹 필드 상세 설명
- **`id`**: 개별 게임 고유 식별자
- **`round_id`**: round_history 테이블 참조
- **`game_number`**: 라운드 내 게임 순서 (1-10)
- **`player_choice`**: 'rock', 'paper', 'scissors' 중 하나
- **`computer_choice`**: 컴퓨터의 선택
- **`result`**: 해당 게임의 승패 결과
- **`points_earned`**: 이 게임에서 획득한 점수 (콤보 점수)
- **`win_stack_count`**: 게임 시점의 연승 스택 수
- **`lose_stack_count`**: 게임 시점의 연패 스택 수
- **`stack_broken`**: 선택 변경으로 스택이 깨졌는지 여부

#### 🔹 제약 조건
- `result` CHECK: 'win', 'lose', 'draw' 중 하나만 허용
- `FOREIGN KEY`: round_id는 round_history.id를 참조

---

## 🔗 테이블 관계

### ERD (Entity Relationship Diagram)

```
┌─────────────────┐       1:N        ┌──────────────────┐       1:N        ┌─────────────────┐
│     users       │◄──────────────────│  round_history   │◄──────────────────│  game_details   │
├─────────────────┤                   ├──────────────────┤                   ├─────────────────┤
│ id (PK)         │                   │ id (PK)          │                   │ id (PK)         │
│ username        │                   │ user_id (FK)     │                   │ round_id (FK)   │
│ email           │                   │ player_score     │                   │ game_number     │
│ password_hash   │                   │ computer_score   │                   │ player_choice   │
│ total_points    │                   │ current_win_stack│                   │ computer_choice │
│ created_at      │                   │ current_lose_stack│                  │ result          │
│ last_login      │                   │ current_choice   │                   │ points_earned   │
└─────────────────┘                   │ round_result     │                   │ win_stack_count │
                                      │ games_played     │                   │ lose_stack_count│
                                      │ played_at        │                   │ stack_broken    │
                                      └──────────────────┘                   │ played_at       │
                                                                            └─────────────────┘
```

### 관계 설명

#### 👤 users ↔ round_history (1:N)
- **관계**: 한 사용자는 여러 라운드를 플레이할 수 있음
- **외래키**: `round_history.user_id` → `users.id`
- **제약**: CASCADE 삭제 (사용자 삭제시 라운드 기록도 삭제)

#### 🎯 round_history ↔ game_details (1:N)
- **관계**: 한 라운드는 정확히 10개의 게임을 포함
- **외래키**: `game_details.round_id` → `round_history.id`
- **제약**: CASCADE 삭제 (라운드 삭제시 게임 기록도 삭제)

### 데이터 무결성

#### 🔹 참조 무결성
- 외래키 제약으로 참조 무결성 보장
- 부모 테이블 삭제 시 자식 테이블 데이터도 함께 삭제

#### 🔹 도메인 무결성
- CHECK 제약으로 유효한 값만 허용
- NOT NULL 제약으로 필수 데이터 보장

#### 🔹 엔티티 무결성
- PRIMARY KEY로 각 레코드 고유성 보장
- UNIQUE 제약으로 중복 데이터 방지

---

## 💻 Database 클래스

### 클래스 구조

```javascript
class Database {
    constructor()                    // Singleton 인스턴스 반환
    static getInstance()             // Singleton 인스턴스 가져오기

    // 초기화 메서드
    async init()                     // Connection Pool 생성 및 테이블 생성
    async createTables()             // 테이블 생성
    async createAchievementTables()  // 업적 시스템 테이블 생성

    // 사용자 관리
    async createUser(...)            // 사용자 생성
    async getUserByUsername(...)     // 사용자명으로 조회
    async getUserByEmail(...)        // 이메일로 조회
    async getUserById(...)           // ID로 조회
    async updateLastLogin(...)       // 마지막 로그인 시간 업데이트

    // 포인트 관리
    async updateUserPoints(...)      // 사용자 포인트 증가
    async getUserPoints(...)         // 사용자 포인트 조회
    async setUserPoints(...)         // 사용자 포인트 설정

    // 라운드 관리
    async startNewRound(...)         // 새 라운드 시작
    async getCurrentRound(...)       // 진행 중인 라운드 조회
    async updateRoundProgress(...)   // 라운드 진행 상황 업데이트

    // 게임 기록
    async saveGameInRound(...)       // 게임 결과 저장
    async getRoundGames(...)         // 라운드의 게임들 조회

    // 통계 및 히스토리
    async getUserRoundHistory(...)   // 사용자 라운드 기록
    async getUserStats(...)          // 사용자 통계

    close()                          // DB 연결 종료
}
```

### 초기화 과정

#### 🔹 싱글톤 패턴
```javascript
// 사용 예시
const db = Database.getInstance(); // 항상 같은 인스턴스 반환
await db.init();                   // 최초 1회만 실행

// 여러 모듈에서 사용해도 동일한 인스턴스
const db1 = Database.getInstance();
const db2 = Database.getInstance();
console.log(db1 === db2); // true
```

#### 🔹 데이터베이스 연결
```javascript
async init() {
    // 1. 이미 초기화된 경우 재사용
    // 2. MySQL Connection Pool 생성
    // 3. 연결 테스트
    // 4. createTables() 호출
}
```

#### 🔹 테이블 생성
```javascript
async createTables() {
    // 1. users 테이블 생성 (InnoDB)
    // 2. round_history 테이블 생성 (InnoDB)
    // 3. game_details 테이블 생성 (InnoDB)
    // 4. achievements 시스템 테이블 생성 (InnoDB)
}
```

---

## 🛠️ 주요 기능별 메서드

### 👤 사용자 관리

#### 🔹 사용자 생성
```javascript
async createUser(username, email, passwordHash)
```
- **목적**: 새 사용자 계정 생성
- **매개변수**: 사용자명, 이메일, 해시된 비밀번호
- **반환**: `{ id, username, email }`
- **에러**: 중복 사용자명/이메일 시 UNIQUE 제약 위반

#### 🔹 사용자 조회
```javascript
async getUserByUsername(username)  // 로그인용
async getUserByEmail(email)        // 중복 검사용
async getUserById(id)              // 인증 후 정보 조회용
```

#### 🔹 로그인 시간 업데이트
```javascript
async updateLastLogin(userId)
```
- **목적**: 로그인 성공 시 타임스탬프 기록
- **활용**: 사용자 활동 통계, 휴면 계정 관리

### 💰 포인트 관리

#### 🔹 포인트 증가
```javascript
async updateUserPoints(userId, points)
```
- **목적**: 게임에서 획득한 점수만큼 누적 포인트 증가
- **방식**: `total_points = total_points + points`
- **트리거**: 라운드 완료 시 자동 호출

#### 🔹 포인트 조회/설정
```javascript
async getUserPoints(userId)         // 현재 포인트 조회
async setUserPoints(userId, total)  // 포인트 직접 설정 (관리자용)
```

### 🎯 라운드 관리

#### 🔹 새 라운드 시작
```javascript
async startNewRound(userId)
```
- **동작**: round_history 테이블에 새 레코드 생성
- **초기값**: 모든 점수 0, round_result='in_progress'
- **반환**: `{ id }` (새 라운드 ID)

#### 🔹 진행 중인 라운드 조회
```javascript
async getCurrentRound(userId)
```
- **목적**: 사용자의 미완료 라운드 확인
- **조건**: `round_result = 'in_progress'`
- **활용**: 게임 재개, 중복 라운드 방지

#### 🔹 라운드 진행 상황 업데이트
```javascript
async updateRoundProgress(roundId, playerScore, computerScore,
                         currentWinStack, currentLoseStack,
                         currentChoice, gamesPlayed)
```
- **목적**: 게임 진행에 따른 라운드 상태 업데이트
- **자동 판정**: `gamesPlayed === 10`일 때 라운드 결과 자동 설정
- **결과 판정**: `playerScore > computerScore` → 'win'

### 🎮 게임 기록

#### 🔹 개별 게임 저장
```javascript
async saveGameInRound(roundId, gameNumber, playerChoice, computerChoice,
                     result, pointsEarned, winStackCount, loseStackCount, stackBroken)
```
- **목적**: 라운드 내 각 게임의 상세 기록 저장
- **순서**: `gameNumber` 1-10으로 순차 저장
- **연속 추적**: 스택 카운트와 깨짐 여부 기록

#### 🔹 라운드 게임 조회
```javascript
async getRoundGames(roundId)
```
- **목적**: 특정 라운드의 모든 게임 기록 조회
- **정렬**: `game_number` 순으로 정렬
- **활용**: 게임 재현, 상세 분석

### 📊 통계 및 히스토리

#### 🔹 사용자 라운드 기록
```javascript
async getUserRoundHistory(userId, limit = 10)
```
- **목적**: 사용자의 최근 라운드 기록과 게임 상세 정보
- **특징**: JSON 집계 함수로 게임 정보를 중첩 객체로 반환
- **정렬**: 최신 라운드부터 내림차순

#### 🔹 사용자 통계
```javascript
async getUserStats(userId)
```
- **집계 정보**:
  - `totalRounds`: 총 플레이한 라운드 수
  - `roundWins/roundLosses/roundDraws`: 라운드 승/패/무승부
  - `roundWinRate`: 라운드 승률 (%)
  - `totalPlayerPoints`: 총 획득 점수
  - `averagePlayerScore`: 평균 점수

---

## 🔄 데이터 흐름

### 회원가입 플로우
```
1. 사용자 입력 (username, email, password)
   ↓
2. 유효성 검사 (중복 검사 포함)
   ↓
3. 비밀번호 해싱 (bcrypt)
   ↓
4. createUser() 호출
   ↓
5. users 테이블에 레코드 생성
   ↓
6. JWT 토큰 생성 및 반환
```

### 로그인 플로우
```
1. 사용자 입력 (username, password)
   ↓
2. getUserByUsername() 호출
   ↓
3. 비밀번호 검증 (bcrypt.compare)
   ↓
4. updateLastLogin() 호출
   ↓
5. JWT 토큰 생성 및 반환
```

### 라운드 게임 플로우
```
1. 클라이언트에서 덱 전송 (10개 선택)
   ↓
2. startNewRound() 호출 → 새 라운드 레코드 생성
   ↓
3. 10개 게임 순차 처리:
   - 승패 판정
   - 점수 계산 (연속/콤보 시스템)
   - saveGameInRound() 호출
   ↓
4. updateRoundProgress() 호출 → 라운드 완료 처리
   ↓
5. updateUserPoints() 호출 → 누적 포인트 증가
   ↓
6. 클라이언트에 결과 반환
```

### 데이터 조회 플로우
```
현재 라운드 조회:
getCurrentRound() → round_history 테이블 쿼리

게임 기록 조회:
getRoundGames() → game_details 테이블 쿼리

사용자 통계 조회:
getUserStats() → 집계 쿼리 실행

히스토리 조회:
getUserRoundHistory() → JSON 집계로 중첩 데이터 반환
```

---

## 🔧 성능 최적화

### 인덱스 전략
```sql
-- 테이블 생성 시 자동으로 인덱스 추가됨
-- users 테이블
INDEX idx_username (username)
INDEX idx_email (email)

-- round_history 테이블
INDEX idx_user_id (user_id)
INDEX idx_round_result (round_result)
INDEX idx_played_at (played_at)

-- game_details 테이블
INDEX idx_round_id (round_id)
INDEX idx_played_at (played_at)
```

### 쿼리 최적화
- **조건절 최적화**: WHERE 절에서 인덱스 컬럼 우선 사용
- **서브쿼리 활용**: 라운드별 게임 상세 정보 조회
- **집계 함수**: GROUP BY와 집계 함수로 통계 계산
- **LIMIT 사용**: 대용량 데이터 조회 시 페이징 처리

### Connection Pool 관리
- **Pool 생성**: mysql2/promise의 createPool 사용
- **자동 관리**: Pool이 자동으로 연결 재사용 및 관리
- **Singleton 패턴**: 애플리케이션 전체에서 단일 Pool 인스턴스 사용
- **정리 작업**: `close()` 메서드로 Pool 종료 (애플리케이션 종료 시)

---

## 📌 주요 변경 사항

### v2.0 - MySQL + Singleton 패턴 (2025-11-12)
- **DBMS 변경**: SQLite → MySQL 8.0+
- **패턴 도입**: Singleton 패턴으로 단일 인스턴스 관리
- **Connection Pool**: mysql2/promise의 Connection Pool 활용
- **인코딩**: utf8mb4로 완전한 유니코드 지원
- **스토리지 엔진**: InnoDB로 트랜잭션 지원
- **업적 시스템**: achievements, user_achievements, achievement_logs 테이블 추가

### v1.0 - SQLite 기반 (2025-09-16)
- 초기 버전: SQLite3 기반 구조

---

**마지막 업데이트**: 2025-11-12