# 🎯 가위바위보 게임 (RESTful API v1)

완전한 RESTful 원칙을 따르는 Node.js 기반 가위바위보 게임 API

[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18+-blue.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-orange.svg)](https://www.mysql.com/)
[![RESTful](https://img.shields.io/badge/API-RESTful-brightgreen.svg)](https://restfulapi.net/)

---

## 🆕 RESTful API v1의 주요 특징

### ✨ RESTful 원칙 준수

1. **리소스 중심 설계**
   - URL은 리소스를 나타냄 (동사가 아닌 명사 사용)
   - `/api/v1/games`, `/api/v1/users`, `/api/v1/achievements`

2. **HTTP 메서드 활용**
   - `GET`: 조회
   - `POST`: 생성
   - `PUT/PATCH`: 수정
   - `DELETE`: 삭제

3. **표준 HTTP 상태 코드**
   - `200 OK`: 성공
   - `201 Created`: 리소스 생성 성공
   - `400 Bad Request`: 잘못된 요청
   - `401 Unauthorized`: 인증 실패
   - `404 Not Found`: 리소스 없음
   - `409 Conflict`: 리소스 충돌

4. **일관된 응답 형식**
   ```json
   {
     "success": true,
     "message": "optional message",
     "data": { ... }
   }
   ```

5. **API 버전 관리**
   - URL에 버전 포함: `/api/v1/...`
   - 하위 호환성 유지

---

## 🚀 빠른 시작

### 설치 및 실행

```bash
# 의존성 설치
npm install

# RESTful API 서버 실행 (개발 모드)
npm run dev

# 또는 직접 실행
npm run start:restful
```

서버 실행 후:
- API Base URL: `http://localhost:3000/api/v1`
- Health Check: `http://localhost:3000/health`
- 웹 UI: `http://localhost:3000`

---

## 📡 API 엔드포인트 개요

### 인증 (Authentication)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/auth/login` | 로그인 |
| POST | `/api/v1/auth/logout` | 로그아웃 |

### 사용자 (Users)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/users` | 회원가입 |
| GET | `/api/v1/users/me` | 내 정보 조회 |
| GET | `/api/v1/users/me/stats` | 내 통계 조회 |

### 게임 (Games)
| Method | Endpoint | 설명 |
|--------|----------|------|
| POST | `/api/v1/games` | 게임 생성 (PVE 덱 모드) |
| GET | `/api/v1/games` | 게임 목록 (히스토리) |
| GET | `/api/v1/games/:id` | 특정 게임 조회 |
| POST | `/api/v1/games/streak` | 연승제 게임 시작 |
| GET | `/api/v1/games/streak/current` | 현재 게임 조회 |
| POST | `/api/v1/games/streak/play` | 라운드 플레이 |
| DELETE | `/api/v1/games/streak/current` | 게임 포기 |

### 업적 (Achievements)
| Method | Endpoint | 설명 |
|--------|----------|------|
| GET | `/api/v1/achievements` | 전체 업적 목록 |
| GET | `/api/v1/achievements/me` | 내 업적 목록 |
| GET | `/api/v1/achievements/me/stats` | 업적 통계 |

상세한 API 문서: [API_V1_RESTFUL.md](docs/api/API_V1_RESTFUL.md)

---

## 🔄 기존 API와의 비교

### 구조적 개선

#### Before (기존 API)
```
/api/auth/register         → POST (회원가입)
/api/pve-game/play         → POST (게임 플레이)
/api/pve-game/history      → GET (히스토리)
/api/streak-game/start     → POST (게임 시작)
/api/streak-game/quit      → POST (게임 포기)
```

#### After (RESTful v1)
```
/api/v1/users              → POST (회원가입)
/api/v1/games              → POST (게임 생성), GET (목록)
/api/v1/games/:id          → GET (조회)
/api/v1/games/streak       → POST (시작)
/api/v1/games/streak/current → DELETE (포기)
```

### 주요 개선사항

1. **리소스 중심**: 동사 대신 명사 사용
2. **HTTP 메서드 활용**: DELETE로 삭제 표현
3. **버전 관리**: `/api/v1`로 버전 명시
4. **계층적 구조**: `/games/:id`, `/users/me`
5. **표준 상태 코드**: 201 Created, 409 Conflict 등

---

## 🛠️ 기술 스택

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18
- **Database**: MySQL 8.0+
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator

### RESTful 구현
- **Error Handling**: 중앙 집중식 에러 미들웨어
- **Response Format**: 표준화된 응답 헬퍼
- **Async Handling**: catchAsync 래퍼
- **Versioning**: URL 기반 버전 관리

---

## 📁 프로젝트 구조

```
RPS/
├── app.restful.js              # RESTful API 진입점
├── app.js                      # 레거시 API (호환성)
│
├── middlewares/                # 미들웨어
│   └── errorHandler.js         # 중앙 에러 핸들링
│
├── utils/                      # 유틸리티
│   └── response.js             # 표준 응답 헬퍼
│
├── routes/v1/                  # API v1 라우트
│   ├── index.js                # 라우터 통합
│   ├── games.routes.js         # 게임 리소스
│   ├── users.routes.js         # 사용자 리소스
│   ├── auth.routes.js          # 인증
│   └── achievements.routes.js  # 업적 리소스
│
├── controllers/v1/             # RESTful 컨트롤러
│   ├── PVEGameController.js
│   ├── StreakGameController.js
│   ├── AuthController.js
│   └── AchievementController.js
│
├── services/                   # 비즈니스 로직
├── repositories/               # 데이터 액세스
└── docs/api/                   # API 문서
    └── API_V1_RESTFUL.md       # RESTful API 문서
```

---

## 📖 사용 예제

### 회원가입
```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "email": "player1@example.com",
    "password": "pass123"
  }'
```

### 로그인
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "player1",
    "password": "pass123"
  }'
```

### 게임 플레이
```bash
curl -X POST http://localhost:3000/api/v1/games \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "playerDeck": ["rock","paper","scissors","rock","paper","scissors","rock","paper","scissors","rock"]
  }'
```

---

## 🔧 개발 스크립트

```bash
# RESTful API 서버 실행 (PM2)
npm run dev

# 레거시 API 서버 실행 (PM2)
npm run dev:legacy

# 두 서버 모두 실행
npm run dev:all

# 서버 중지
npm run dev:stop

# 로그 확인
npm run dev:logs
```

---

## 📚 문서

- [RESTful API v1 문서](docs/api/API_V1_RESTFUL.md) - 완전한 API 명세
- [아키텍처 문서](docs/architecture/ARCHITECTURE.md) - 시스템 설계
- [데이터베이스 문서](docs/database/DATABASE.md) - DB 스키마
- [마이그레이션 가이드](docs/api/API_V1_RESTFUL.md#마이그레이션-가이드) - 기존 API에서 v1으로

---

## 🌟 RESTful API의 장점

### 1. **명확성**
- URL만 보고도 어떤 리소스인지 파악 가능
- HTTP 메서드로 의도 명확히 표현

### 2. **확장성**
- 버전 관리로 안전한 업데이트
- 새 기능 추가 시 기존 API 유지

### 3. **표준화**
- 업계 표준 준수로 학습 곡선 감소
- 다른 개발자와의 협업 용이

### 4. **유지보수성**
- 체계적인 구조로 디버깅 쉬움
- 표준 상태 코드로 에러 추적 간편

---

## 🔄 호환성

### 레거시 API 지원
- 기존 API (`/api/auth`, `/api/pve-game` 등)는 `app.js`에서 계속 지원
- 점진적 마이그레이션 가능

### 권장사항
- 새 프로젝트: RESTful API v1 사용 (`app.restful.js`)
- 기존 프로젝트: 마이그레이션 가이드 참고

---

## 👤 작성자

**GitHub**: [@kmg1031](https://github.com/kmg1031)

---

## 📝 라이선스

ISC License

---

**마지막 업데이트**: 2025-01-01
**버전**: v1.0.0 (RESTful)
