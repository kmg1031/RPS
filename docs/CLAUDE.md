# Claude Code 개발 가이드

이 프로젝트에서 Claude Code가 참고할 수 있는 개발 정보들을 정리했습니다.

## 📊 현재 개발 상황 (최종 업데이트)

### ✅ 완료된 기능들
- **기본 게임 시스템**: 가위바위보 게임 로직 (덱 기반 10라운드)
- **3계층 아키텍처**: Repository-Service-Controller 패턴
- **서버 사이드 게임 처리**: Express.js 기반 API + Dependency Injection
- **데이터베이스 연동**: MySQL + Connection Pool (Singleton 패턴)
- **완전한 사용자 인증 시스템**: JWT + bcrypt
- **인증 UI**: 로그인/회원가입/통계 모달
- **개인 통계 시스템**: 승률, 게임 기록 추적
- **업적 시스템**: 게임 성취도 추적 및 보상
- **반응형 디자인**: 모바일/데스크톱 지원

### 🎯 현재 기능 상태
- **PvE 모드**: ✅ 완전 구현됨 (덱 기반)
- **PvP 모드**: ⚠️ 메뉴만 추가 (구현 대기)
- **사용자 인증**: ✅ 완전 구현됨
- **게임 기록**: ✅ 로그인 사용자만 자동 저장
- **개인 통계**: ✅ 승률, 최근 게임 표시
- **업적 시스템**: ✅ 완전 구현됨

## 🛠️ 개발 환경 설정

### 필수 명령어
```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
# 또는
npm run dev

# 린트 검사 (현재 미설정)
# npm run lint

# 타입 체크 (현재 미설정)
# npm run typecheck
```

## 📁 프로젝트 구조 이해

### 3계층 아키텍처
```
RPS/
├── repositories/       # Data Access Layer
│   ├── UserRepository.js
│   ├── StreakGameRepository.js
│   ├── PVEGameRepository.js
│   └── AchievementRepository.js
├── services/          # Business Logic Layer
│   ├── UserService.js
│   ├── StreakGameService.js
│   ├── PVEGameService.js
│   └── AchievementService.js
├── controllers/       # Presentation Layer
│   ├── AuthController.js
│   ├── StreakGameController.js
│   ├── PVEGameController.js
│   └── AchievementController.js
├── routes/           # API Routes
│   ├── auth.routes.js
│   ├── streak-game.routes.js
│   ├── pve-game.routes.js
│   └── achievement.routes.js
├── database.js       # MySQL Singleton
├── ecosystem.config.js  # PM2 Configuration
└── app.js           # Dependency Injection
```

### 핵심 파일들
- `app.js`: Express 서버 + DI 설정 + 미들웨어
- `database.js`: MySQL Connection Pool (Singleton)
- `ecosystem.config.js`: PM2 프로세스 관리 설정
- `repositories/`: 데이터베이스 CRUD 레이어
- `services/`: 비즈니스 로직 레이어 (게임 로직 통합)
  - `UserService.js`: 인증 및 사용자 관리 (JWT 포함)
  - `StreakGameService.js`: 연승제 게임 로직
  - `PVEGameService.js`: PVE 덱 모드 게임 로직
  - `AchievementService.js`: 업적 시스템
- `controllers/`: HTTP 요청/응답 처리
- `routes/`: API 라우팅 정의
- `public/index.html`: 메인 HTML + 인증 모달
- `public/styles.css`: 전체 스타일링 + 모달 CSS
- `public/script.js`: 게임 로직 + 인증 관리

### 개발 패턴
- **아키텍처**: 3계층 (Repository-Service-Controller) + DI
- **서버**: Express.js + JWT 인증 + MySQL
- **데이터베이스**: MySQL Connection Pool (Singleton 패턴)
- **클라이언트**: Vanilla JavaScript SPA + AuthManager
- **통신**: fetch API + Bearer Token 인증
- **스타일**: CSS3 + 모달 애니메이션
- **데이터**: MySQL + 사용자별 게임 기록

## 🎯 현재 아키텍처

### 게임 로직 흐름 (3계층)
1. **클라이언트**: 사용자가 덱(10개) 선택
2. **Controller**: HTTP 요청 수신 및 검증
3. **Service**: GameLogic으로 게임 규칙 처리 + DB 저장
4. **Repository**: MySQL에 라운드/게임 데이터 저장
5. **Controller**: JSON 응답 반환
6. **클라이언트**: 애니메이션과 UI 업데이트

### 현재 API 스펙
```javascript
// 인증 API (AuthController)
POST /api/auth/register - 회원가입
POST /api/auth/login - 로그인
GET /api/auth/me - 사용자 정보 (인증 필요)

// PVE 게임 API (PVEGameController)
POST /api/pve-game/play - PVE 게임 플레이 (덱 기반) (인증 필요)
GET /api/pve-game/:gameId - 게임 결과 조회 (인증 필요)
GET /api/pve-game/history - 게임 히스토리 (인증 필요)
GET /api/pve-game/stats - 사용자 통계 (인증 필요)

// 연승제 게임 API (StreakGameController)
POST /api/streak-game/start - 게임 시작 (인증 필요)
POST /api/streak-game/play - 라운드 플레이 (인증 필요)
POST /api/streak-game/quit - 게임 포기 (인증 필요)
GET /api/streak-game/current - 현재 게임 조회 (인증 필요)
GET /api/streak-game/history - 게임 히스토리 (인증 필요)
GET /api/streak-game/stats - 사용자 통계 (인증 필요)

// 업적 API (AchievementController)
GET /api/achievements/all - 전체 업적 목록
GET /api/achievements/user - 사용자 업적 (인증 필요)
GET /api/achievements/stats - 업적 통계 (인증 필요)
```

### 인증 헤더
```javascript
// 로그인 후 모든 인증 필요 API에 포함
Authorization: Bearer <JWT_TOKEN>
```

### Dependency Injection 흐름
```javascript
Database (Singleton)
  ↓
Repositories (DB 주입)
  ↓
Services (Repository 주입)
  ↓
Controllers (Service 주입)
  ↓
Routes (Controller 주입)
```

## 🔧 개발 시 주의사항

### 코딩 컨벤션
- ES6+ 문법 사용
- async/await 패턴 사용
- 에러 핸들링 포함
- 한국어 UI 텍스트
- 반응형 디자인 고려

### 파일 수정 시
- `app.js`: Express 설정, DI 설정, 미들웨어
- `database.js`: MySQL Connection Pool, Singleton 패턴
- `ecosystem.config.js`: PM2 설정 (watch, 로그, 재시작 정책 등)
- `repositories/*.js`: 데이터베이스 CRUD 오퍼레이션
- `services/*.js`: 비즈니스 로직, 게임 로직 통합
  - `UserService.js`: JWT 인증 미들웨어 포함
  - `StreakGameService.js`, `PVEGameService.js`: 게임 로직
- `controllers/*.js`: HTTP 요청/응답 처리, 검증
- `routes/*.js`: API 라우팅 정의 (authenticateToken 파라미터로 받음)
- `public/script.js`: 게임 로직, AuthManager, 모달 관리
- `public/styles.css`: 스타일링, 모달 CSS, 반응형 디자인
- `public/index.html`: DOM 구조, 모달 HTML (신중한 수정 필요)

### 레이어 책임
- **Repository**: MySQL CRUD만 담당, 비즈니스 로직 없음
- **Service**: 비즈니스 로직, 트랜잭션 관리, GameLogic 호출
- **Controller**: HTTP 검증, 응답 포맷팅, 에러 핸들링

## 🚀 확장 가능한 기능들

### PvP 모드 구현 시 필요사항
- WebSocket 통신 (socket.io)
- 방 시스템 (Room management)
- 실시간 상태 동기화
- 플레이어 매칭 시스템

### 데이터베이스 확장 시
- ✅ MySQL Connection Pool (현재 사용 중)
- 리더보드 시스템 추가
- 통계 데이터 집계 테이블
- 캐싱 레이어 (Redis)

## 📋 테스트 가이드

### 현재 테스트 체크리스트
- [x] 가위/바위/보 선택 동작
- [x] 승패 판정 정확성  
- [x] 점수 업데이트
- [x] 게임 히스토리 기록
- [x] 회원가입/로그인 기능
- [x] JWT 토큰 인증
- [x] 로그인 상태 UI 변경
- [x] 개인 통계 조회
- [x] 게임 기록 자동 저장 (로그인 시)
- [x] 게스트 플레이 가능
- [x] 모달 UI/UX
- [x] 반응형 디자인 (모바일/데스크톱)
- [x] 에러 핸들링
- [ ] PvP 모드 (구현 대기)

### 브라우저 호환성
- Chrome, Firefox, Safari, Edge 지원
- 모바일 브라우저 지원

## 💡 개발 팁

### 디버깅
- 브라우저 개발자 도구 콘솔 활용
- 네트워크 탭에서 API 요청/응답 확인
- 서버 콘솔에서 로그 확인

### 성능 최적화
- CSS 애니메이션 사용 (JavaScript 애니메이션 대신)
- 이미지 최적화 (현재 이모지 사용)
- 불필요한 DOM 조작 최소화

## 🔄 Git 관리

### 현재 설정된 .gitignore
```
/node_modules
*.log
.env
```

### 데이터베이스 정보
- **시스템**: MySQL 8.0+
- **연결**: Connection Pool (Singleton 패턴)
- **테이블**: `users`, `pve_games`, `streak_games`, `streak_game_details`, `achievements`, `user_achievements`, `achievement_logs`
- **초기화**: 첫 서버 실행 시 자동 테이블 생성

### PM2 명령어
```bash
npm run dev              # PM2로 개발 서버 시작 (watch 모드)
npm run dev:stop         # PM2 서버 중지
npm run dev:restart      # PM2 서버 재시작
npm run dev:delete       # PM2 프로세스 삭제
npm run dev:logs         # PM2 로그 보기
npm run dev:monit        # PM2 모니터링
```

### 커밋 가이드라인
- feat: 새 기능 추가
- fix: 버그 수정
- style: UI/UX 개선
- refactor: 코드 리팩토링
- docs: 문서 업데이트