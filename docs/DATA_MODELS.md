# 📊 RPS Game Data Models

프로젝트에서 사용하는 모든 데이터 모델과 타입 정의

## 📋 목차
- [사용자 관련](#사용자-관련)
- [게임 관련](#게임-관련)
- [라운드 관련](#라운드-관련)
- [업적 관련](#업적-관련)
- [API 요청/응답](#api-요청응답)
- [에러 응답](#에러-응답)

---

## 👤 사용자 관련

### User (사용자)
```typescript
interface User {
  id: number;                    // 사용자 고유 ID
  username: string;              // 사용자명 (3-20자)
  email: string;                 // 이메일
  password_hash: string;         // bcrypt 해시된 비밀번호
  total_points: number;          // 누적 획득 점수
  created_at: Date;              // 회원가입 시간
  last_login: Date | null;       // 마지막 로그인 시간
}
```

### UserInfo (사용자 정보 - 비밀번호 제외)
```typescript
interface UserInfo {
  id: number;
  username: string;
  email: string;
  total_points: number;
  created_at: Date;
  last_login: Date | null;
}
```

### JWT Payload
```typescript
interface JWTPayload {
  userId: number;
  username: string;
  iat: number;                   // 발급 시간
  exp: number;                   // 만료 시간
}
```

---

## 🎮 게임 관련

### Choice (선택)
```typescript
type Choice = 'rock' | 'paper' | 'scissors';
```

### GameResult (게임 결과)
```typescript
type GameResult = 'win' | 'lose' | 'draw';
```

### Deck (덱)
```typescript
interface Deck {
  choices: Choice[];             // 10개의 선택 배열
  currentIndex: number;          // 현재 인덱스
  size: number;                  // 덱 크기 (항상 10)
}
```

### GameDetail (개별 게임 상세)
```typescript
interface GameDetail {
  id: number;                    // 게임 고유 ID
  round_id: number;              // 라운드 ID
  game_number: number;           // 게임 순서 (1-10)
  player_choice: Choice;         // 플레이어 선택
  computer_choice: Choice;       // 컴퓨터 선택
  result: GameResult;            // 게임 결과
  points_earned: number;         // 획득 점수
  win_stack_count: number;       // 게임 시점 연승 스택
  lose_stack_count: number;      // 게임 시점 연패 스택
  stack_broken: boolean;         // 스택 깨짐 여부
  played_at: Date;               // 게임 시간
}
```

### GameSummary (게임 결과 요약 - 클라이언트용)
```typescript
interface GameSummary {
  gameNumber: number;            // 게임 순서
  playerChoice: Choice;          // 플레이어 선택
  computerChoice: Choice;        // 컴퓨터 선택
  result: GameResult;            // 게임 결과
  pointsEarned: number;          // 획득 점수
  streakScore: number;           // 연속 점수 (무승부 포함)
  comboScore: number;            // 콤보 점수 (승리만)
  loseScore: number;             // 연패 점수
  stackBroken: boolean;          // 스택 깨짐 여부
}
```

---

## 🏆 라운드 관련

### RoundHistory (라운드 기록)
```typescript
interface RoundHistory {
  id: number;                    // 라운드 고유 ID
  user_id: number;               // 사용자 ID
  player_score: number;          // 플레이어 총 점수
  computer_score: number;        // 컴퓨터 승리 횟수
  current_win_stack: number;     // 현재 연승 스택
  current_lose_stack: number;    // 현재 연패 스택
  current_choice: Choice | null; // 현재 선택
  round_result: RoundResult;     // 라운드 결과
  games_played: number;          // 플레이한 게임 수 (0-10)
  played_at: Date;               // 라운드 시작 시간
}
```

### RoundResult (라운드 결과)
```typescript
type RoundResult = 'win' | 'lose' | 'draw' | 'in_progress';
```

### RoundData (라운드 데이터 - GameLogic 반환값)
```typescript
interface RoundData {
  roundResult: RoundResult;      // 라운드 최종 결과
  playerScore: number;           // 플레이어 총 점수
  computerScore: number;         // 컴퓨터 승리 횟수
  maxStreakScore: number;        // 최대 연속 점수
  maxComboScore: number;         // 최대 콤보 점수
  gameResults: GameSummary[];    // 10개 게임 결과
  playerDeck: Choice[];          // 플레이어 덱
  computerDeck: Choice[];        // 컴퓨터 덱
}
```

### RoundProgress (라운드 진행 상황)
```typescript
interface RoundProgress {
  roundResult: RoundResult;
  gamesPlayed: number;
  playerScore: number;
  computerScore: number;
  currentWinStack: number;
  currentLoseStack: number;
}
```

---

## 🏅 업적 관련

### Achievement (업적)
```typescript
interface Achievement {
  id: number;                    // 업적 ID
  achievement_key: string;       // 업적 키 (고유)
  name: string;                  // 업적 이름
  description: string;           // 업적 설명
  category: AchievementCategory; // 업적 카테고리
  icon: string;                  // 아이콘 이모지
  target_value: number;          // 목표 값
  reward_points: number;         // 보상 포인트
  difficulty: Difficulty;        // 난이도
  is_hidden: boolean;            // 숨김 여부
  is_active: boolean;            // 활성화 여부
  created_at: Date;              // 생성 시간
}
```

### AchievementCategory (업적 카테고리)
```typescript
type AchievementCategory =
  | 'streak'      // 연속 기록
  | 'combo'       // 콤보 기록
  | 'round'       // 라운드 관련
  | 'total'       // 누적 기록
  | 'special';    // 특수 업적
```

### Difficulty (난이도)
```typescript
type Difficulty = 'easy' | 'normal' | 'hard' | 'legendary';
```

### UserAchievement (사용자 업적 진행도)
```typescript
interface UserAchievement {
  id: number;
  user_id: number;
  achievement_id: number;
  current_value: number;         // 현재 진행도
  is_completed: boolean;         // 완료 여부
  completed_at: Date | null;     // 완료 시간
  notified: boolean;             // 알림 전송 여부
  created_at: Date;
  updated_at: Date;
}
```

### UserAchievementWithDetails (상세 정보 포함)
```typescript
interface UserAchievementWithDetails extends Achievement {
  current_value: number;
  is_completed: boolean;
  completed_at: Date | null;
  notified: boolean;
  progress_percentage: number;   // 진행률 (0-100)
}
```

### AchievementStats (업적 통계)
```typescript
interface AchievementStats {
  total_achievements: number;    // 전체 업적 수
  completed_count: number;       // 완료한 업적 수
  total_points_earned: number;   // 획득한 총 포인트
  easy_completed: number;        // 완료한 쉬운 업적
  normal_completed: number;      // 완료한 보통 업적
  hard_completed: number;        // 완료한 어려운 업적
  legendary_completed: number;   // 완료한 전설 업적
  completion_rate: number;       // 완료율 (0-100)
}
```

---

## 📡 API 요청/응답

### Auth API

#### POST /api/auth/register (회원가입)
```typescript
// Request
interface RegisterRequest {
  username: string;              // 3-20자, 영문/숫자/밑줄
  email: string;                 // 유효한 이메일
  password: string;              // 6자 이상
}

// Response
interface RegisterResponse {
  success: boolean;
  message: string;
  token: string;                 // JWT 토큰
  user: {
    id: number;
    username: string;
    email: string;
  };
}
```

#### POST /api/auth/login (로그인)
```typescript
// Request
interface LoginRequest {
  username: string;
  password: string;
}

// Response
interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    username: string;
  };
}
```

#### GET /api/auth/me (사용자 정보)
```typescript
// Response
interface UserInfoResponse {
  success: boolean;
  user: UserInfo;
}
```

### Game API

#### POST /api/game/play-round (라운드 플레이)
```typescript
// Request
interface PlayRoundRequest {
  playerDeck: Choice[];          // 10개 선택 배열
  computerDeck?: Choice[];       // 선택사항
}

// Response
interface PlayRoundResponse {
  success: boolean;
  saved: boolean;                // DB 저장 여부
  roundResult: RoundResult;
  playerScore: number;
  computerScore: number;
  maxStreakScore: number;
  maxComboScore: number;
  gameResults: GameSummary[];
  playerDeck: Choice[];
  computerDeck: Choice[];
}
```

#### GET /api/game/current-round (진행 중인 라운드)
```typescript
// Response
interface CurrentRoundResponse {
  success: boolean;
  currentRound: RoundHistory | null;
  games: GameDetail[];
  message?: string;
}
```

#### GET /api/game/stats (사용자 통계)
```typescript
// Response
interface UserStatsResponse {
  success: boolean;
  stats: {
    totalRounds: number;         // 총 라운드 수
    roundWins: number;           // 라운드 승리
    roundLosses: number;         // 라운드 패배
    roundDraws: number;          // 라운드 무승부
    roundWinRate: string;        // 승률 (%)
    totalGamesPlayed: number;    // 총 게임 수
    totalPlayerPoints: number;   // 총 획득 점수
    totalComputerPoints: number; // 컴퓨터 총 점수
    averagePlayerScore: string;  // 평균 점수
    totalPointsDifference: number; // 점수 차이
  };
}
```

#### GET /api/game/history (게임 히스토리)
```typescript
// Query Parameters
interface HistoryQuery {
  limit?: number;                // 기본값: 10
}

// Response
interface HistoryResponse {
  success: boolean;
  history: Array<RoundHistory & {
    games: GameDetail[];
  }>;
}
```

### Achievement API

#### GET /api/achievements/user (사용자 업적)
```typescript
// Response
interface UserAchievementsResponse {
  success: boolean;
  achievements: UserAchievementWithDetails[];
}
```

#### GET /api/achievements/stats (업적 통계)
```typescript
// Response
interface AchievementStatsResponse {
  success: boolean;
  stats: AchievementStats;
}
```

#### GET /api/achievements/all (전체 업적)
```typescript
// Response
interface AllAchievementsResponse {
  success: boolean;
  achievements: Achievement[];
}
```

---

## ❌ 에러 응답

### ErrorResponse (표준 에러 응답)
```typescript
interface ErrorResponse {
  success: false;
  message: string;               // 사용자 친화적 에러 메시지
  error?: string;                // 상세 에러 정보 (개발 모드)
}
```

### HTTP 상태 코드

| 코드 | 의미 | 사용 사례 |
|------|------|-----------|
| 200 | OK | 성공 |
| 201 | Created | 리소스 생성 (회원가입) |
| 400 | Bad Request | 잘못된 요청 (유효성 검증 실패) |
| 401 | Unauthorized | 인증 실패 (토큰 없음/만료) |
| 404 | Not Found | 리소스 없음 |
| 500 | Internal Server Error | 서버 오류 |

---

## 🔧 유틸리티 타입

### PaginationQuery (페이지네이션 쿼리)
```typescript
interface PaginationQuery {
  page?: number;                 // 페이지 번호 (1부터 시작)
  limit?: number;                // 페이지당 항목 수
}
```

### PaginatedResponse (페이지네이션 응답)
```typescript
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;               // 전체 항목 수
    page: number;                // 현재 페이지
    limit: number;               // 페이지당 항목 수
    totalPages: number;          // 전체 페이지 수
  };
}
```

---

## 📊 데이터 검증 규칙

### User 검증
```javascript
{
  username: {
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    message: '영문, 숫자, 밑줄만 사용 가능'
  },
  email: {
    format: 'email',
    message: '유효한 이메일 주소를 입력하세요'
  },
  password: {
    minLength: 6,
    message: '비밀번호는 6자 이상이어야 합니다'
  }
}
```

### Deck 검증
```javascript
{
  playerDeck: {
    type: 'array',
    length: 10,
    items: {
      enum: ['rock', 'paper', 'scissors']
    },
    message: '덱은 10개의 유효한 선택을 포함해야 합니다'
  }
}
```

---

## 💡 타입 가드 (JavaScript)

### Choice 검증
```javascript
function isValidChoice(choice) {
  return ['rock', 'paper', 'scissors'].includes(choice);
}
```

### Deck 검증
```javascript
function isValidDeck(deck) {
  return Array.isArray(deck)
    && deck.length === 10
    && deck.every(choice => isValidChoice(choice));
}
```

### GameResult 검증
```javascript
function isValidGameResult(result) {
  return ['win', 'lose', 'draw'].includes(result);
}
```

---

## 🔄 TypeScript 마이그레이션 시

프로젝트를 TypeScript로 마이그레이션할 경우:

1. `types/` 디렉토리 생성
2. 각 도메인별로 타입 파일 분리
   - `types/user.types.ts`
   - `types/game.types.ts`
   - `types/round.types.ts`
   - `types/achievement.types.ts`
   - `types/api.types.ts`
3. JSDoc에서 TypeScript로 전환
4. strict 모드 활성화

---

## 📝 JSDoc 사용 예시 (현재)

```javascript
/**
 * 사용자 정보
 * @typedef {Object} User
 * @property {number} id - 사용자 ID
 * @property {string} username - 사용자명
 * @property {string} email - 이메일
 * @property {number} total_points - 총 점수
 */

/**
 * 사용자 조회
 * @param {number} userId - 사용자 ID
 * @returns {Promise<User>} 사용자 정보
 */
async function getUserById(userId) {
  // ...
}
```

---

**마지막 업데이트**: 2025-11-12
**버전**: v2.0
