# 🎯 RPS 게임 결과 표기 표준 가이드

## 개요
가위바위보 게임에서 한 라운드(10게임) 결과를 표기하는 표준 방식을 정의합니다.

## 🎮 표준 표기 방식: used-deck-inline

### 1. 구조 개요
- **컨테이너**: `#used-deck-section`
- **표시 영역**: `#used-deck-inline`
- **카드 단위**: `.used-deck-card-inline`

### 2. HTML 구조
```html
<div id="used-deck-section" class="used-deck-section">
    <div class="used-deck-header">
        <h4>🎯 한 라운드 결과 (10게임)</h4>
        <div class="deck-total-score">
            <span class="total-score-label">총점:</span>
            <span class="total-score-value" id="deck-total-score">0점</span>
        </div>
        <button id="used-deck-close" class="close-deck-btn">&times;</button>
    </div>
    <div id="used-deck-inline" class="used-deck-display-inline">
        <!-- 10개의 게임 카드가 동적으로 생성됨 -->
    </div>
</div>
```

### 3. 개별 게임 카드 구조
각 게임은 다음 요소로 구성됩니다:

```html
<div class="used-deck-card-inline [win|lose|draw]">
    <span class="card-number">1</span>
    [선택 이모지: ✊✋✌️]
    <span class="card-result">+3</span> <!-- 점수가 있을 때만 표시 -->
</div>
```

## 🎨 시각적 표기 시스템

### 1. 레이아웃
- **그리드**: 10개 카드를 1행 10열로 배치
- **반응형**: 모바일에서는 2행 5열로 변경
- **카드 비율**: 1:1 (정사각형)
- **최대 너비**: 500px
- **카드 간격**: 6px

### 2. 색상 시스템
#### 승리 (win)
- **테두리**: `#28a745` (초록)
- **배경**: `linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(255, 255, 255, 0.7))`

#### 패배 (lose)
- **테두리**: `#dc3545` (빨강)
- **배경**: `linear-gradient(135deg, rgba(220, 53, 69, 0.2), rgba(255, 255, 255, 0.7))`

#### 무승부 (draw)
- **테두리**: `#ffc107` (노랑)
- **배경**: `linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 255, 255, 0.7))`

### 3. 정보 표시 위치
```
┌─────────────┐
│      +3 ◄── 획득 점수 (우상단)
│             │
│    ✊ ◄───── 선택 (중앙)
│             │
│1 ◄───────── 게임 순서 (좌하단)
└─────────────┘
```

## 📊 데이터 구조

### 1. JavaScript 데이터 형식
```javascript
// gameResults 배열의 각 요소
{
    playerChoice: 'rock|paper|scissors',
    computerChoice: 'rock|paper|scissors', 
    result: 'win|lose|draw',
    pointsEarned: number, // 0 이상의 정수
    streakScore: number,
    comboScore: number
}
```

### 2. 생성 로직
```javascript
displayUsedDeckInline(gameResults) {
    const usedDeckDiv = document.getElementById('used-deck-inline');
    let totalPoints = 0;
    
    this.playerDeck.forEach((choice, index) => {
        const card = document.createElement('div');
        card.className = 'used-deck-card-inline';
        
        if (gameResults && gameResults[index]) {
            const result = gameResults[index].result;
            const pointsEarned = gameResults[index].pointsEarned || 0;
            
            card.classList.add(result);
            totalPoints += pointsEarned;
            
            const pointsDisplay = pointsEarned > 0 ? `+${pointsEarned}` : '';
            
            card.innerHTML = `
                <span class="card-number">${index + 1}</span>
                ${this.choiceEmojis[choice]}
                ${pointsDisplay ? `<span class="card-result">${pointsDisplay}</span>` : ''}
            `;
        }
        
        usedDeckDiv.appendChild(card);
    });
    
    // 총점 업데이트
    document.getElementById('deck-total-score').textContent = `${totalPoints}점`;
}
```

## 🔧 CSS 클래스 정의

### 1. 컨테이너 클래스
```css
.used-deck-display-inline {
    display: grid;
    grid-template-columns: repeat(10, 1fr);
    gap: 6px;
    max-width: 500px;
    margin: 0 auto;
}

@media (max-width: 768px) {
    .used-deck-display-inline {
        grid-template-columns: repeat(5, 1fr);
    }
}
```

### 2. 카드 기본 스타일
```css
.used-deck-card-inline {
    aspect-ratio: 1;
    background: rgba(255, 255, 255, 0.7);
    border: 2px solid rgba(255, 255, 255, 0.5);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 1.1rem;
    transition: all 0.3s ease;
    position: relative;
}
```

### 3. 상태별 스타일
```css
.used-deck-card-inline.win {
    border-color: #28a745;
    background: linear-gradient(135deg, rgba(40, 167, 69, 0.2), rgba(255, 255, 255, 0.7));
}

.used-deck-card-inline.lose {
    border-color: #dc3545;
    background: linear-gradient(135deg, rgba(220, 53, 69, 0.2), rgba(255, 255, 255, 0.7));
}

.used-deck-card-inline.draw {
    border-color: #ffc107;
    background: linear-gradient(135deg, rgba(255, 193, 7, 0.2), rgba(255, 255, 255, 0.7));
}
```

### 4. 정보 표시 요소
```css
.used-deck-card-inline .card-number {
    position: absolute;
    bottom: 2px;
    left: 2px;
    font-size: 0.6rem;
    opacity: 0.7;
}

.used-deck-card-inline .card-result {
    position: absolute;
    top: 2px;
    right: 2px;
    font-size: 0.7rem;
}
```

## 📱 반응형 디자인

### 데스크톱 (768px 이상)
- 1행 10열 배치
- 카드 크기: 큰 사이즈
- 총점 표시: 오른쪽 배치

### 모바일 (768px 미만)  
- 2행 5열 배치
- 카드 크기: 조정된 사이즈
- 총점 표시: 중앙 배치

## 🎯 사용 지침

### 1. 구현 시 주의사항
- **데이터 순서**: gameResults 배열의 순서와 playerDeck 배열의 순서가 일치해야 함
- **총점 계산**: pointsEarned 값만 합산 (0점 게임 포함)
- **색상 적용**: result 값에 따라 정확한 CSS 클래스 적용
- **점수 표시**: 0점일 때는 점수 표시 안 함

### 2. 확장 가능성
- 다른 게임 타입에도 동일한 패턴 적용 가능
- 카드 개수 조정 가능 (현재 10개 고정)
- 추가 정보 표시 가능 (연속, 콤보 등)

### 3. 접근성
- 색상뿐만 아니라 숫자로도 정보 제공
- 명확한 시각적 구분
- 반응형 디자인으로 모든 기기 지원

---

## 📋 체크리스트

구현 시 다음 항목들을 확인하세요:

- [ ] 10개 카드가 정확히 표시되는가?
- [ ] 승/패/무 색상이 올바르게 적용되는가?
- [ ] 획득 점수가 정확히 표시되는가?
- [ ] 총점이 올바르게 계산되는가?
- [ ] 모바일에서 2행 5열로 표시되는가?
- [ ] 카드 순서가 게임 순서와 일치하는가?
- [ ] 0점 게임에서 점수 표시가 숨겨지는가?

---

*이 문서는 RPS 게임의 한 라운드 결과 표기 표준을 정의합니다. 모든 게임 결과 표시는 이 가이드를 따라 구현해야 합니다.*