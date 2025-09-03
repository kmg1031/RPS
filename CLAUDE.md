# Claude Code 개발 가이드

이 프로젝트에서 Claude Code가 참고할 수 있는 개발 정보들을 정리했습니다.

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
- `app.js`: Express 서버 메인 파일
- `public/index.html`: 메인 HTML 페이지
- `public/styles.css`: 전체 스타일링
- `public/script.js`: 클라이언트 게임 로직
- `package.json`: 프로젝트 설정

### 개발 패턴
- **서버**: Express.js로 API 서버 구현
- **클라이언트**: Vanilla JavaScript로 SPA 구현
- **통신**: fetch API를 사용한 RESTful 통신
- **스타일**: CSS3 (Flexbox, Grid, 애니메이션)

## 🎯 현재 아키텍처

### 게임 로직 흐름
1. 클라이언트에서 사용자 선택 캡처
2. `/api/play` 엔드포인트로 POST 요청
3. 서버에서 컴퓨터 선택 생성 및 승패 판정
4. JSON 응답으로 결과 반환
5. 클라이언트에서 애니메이션과 UI 업데이트

### API 스펙
```javascript
// POST /api/play
// Request Body:
{
  "playerChoice": "rock" | "paper" | "scissors"
}

// Response:
{
  "playerChoice": string,
  "computerChoice": string,
  "result": "win" | "lose" | "draw",
  "timestamp": string
}
```

## 🔧 개발 시 주의사항

### 코딩 컨벤션
- ES6+ 문법 사용
- async/await 패턴 사용
- 에러 핸들링 포함
- 한국어 UI 텍스트
- 반응형 디자인 고려

### 파일 수정 시
- `app.js`: 서버 로직 및 API 엔드포인트
- `script.js`: 클라이언트 게임 로직 및 UI 조작
- `styles.css`: 스타일링 및 애니메이션
- `index.html`: DOM 구조 (최소한의 수정 권장)

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

### 수동 테스트 체크리스트
- [ ] 가위/바위/보 선택 동작
- [ ] 승패 판정 정확성
- [ ] 점수 업데이트
- [ ] 게임 히스토리 기록
- [ ] 모드 전환 (PvE/PvP)
- [ ] 반응형 디자인 (모바일/데스크톱)
- [ ] 에러 핸들링 (서버 연결 실패)

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

### 커밋 가이드라인
- feat: 새 기능 추가
- fix: 버그 수정
- style: UI/UX 개선
- refactor: 코드 리팩토링
- docs: 문서 업데이트