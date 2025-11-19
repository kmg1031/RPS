# 🏗️ RPS Game Architecture

가위바위보 게임의 3계층 아키텍처(Repository-Service-Controller) 구조를 설명합니다.

## 📋 목차
- [아키텍처 개요](#아키텍처-개요)
- [레이어 구조](#레이어-구조)
- [디렉토리 구조](#디렉토리-구조)
- [의존성 주입](#의존성-주입)
- [데이터 흐름](#데이터-흐름)

---

## 🎯 아키텍처 개요

### 설계 원칙
- **관심사의 분리 (Separation of Concerns)**: 각 레이어가 명확한 책임을 가짐
- **의존성 역전 (Dependency Inversion)**: 상위 레이어가 하위 레이어에 의존
- **단일 책임 (Single Responsibility)**: 각 클래스가 하나의 책임만 가짐
- **테스트 가능성 (Testability)**: 각 레이어를 독립적으로 테스트 가능

### 레이어 구조

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│        (Controllers & Routes)           │
│  - HTTP 요청/응답 처리                   │
│  - 입력 검증                            │
│  - 에러 핸들링                           │
└──────────────┬──────────────────────────┘
               │ depends on
┌──────────────▼──────────────────────────┐
│          Business Logic Layer           │
│             (Services)                  │
│  - 비즈니스 로직 처리                    │
│  - 트랜잭션 관리                         │
│  - 데이터 가공                           │
└──────────────┬──────────────────────────┘
               │ depends on
┌──────────────▼──────────────────────────┐
│         Data Access Layer               │
│          (Repositories)                 │
│  - 데이터베이스 CRUD                     │
│  - SQL 쿼리 실행                         │
│  - 데이터 매핑                           │
└──────────────┬──────────────────────────┘
               │ depends on
┌──────────────▼──────────────────────────┐
│            Database                     │
│   (MySQL with Singleton Pattern)        │
└─────────────────────────────────────────┘
```

---

## 📁 디렉토리 구조

```
c:\nodeJS\RPS\
├── app.js                    # 애플리케이션 진입점, 의존성 주입
│
├── database.js               # Database 싱글톤 클래스
│
├── repositories/             # Repository (DAO) 레이어
│   ├── UserRepository.js     # 사용자 데이터 액세스
│   ├── RoundRepository.js    # 라운드 데이터 액세스
│   ├── GameRepository.js     # 게임 데이터 액세스
│   └── AchievementRepository.js # 업적 데이터 액세스
│
├── services/                 # Service 레이어
│   ├── UserService.js        # 사용자 비즈니스 로직
│   ├── GameService.js        # 게임 비즈니스 로직
│   └── AchievementService.js # 업적 비즈니스 로직
│
├── controllers/              # Controller 레이어
│   ├── AuthController.js     # 인증 컨트롤러
│   ├── GameController.js     # 게임 컨트롤러
│   └── AchievementController.js # 업적 컨트롤러
│
├── routes/                   # 라우터 정의
│   ├── auth.routes.js        # 인증 라우트
│   ├── game.routes.js        # 게임 라우트
│   └── achievement.routes.js # 업적 라우트
│
├── game.js                   # GameLogic 클래스 (순수 게임 규칙)
├── deck.js                   # Deck 클래스
├── auth.js                   # JWT 인증 미들웨어
│
└── docs/                     # 문서
    ├── architecture/         # 아키텍처 문서
    ├── api/                  # API 문서
    ├── game/                 # 게임 규칙 문서
    └── database/             # 데이터베이스 문서
```

---

## 🔄 레이어별 상세 설명

### 1. Repository (DAO) 레이어

**역할**: 데이터베이스 직접 접근 및 CRUD 작업

**특징**:
- SQL 쿼리만 담당
- 비즈니스 로직 없음
- 데이터 매핑만 수행

**예시**: `UserRepository.js`
```javascript
class UserRepository {
    constructor(db) {
        this.db = db;
    }

    async findByUsername(username) {
        const [rows] = await this.db.pool.query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );
        return rows[0];
    }

    async create(username, email, passwordHash) {
        const [result] = await this.db.pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return { id: result.insertId, username, email };
    }
}
```

### 2. Service 레이어

**역할**: 비즈니스 로직 처리

**특징**:
- Repository 호출
- 데이터 가공 및 검증
- 트랜잭션 관리
- 외부 서비스 호출

**예시**: `UserService.js`
```javascript
class UserService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(username, email, password) {
        // 중복 검사 (비즈니스 로직)
        const existingUser = await this.userRepository.findByUsername(username);
        if (existingUser) {
            throw new Error('이미 존재하는 사용자명입니다.');
        }

        // 비밀번호 해싱 (비즈니스 로직)
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = await this.userRepository.create(username, email, hashedPassword);

        // JWT 토큰 생성 (비즈니스 로직)
        const token = this.generateToken(user.id, username);

        return { user, token };
    }
}
```

### 3. Controller 레이어

**역할**: HTTP 요청/응답 처리

**특징**:
- Service 호출
- 입력 검증
- 에러 핸들링
- JSON 응답 구성

**예시**: `AuthController.js`
```javascript
class AuthController {
    constructor(userService) {
        this.userService = userService;
    }

    async register(req, res) {
        try {
            const { username, email, password } = req.body;
            const result = await this.userService.register(username, email, password);

            res.status(201).json({
                success: true,
                token: result.token,
                user: result.user
            });
        } catch (error) {
            if (error.message.includes('이미 존재하는')) {
                return res.status(400).json({
                    success: false,
                    message: error.message
                });
            }
            res.status(500).json({
                success: false,
                message: '회원가입 처리 중 오류가 발생했습니다.'
            });
        }
    }
}
```

---

## 💉 의존성 주입

### app.js에서 의존성 주입 설정

```javascript
async function setupDependencies() {
    // 1. Database (Singleton)
    const db = Database.getInstance();
    await db.init();

    // 2. Repositories (DB 주입)
    const userRepository = new UserRepository(db);
    const roundRepository = new RoundRepository(db);
    const gameRepository = new GameRepository(db);

    // 3. Services (Repository 주입)
    const userService = new UserService(userRepository);
    const gameService = new GameService(
        roundRepository,
        gameRepository,
        userRepository
    );

    // 4. Controllers (Service 주입)
    const authController = new AuthController(userService);
    const gameController = new GameController(gameService, achievementManager);

    // 5. Routes (Controller 주입)
    app.use('/api/auth', authRoutes(authController));
    app.use('/api/game', gameRoutes(gameController));
}
```

### 의존성 그래프

```
Database (Singleton)
    ↓
Repositories
    ↓
Services
    ↓
Controllers
    ↓
Routes
```

---

## 🔄 데이터 흐름

### 회원가입 예시

```
1. Client
   ↓ POST /api/auth/register
   { username, email, password }

2. Route (auth.routes.js)
   ↓ 유효성 검증 미들웨어

3. AuthController.register()
   ↓ req.body 파싱

4. UserService.register()
   ↓ 비즈니스 로직
   - 중복 검사
   - 비밀번호 해싱
   - JWT 생성

5. UserRepository.create()
   ↓ SQL 실행
   INSERT INTO users ...

6. Database (MySQL)
   ↓ 데이터 저장

7. Response
   ← JSON 응답
   { success: true, token, user }
```

### 게임 플레이 예시

```
1. Client
   ↓ POST /api/game/play-round
   { playerDeck: [...] }

2. Route (game.routes.js)
   ↓ 선택적 인증 (optionalAuth)

3. GameController.playRound()
   ↓ 덱 유효성 검사

4. GameService.playRoundWithDeck()
   ↓ GameLogic 사용
   - 게임 진행
   - 점수 계산
   ↓ Repository 호출
   - 라운드 생성
   - 게임 저장
   - 포인트 업데이트

5. RoundRepository.create()
   GameRepository.create()
   UserRepository.incrementPoints()
   ↓ SQL 실행

6. Database (MySQL)
   ↓ 트랜잭션 처리

7. AchievementManager
   ↓ 업적 처리 (비동기)

8. Response
   ← JSON 응답
   { success: true, gameResults, playerScore, ... }
```

---

## 🎯 레이어별 테스트 전략

### Repository 테스트
```javascript
// 실제 DB 또는 Mock DB 사용
describe('UserRepository', () => {
    it('should find user by username', async () => {
        const user = await userRepository.findByUsername('testuser');
        expect(user).toBeDefined();
    });
});
```

### Service 테스트
```javascript
// Repository Mock 사용
describe('UserService', () => {
    it('should throw error for duplicate username', async () => {
        userRepository.findByUsername.mockResolvedValue({ id: 1 });

        await expect(
            userService.register('testuser', 'test@example.com', 'password')
        ).rejects.toThrow('이미 존재하는 사용자명입니다.');
    });
});
```

### Controller 테스트
```javascript
// Service Mock 사용
describe('AuthController', () => {
    it('should return 201 on successful registration', async () => {
        userService.register.mockResolvedValue({
            user: { id: 1 },
            token: 'jwt-token'
        });

        const res = await request(app)
            .post('/api/auth/register')
            .send({ username: 'test', email: 'test@example.com', password: 'pass' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
    });
});
```

---

## 🔧 확장 가능성

### 새로운 기능 추가 시

1. **Repository 추가**: 새로운 데이터 액세스 로직
2. **Service 추가**: 새로운 비즈니스 로직
3. **Controller 추가**: 새로운 API 엔드포인트
4. **Route 추가**: 새로운 라우트 정의
5. **app.js 수정**: 의존성 주입 설정

### 예시: PvP 기능 추가

```javascript
// 1. PvPRepository.js
class PvPRepository {
    async createRoom(userId) { ... }
    async joinRoom(roomId, userId) { ... }
}

// 2. PvPService.js
class PvPService {
    constructor(pvpRepository, gameService) { ... }
    async createRoom(userId) { ... }
}

// 3. PvPController.js
class PvPController {
    constructor(pvpService) { ... }
    async createRoom(req, res) { ... }
}

// 4. pvp.routes.js
module.exports = (pvpController) => { ... };

// 5. app.js
const pvpRepository = new PvPRepository(db);
const pvpService = new PvPService(pvpRepository, gameService);
const pvpController = new PvPController(pvpService);
app.use('/api/pvp', pvpRoutes(pvpController));
```

---

## 📝 설계 결정 기록

### Database Singleton 패턴 선택
**이유**: Connection Pool을 애플리케이션 전체에서 재사용하기 위함

### GameLogic 분리
**이유**: 순수 게임 규칙을 DB와 독립적으로 관리하고 테스트하기 위함

### 선택적 인증 (optionalAuth)
**이유**: 게스트 사용자도 게임을 플레이할 수 있도록 허용

### AchievementManager 별도 관리
**이유**: 기존 로직 유지 및 점진적 리팩토링

---

**마지막 업데이트**: 2025-11-12
**버전**: v2.0 (3계층 아키텍처)
