# 🎯 가위바위보 게임 (RPS)

완전한 인증 시스템을 갖춘 Node.js 기반 가위바위보 게임

## 🎮 주요 기능

### ✅ 완료된 기능
- **🎯 PvE 게임 모드**: 컴퓨터와 대전
- **🔐 완전한 사용자 인증**: JWT 기반 로그인/회원가입
- **📊 개인 통계 시스템**: 승률, 게임 기록 추적
- **💾 데이터베이스 연동**: SQLite3 기반 사용자/게임 데이터 저장
- **🎨 반응형 UI**: 모달 기반 인증 인터페이스
- **📱 모바일 지원**: 완전 반응형 디자인

### 🏗️ 프로젝트 구조
```
RPS/
├── package.json          # 프로젝트 설정 및 의존성
├── app.js               # Express 서버 + 인증 API
├── database.js          # SQLite 데이터베이스 관리
├── auth.js              # JWT 인증 서비스
├── game.db              # SQLite 데이터베이스 (자동 생성)
├── .gitignore           # Git 제외 파일 설정
├── public/              # 정적 파일들
│   ├── index.html       # 메인 HTML + 인증 모달
│   ├── styles.css       # CSS 스타일링 + 모달 디자인
│   └── script.js        # 게임 로직 + 인증 관리
├── README.md            # 프로젝트 문서
└── CLAUDE.md            # 개발자 가이드
```

### 🎮 게임 기능
- **🎯 PvE 모드**: 컴퓨터와 가위바위보 대전
- **⚡ 실시간 점수판**: 승/패 점수 실시간 업데이트
- **🎬 애니메이션 효과**: 선택 시 시각적 피드백
- **📝 게임 히스토리**: 최근 게임 기록 (로그인 시 영구 저장)
- **🔄 게임 리셋**: 점수 및 기록 초기화

### 👤 사용자 기능
- **🔐 회원가입/로그인**: JWT 토큰 기반 인증
- **📊 개인 통계**: 총 게임 수, 승률, 승/패/무승부 기록
- **🎮 게스트 플레이**: 로그인 없이도 게임 가능
- **🔒 보안**: bcrypt 비밀번호 해싱, JWT 토큰 검증

### 🔧 기술 스택
- **Backend**: Node.js, Express.js, SQLite3, JWT, bcrypt
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: SQLite3 (users, game_history 테이블)
- **Authentication**: JWT Bearer Token

### 🚀 실행 방법
```bash
# 의존성 설치
npm install

# 서버 실행
npm start

# 브라우저에서 접속
http://localhost:3000
```

### 📡 API 엔드포인트

#### 🎮 게임 API
- `GET /`: 메인 페이지
- `POST /api/play`: 게임 플레이 (선택적 인증)

#### 🔐 인증 API
- `POST /api/auth/register`: 회원가입
- `POST /api/auth/login`: 로그인
- `GET /api/auth/me`: 사용자 정보 조회 (인증 필요)

#### 📊 통계 API
- `GET /api/stats`: 개인 게임 통계 (인증 필요)

#### 요청/응답 예시
```javascript
// 게임 플레이
POST /api/play
Request: { "playerChoice": "rock" }
Response: { 
  "success": true,
  "playerChoice": "rock", 
  "computerChoice": "scissors", 
  "result": "win",
  "saved": true 
}

// 로그인
POST /api/auth/login
Request: { "username": "player1", "password": "password123" }
Response: { 
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { "id": 1, "username": "player1" }
}
```

### 🚧 향후 구현 예정
- **👥 PvP 모드**: 실시간 플레이어 대전 (WebSocket)
- **🏆 리더보드**: 전체 사용자 순위
- **👥 친구 시스템**: 친구 추가 및 대전 초대
- **🎨 테마**: 다크 모드, 커스텀 테마

### 🔄 게임 플레이 흐름
1. **게스트/사용자 선택**: 로그인하거나 게스트로 플레이
2. **게임 선택**: 가위/바위/보 중 선택
3. **서버 처리**: 컴퓨터 선택 생성 및 승패 판정
4. **결과 표시**: 애니메이션과 함께 결과 표시
5. **기록 저장**: 로그인 사용자는 자동으로 DB에 저장
6. **통계 업데이트**: 개인 통계 실시간 업데이트

### 💡 주요 특징
- **🔒 보안 우선**: 모든 게임 로직이 서버에서 처리
- **🎮 선택적 로그인**: 게스트도 게임 플레이 가능
- **📱 모바일 친화적**: 완전 반응형 디자인
- **⚡ 실시간**: 빠른 응답과 부드러운 애니메이션
- **💾 영구 저장**: 로그인 사용자의 모든 게임 기록 저장

### 🔧 개발자 정보
- **언어**: JavaScript (Node.js)
- **프레임워크**: Express.js
- **데이터베이스**: SQLite3
- **인증**: JWT + bcrypt
- **프론트엔드**: Vanilla JavaScript (프레임워크 없음)