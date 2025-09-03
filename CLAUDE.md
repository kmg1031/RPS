# Claude Code 개발 가이드

이 프로젝트에서 Claude Code가 참고할 수 있는 개발 정보들을 정리했습니다.

## 📊 현재 개발 상황 (최종 업데이트)

### ✅ 완료된 기능들
- **기본 게임 시스템**: 가위바위보 게임 로직
- **서버 사이드 게임 처리**: Express.js 기반 API
- **데이터베이스 연동**: SQLite3 + 사용자/게임기록 테이블
- **완전한 사용자 인증 시스템**: JWT + bcrypt
- **인증 UI**: 로그인/회원가입/통계 모달
- **개인 통계 시스템**: 승률, 게임 기록 추적
- **반응형 디자인**: 모바일/데스크톱 지원

### 🎯 현재 기능 상태
- **PvE 모드**: ✅ 완전 구현됨
- **PvP 모드**: ⚠️ 메뉴만 추가 (구현 대기)
- **사용자 인증**: ✅ 완전 구현됨
- **게임 기록**: ✅ 로그인 사용자만 자동 저장
- **개인 통계**: ✅ 승률, 최근 게임 표시

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

### 핵심 파일들
- `app.js`: Express 서버 메인 파일 + 인증 API
- `database.js`: SQLite 데이터베이스 연결 및 CRUD
- `auth.js`: JWT 인증 서비스 + 미들웨어
- `public/index.html`: 메인 HTML + 인증 모달
- `public/styles.css`: 전체 스타일링 + 모달 CSS
- `public/script.js`: 게임 로직 + 인증 관리
- `package.json`: 프로젝트 설정
- `game.db`: SQLite 데이터베이스 파일 (자동 생성)

### 개발 패턴
- **서버**: Express.js + JWT 인증 + SQLite
- **클라이언트**: Vanilla JavaScript SPA + AuthManager
- **통신**: fetch API + Bearer Token 인증
- **스타일**: CSS3 + 모달 애니메이션
- **데이터**: SQLite + 사용자별 게임 기록

## 🎯 현재 아키텍처

### 게임 로직 흐름
1. 클라이언트에서 사용자 선택 캡처
2. `/api/play` 엔드포인트로 POST 요청
3. 서버에서 컴퓨터 선택 생성 및 승패 판정
4. JSON 응답으로 결과 반환
5. 클라이언트에서 애니메이션과 UI 업데이트

### 현재 API 스펙
```javascript
// 인증 API
POST /api/auth/register - 회원가입
POST /api/auth/login - 로그인  
GET /api/auth/me - 사용자 정보 (인증 필요)

// 게임 API
POST /api/play - 게임 플레이 (선택적 인증)
// Request: { "playerChoice": "rock|paper|scissors" }
// Response: { "success": true, "playerChoice", "computerChoice", "result", "saved": boolean }

// 통계 API  
GET /api/stats - 개인 통계 (인증 필요)
// Response: { "stats": {...}, "recentGames": [...] }
```

### 인증 헤더
```javascript
// 로그인 후 모든 인증 필요 API에 포함
Authorization: Bearer <JWT_TOKEN>
```

## 🔧 개발 시 주의사항

### 코딩 컨벤션
- ES6+ 문법 사용
- async/await 패턴 사용
- 에러 핸들링 포함
- 한국어 UI 텍스트
- 반응형 디자인 고려

### 파일 수정 시
- `app.js`: 서버 로직, API 엔드포인트, 인증 로직
- `database.js`: 데이터베이스 스키마, CRUD 오퍼레이션
- `auth.js`: JWT 토큰 관리, 인증 미들웨어
- `script.js`: 게임 로직, AuthManager, 모달 관리
- `styles.css`: 스타일링, 모달 CSS, 반응형 디자인
- `index.html`: DOM 구조, 모달 HTML (신중한 수정 필요)

## 🚀 확장 가능한 기능들

### PvP 모드 구현 시 필요사항
- WebSocket 통신 (socket.io)
- 방 시스템 (Room management)
- 실시간 상태 동기화
- 플레이어 매칭 시스템

### 데이터베이스 연동 시
- MongoDB 또는 SQLite 권장
- 게임 기록 저장
- 사용자 통계
- 리더보드 시스템

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
- **파일**: `game.db` (SQLite)
- **테이블**: `users`, `game_history`
- **자동 생성**: 첫 서버 실행 시

### 커밋 가이드라인
- feat: 새 기능 추가
- fix: 버그 수정
- style: UI/UX 개선
- refactor: 코드 리팩토링
- docs: 문서 업데이트