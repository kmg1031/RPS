# RPS 프로젝트 문서

이 디렉토리는 RPS(가위바위보) 프로젝트의 모든 문서를 포함합니다.

## 📚 문서 구조

### 🏗️ Architecture (아키텍처)
- [**ARCHITECTURE.md**](./architecture/ARCHITECTURE.md) - 3계층 아키텍처 상세 설명
  - Repository-Service-Controller 패턴
  - Dependency Injection 구조
  - 각 레이어의 책임과 예제 코드

### 🔌 API (API 명세)
- [**API.md**](./api/API.md) - 전체 API 엔드포인트 명세
  - 인증 API (회원가입, 로그인)
  - 게임 API (덱 기반 게임, 통계)
  - 업적 API (업적 목록, 사용자 업적)

### 🗄️ Database (데이터베이스)
- [**DATABASE.md**](./database/DATABASE.md) - 데이터베이스 구조 및 설정
  - MySQL Connection Pool (Singleton 패턴)
  - 테이블 스키마 정의
  - CRUD 오퍼레이션

### 🎮 Game (게임 시스템)
- [**ACHIEVEMENTS.md**](./game/ACHIEVEMENTS.md) - 업적 시스템 명세
  - 업적 유형 및 조건
  - 보상 시스템
  - 구현 가이드
- [**DISPLAY_STANDARD.md**](./game/DISPLAY_STANDARD.md) - 게임 화면 표준
  - UI/UX 가이드라인
  - 화면 레이아웃 규칙

### 📋 Data Models (데이터 모델)
- [**DATA_MODELS.md**](./DATA_MODELS.md) - TypeScript 스타일 인터페이스 정의
  - User, Game, Round, Achievement 타입
  - API Request/Response 타입
  - 검증 규칙

### ✨ Features (기능 명세)
- [**FEATURES.md**](./FEATURES.md) - 현재 구현된 기능 목록
  - 완료된 기능
  - 진행 중인 기능
  - 계획된 기능

### 🤖 Claude Code 가이드
- [**CLAUDE.md**](./CLAUDE.md) - Claude Code 개발 참고 자료
  - 프로젝트 현황
  - 개발 환경 설정
  - 코딩 컨벤션
  - 확장 가능한 기능

## 🚀 빠른 시작

1. **프로젝트 이해하기**
   - [CLAUDE.md](./CLAUDE.md) - 전체 프로젝트 개요
   - [ARCHITECTURE.md](./architecture/ARCHITECTURE.md) - 코드 구조 이해

2. **API 사용하기**
   - [API.md](./api/API.md) - 전체 API 엔드포인트
   - [DATA_MODELS.md](./DATA_MODELS.md) - 요청/응답 데이터 형식

3. **데이터베이스 설정하기**
   - [DATABASE.md](./database/DATABASE.md) - MySQL 설정 및 스키마

4. **게임 시스템 확장하기**
   - [ACHIEVEMENTS.md](./game/ACHIEVEMENTS.md) - 업적 시스템
   - [FEATURES.md](./FEATURES.md) - 기능 로드맵

## 📖 문서 업데이트 가이드

새로운 기능을 추가하거나 변경할 때는 다음 문서들을 업데이트해야 합니다:

1. **API 변경 시**: `api/API.md`, `DATA_MODELS.md`
2. **데이터베이스 변경 시**: `database/DATABASE.md`, `DATA_MODELS.md`
3. **아키텍처 변경 시**: `architecture/ARCHITECTURE.md`, `CLAUDE.md`
4. **새 기능 추가 시**: `FEATURES.md`, 관련 카테고리 문서

## 🔗 관련 링크

- [프로젝트 루트 README](../README.md)
- [GitHub Repository](https://github.com/your-repo/RPS)

---

마지막 업데이트: 2025-11-12
