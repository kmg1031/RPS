# RESTful API v1 문서

## 개요

완전한 RESTful 원칙에 따라 재구성된 API v1 문서입니다.

### Base URL
```
http://localhost:3000/api/v1
```

### RESTful 원칙 준수

1. **리소스 중심 설계**: URL은 리소스를 나타냄 (동사가 아닌 명사 사용)
2. **HTTP 메서드 활용**: GET, POST, PUT, PATCH, DELETE
3. **상태 코드 표준화**: 적절한 HTTP 상태 코드 사용
4. **무상태성**: 각 요청은 독립적
5. **일관된 응답 형식**: JSON 기반 표준화된 응답

### 공통 응답 형식

#### 성공 응답
```json
{
  "success": true,
  "message": "optional message",
  "data": { ... }
}
```

#### 에러 응답
```json
{
  "success": false,
  "error": "error message",
  "errors": [ ... ] // validation errors (optional)
}
```

### HTTP 상태 코드

- `200 OK`: 성공적인 GET, PUT, PATCH, DELETE
- `201 Created`: 성공적인 POST (리소스 생성)
- `400 Bad Request`: 잘못된 요청 데이터
- `401 Unauthorized`: 인증 필요 또는 실패
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 리소스를 찾을 수 없음
- `409 Conflict`: 리소스 충돌 (중복 등)
- `500 Internal Server Error`: 서버 오류

---

## 인증 (Authentication)

모든 인증이 필요한 엔드포인트는 `Authorization` 헤더에 JWT 토큰이 필요합니다.

```
Authorization: Bearer <token>
```

---

## API 엔드포인트

## 1. 인증 (Auth)

### 1.1. 로그인

사용자 로그인 및 JWT 토큰 발급

- **URL**: `/api/v1/auth/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "username": "john_doe",
  "password": "password123"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "로그인에 성공했습니다.",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "john_doe",
      "email": "john@example.com"
    }
  }
}
```

**Error Response** (401 Unauthorized):
```json
{
  "success": false,
  "error": "사용자명 또는 비밀번호가 올바르지 않습니다."
}
```

### 1.2. 로그아웃

클라이언트 측에서 토큰 삭제 확인용 엔드포인트

- **URL**: `/api/v1/auth/logout`
- **Method**: `POST`
- **Auth Required**: No

**Response** (200 OK):
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

---

## 2. 사용자 (Users)

### 2.1. 회원가입 (사용자 생성)

새 사용자 계정 생성

- **URL**: `/api/v1/users`
- **Method**: `POST`
- **Auth Required**: No

**Request Body**:
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "error": "이미 존재하는 사용자명입니다."
}
```

### 2.2. 내 정보 조회

현재 로그인한 사용자 정보 조회

- **URL**: `/api/v1/users/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2025-01-01T00:00:00.000Z"
  }
}
```

### 2.3. 내 통계 조회

현재 사용자의 게임 통계

- **URL**: `/api/v1/users/me/stats`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `type`: `pve` (기본값) 또는 `streak`

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_games": 42,
    "total_wins": 25,
    "total_losses": 17,
    "win_rate": 0.595,
    "total_score": 1250
  }
}
```

---

## 3. 게임 (Games)

### 3.1. 게임 생성 및 플레이 (PVE 덱 모드)

10개 선택을 한 번에 제출하여 게임 플레이

- **URL**: `/api/v1/games`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "playerDeck": ["rock", "paper", "scissors", "rock", "paper", "scissors", "rock", "paper", "scissors", "rock"]
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "게임이 성공적으로 생성되었습니다.",
  "data": {
    "gameId": 123,
    "playerDeck": [...],
    "computerDeck": [...],
    "results": [...],
    "totalScore": 15,
    "finalStreak": 3,
    "totalWins": 6,
    "totalLosses": 2,
    "totalDraws": 2
  }
}
```

### 3.2. 게임 목록 조회 (히스토리)

사용자의 게임 히스토리 조회

- **URL**: `/api/v1/games`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `limit`: 조회할 게임 수 (기본값: 10)
  - `offset`: 시작 위치 (기본값: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "game_id": 123,
        "total_score": 15,
        "total_wins": 6,
        "total_losses": 2,
        "total_draws": 2,
        "played_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "count": 1
    }
  }
}
```

### 3.3. 특정 게임 조회

특정 게임의 상세 정보 조회

- **URL**: `/api/v1/games/:id`
- **Method**: `GET`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "game_id": 123,
    "player_deck": [...],
    "computer_deck": [...],
    "results": [...],
    "total_score": 15,
    "played_at": "2025-01-01T12:00:00.000Z"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "게임을 찾을 수 없습니다."
}
```

---

## 4. 연승제 게임 (Streak Games)

### 4.1. 연승제 게임 시작

새로운 연승제 게임 시작

- **URL**: `/api/v1/games/streak`
- **Method**: `POST`
- **Auth Required**: Yes

**Response** (201 Created):
```json
{
  "success": true,
  "message": "연승제 게임이 시작되었습니다.",
  "data": {
    "game_id": 456,
    "user_id": 1,
    "current_score": 0,
    "current_round": 1,
    "status": "playing"
  }
}
```

**Error Response** (409 Conflict):
```json
{
  "success": false,
  "error": "이미 진행 중인 게임이 있습니다."
}
```

### 4.2. 현재 게임 조회

현재 진행 중인 연승제 게임 조회

- **URL**: `/api/v1/games/streak/current`
- **Method**: `GET`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "game_id": 456,
    "current_score": 10,
    "current_round": 5,
    "status": "playing"
  }
}
```

**Error Response** (404 Not Found):
```json
{
  "success": false,
  "error": "진행 중인 게임이 없습니다."
}
```

### 4.3. 라운드 플레이

연승제 게임의 한 라운드 플레이

- **URL**: `/api/v1/games/streak/play`
- **Method**: `POST`
- **Auth Required**: Yes

**Request Body**:
```json
{
  "playerChoice": "rock"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "round": 5,
    "playerChoice": "rock",
    "computerChoice": "scissors",
    "result": "win",
    "scoreGained": 3,
    "currentScore": 13,
    "streak": 3
  }
}
```

### 4.4. 게임 포기

현재 진행 중인 게임 포기

- **URL**: `/api/v1/games/streak/current`
- **Method**: `DELETE`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "message": "게임을 포기했습니다.",
  "data": {
    "game_id": 456,
    "final_score": 13,
    "rounds_played": 5
  }
}
```

### 4.5. 연승제 게임 히스토리

연승제 게임 히스토리 조회

- **URL**: `/api/v1/games/streak/history`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `limit`: 조회할 게임 수 (기본값: 10)
  - `offset`: 시작 위치 (기본값: 0)

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "games": [
      {
        "game_id": 456,
        "final_score": 20,
        "rounds_played": 10,
        "status": "completed",
        "created_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "pagination": {
      "limit": 10,
      "offset": 0,
      "count": 1
    }
  }
}
```

---

## 5. 업적 (Achievements)

### 5.1. 전체 업적 목록

모든 업적 목록 조회 (인증 불필요)

- **URL**: `/api/v1/achievements`
- **Method**: `GET`
- **Auth Required**: No

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": 1,
        "name": "첫 승리",
        "description": "첫 번째 게임에서 승리하세요",
        "category": "basic"
      }
    ],
    "total": 1
  }
}
```

### 5.2. 내 업적 목록

현재 사용자의 업적 목록 조회

- **URL**: `/api/v1/achievements/me`
- **Method**: `GET`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": 1,
        "name": "첫 승리",
        "unlocked_at": "2025-01-01T12:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### 5.3. 업적 통계

사용자의 업적 통계

- **URL**: `/api/v1/achievements/me/stats`
- **Method**: `GET`
- **Auth Required**: Yes

**Response** (200 OK):
```json
{
  "success": true,
  "data": {
    "total_achievements": 20,
    "unlocked_achievements": 5,
    "completion_rate": 0.25
  }
}
```

---

## 기타

### Health Check

서버 상태 확인

- **URL**: `/health`
- **Method**: `GET`
- **Auth Required**: No

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2025-01-01T12:00:00.000Z"
}
```

---

## 마이그레이션 가이드

기존 API에서 v1으로 마이그레이션하는 방법:

### 기존 → v1 API 매핑

| 기존 API | v1 API | Method | 설명 |
|---------|--------|--------|------|
| `/api/auth/register` | `/api/v1/users` | POST | 회원가입 |
| `/api/auth/login` | `/api/v1/auth/login` | POST | 로그인 |
| `/api/auth/me` | `/api/v1/users/me` | GET | 내 정보 |
| `/api/pve-game/play` | `/api/v1/games` | POST | 게임 플레이 |
| `/api/pve-game/:id` | `/api/v1/games/:id` | GET | 게임 조회 |
| `/api/pve-game/history` | `/api/v1/games` | GET | 게임 히스토리 |
| `/api/pve-game/stats` | `/api/v1/users/me/stats?type=pve` | GET | 통계 |
| `/api/streak-game/start` | `/api/v1/games/streak` | POST | 연승제 시작 |
| `/api/streak-game/current` | `/api/v1/games/streak/current` | GET | 현재 게임 |
| `/api/streak-game/play` | `/api/v1/games/streak/play` | POST | 라운드 플레이 |
| `/api/streak-game/quit` | `/api/v1/games/streak/current` | DELETE | 게임 포기 |
| `/api/achievements/all` | `/api/v1/achievements` | GET | 전체 업적 |
| `/api/achievements/user` | `/api/v1/achievements/me` | GET | 내 업적 |

---

## 버전 관리

현재 버전: **v1**

- API URL에 버전 포함: `/api/v1/...`
- 향후 v2 릴리스 시 기존 v1 유지
- Breaking changes는 새 버전으로 릴리스

---

**Last Updated**: 2025-01-01
**Version**: 1.0.0
