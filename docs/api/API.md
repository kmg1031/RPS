# 🎮 RPS Game API Documentation

가위바위보 게임 서버 API 문서입니다.

## 📋 목차
- [인증 API](#-인증-api)
- [게임 API](#-게임-api)
- [에러 처리](#-에러-처리)
- [데이터 타입](#-데이터-타입)

---

## 🔐 인증 API

### POST /api/auth/register
회원가입

#### Request Body
```json
{
  "username": "string", // 3-20자, 영문/숫자/밑줄만
  "email": "string",    // 유효한 이메일 형식
  "password": "string"  // 최소 6자, 영문+숫자 포함
}
```

#### Response
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "total_points": 0,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### POST /api/auth/login
로그인

#### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

#### Response
```json
{
  "success": true,
  "token": "JWT_TOKEN",
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "total_points": 150,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### GET /api/auth/me
사용자 정보 조회 (인증 필요)

#### Headers
```
Authorization: Bearer JWT_TOKEN
```

#### Response
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "player1",
    "email": "player1@example.com",
    "total_points": 150,
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

## 🎮 게임 API

### POST /api/play-round
라운드 플레이 (10게임 배치 처리)

#### Headers (선택사항)
```
Authorization: Bearer JWT_TOKEN  // 로그인 시 게임 기록 저장
```

#### Request Body
```json
{
  "playerDeck": [
    "rock", "paper", "scissors", "rock", "paper",
    "scissors", "rock", "paper", "scissors", "rock"
  ],
  "computerDeck": [  // 선택사항, 없으면 랜덤 생성
    "scissors", "rock", "paper", "scissors", "rock",
    "paper", "scissors", "rock", "paper", "scissors"
  ]
}
```

#### Response (게스트)
```json
{
  "success": true,
  "roundResult": "win",        // "win" | "lose" | "draw"
  "playerScore": 15,           // 플레이어가 얻은 점수
  "computerScore": 3,          // 컴퓨터 승리 횟수
  "maxStreakScore": 4,         // 최대 연속 점수
  "maxComboScore": 3,          // 최대 콤보 점수
  "gameResults": [
    {
      "gameNumber": 1,
      "playerChoice": "rock",
      "computerChoice": "scissors",
      "result": "win",         // "win" | "lose" | "draw"
      "pointsEarned": 1,       // 이번 게임에서 얻은 점수
      "streakScore": 1,        // 현재 연속 점수 (무승부+승리)
      "comboScore": 1,         // 현재 콤보 점수 (승리만)
      "loseScore": 0,          // 현재 패배 점수
      "stackBroken": false     // 연속 기록 깨짐 여부
    }
    // ... 10개 게임 결과
  ],
  "playerDeck": ["rock", "paper", ...],
  "computerDeck": ["scissors", "rock", ...],
  "saved": false,              // 게스트 모드
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### Response (로그인)
```json
{
  "success": true,
  "roundResult": "win",
  "playerScore": 15,
  "computerScore": 3,
  "maxStreakScore": 4,
  "maxComboScore": 3,
  "gameResults": [...],        // 위와 동일
  "playerDeck": [...],
  "computerDeck": [...],
  "saved": true,               // 데이터베이스에 저장됨
  "roundId": 123,              // 라운드 ID
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/play-deck-vs-deck
덱 vs 덱 게임 (PvP 준비용)

#### Headers (선택사항)
```
Authorization: Bearer JWT_TOKEN
```

#### Request Body
```json
{
  "playerDeck": ["rock", "paper", "scissors", ...],   // 필수
  "computerDeck": ["scissors", "rock", "paper", ...]  // 필수
}
```

#### Response
라운드 플레이와 동일한 형식

### GET /api/current-round
현재 진행 중인 라운드 조회 (인증 필요)

#### Headers
```
Authorization: Bearer JWT_TOKEN
```

#### Response (진행 중인 라운드 있음)
```json
{
  "success": true,
  "currentRound": {
    "id": 123,
    "user_id": 1,
    "player_score": 8,
    "computer_score": 2,
    "current_win_stack": 3,
    "current_lose_stack": 0,
    "current_choice": "rock",
    "games_played": 7,
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "games": [
    {
      "id": 456,
      "round_id": 123,
      "game_number": 1,
      "player_choice": "rock",
      "computer_choice": "scissors",
      "result": "win",
      "points_earned": 1,
      "win_stack_count": 1,
      "lose_stack_count": 0,
      "stack_broken": false,
      "created_at": "2024-01-01T00:00:00.000Z"
    }
    // ... 진행된 게임들
  ]
}
```

#### Response (진행 중인 라운드 없음)
```json
{
  "success": true,
  "currentRound": null,
  "message": "진행 중인 라운드가 없습니다."
}
```

---

## ⚠️ 에러 처리

### 공통 에러 형식
```json
{
  "success": false,
  "message": "에러 메시지",
  "errors": [          // 유효성 검사 에러 시
    {
      "field": "username",
      "msg": "사용자명은 3-20자여야 합니다."
    }
  ]
}
```

### HTTP 상태 코드
- `200` - 성공
- `400` - 잘못된 요청 (유효성 검사 실패)
- `401` - 인증 실패
- `403` - 권한 없음
- `404` - 리소스 없음
- `500` - 서버 내부 오류

### 인증 에러
```json
{
  "success": false,
  "message": "토큰이 유효하지 않습니다."
}
```

### 유효성 검사 에러
```json
{
  "success": false,
  "message": "유효하지 않은 덱입니다. 10개의 유효한 선택이 필요합니다."
}
```

---

## 📝 데이터 타입

### 게임 선택 (Choice)
```typescript
type Choice = "rock" | "paper" | "scissors"
```

### 게임 결과 (Result)
```typescript
type GameResult = "win" | "lose" | "draw"
```

### 플레이어 덱 (PlayerDeck)
```typescript
type PlayerDeck = Choice[10]  // 정확히 10개의 선택
```

### 점수 계산 규칙
- **연속 점수**: 무승부 + 승리로 연속 증가
- **콤보 점수**: 승리로만 연속 증가
- **패배 점수**: 패배로 연속 증가
- **선택 변경 시**: 모든 연속 점수 초기화
- **얻는 점수**: 현재 콤보 점수와 동일

### 인증 토큰
- **형식**: JWT (JSON Web Token)
- **헤더**: `Authorization: Bearer {token}`
- **만료**: 24시간
- **필수 API**: `/api/auth/me`, `/api/current-round`
- **선택 API**: `/api/play-round`, `/api/play-deck-vs-deck`

---

## 🚀 사용 예제

### JavaScript 클라이언트
```javascript
// 회원가입
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'player1',
    email: 'player1@example.com',
    password: 'password123'
  })
});

// 라운드 플레이 (로그인)
const playResponse = await fetch('/api/play-round', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    playerDeck: ['rock', 'paper', 'scissors', 'rock', 'paper',
                'scissors', 'rock', 'paper', 'scissors', 'rock']
  })
});
```

---

**마지막 업데이트**: 2025-09-16