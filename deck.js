class Deck {
    constructor(maxSize = 10) {
        this.cards = [];
        this.maxSize = maxSize;
        this.currentIndex = 0;
        this.isLocked = false;
    }

    static createFromArray(cards, maxSize = 10) {
        const deck = new Deck(maxSize);
        if (Array.isArray(cards)) {
            deck.cards = [...cards];
        }
        return deck;
    }

    static createRandom(maxSize = 10) {
        const deck = new Deck(maxSize);
        deck.generateRandom();
        return deck;
    }

    addCard(choice) {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 카드를 추가할 수 없습니다.');
        }
        
        if (this.cards.length >= this.maxSize) {
            throw new Error('덱이 가득 찼습니다.');
        }

        if (!this.isValidChoice(choice)) {
            throw new Error('유효하지 않은 선택입니다.');
        }

        this.cards.push(choice);
        return this;
    }

    removeCard(index) {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 카드를 제거할 수 없습니다.');
        }

        if (index < 0 || index >= this.cards.length) {
            throw new Error('유효하지 않은 인덱스입니다.');
        }

        this.cards.splice(index, 1);
        return this;
    }

    clear() {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 초기화할 수 없습니다.');
        }

        this.cards = [];
        this.currentIndex = 0;
        return this;
    }

    generateRandom() {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 랜덤 생성할 수 없습니다.');
        }

        const choices = ['rock', 'paper', 'scissors'];
        this.clear();
        
        for (let i = 0; i < this.maxSize; i++) {
            const randomChoice = choices[Math.floor(Math.random() * choices.length)];
            this.cards.push(randomChoice);
        }
        
        return this;
    }

    getNextCard() {
        if (this.currentIndex >= this.cards.length) {
            throw new Error('덱에 사용할 수 있는 카드가 더 이상 없습니다.');
        }

        const card = this.cards[this.currentIndex];
        this.currentIndex++;
        return card;
    }

    getCard(index) {
        if (index < 0 || index >= this.cards.length) {
            throw new Error('유효하지 않은 인덱스입니다.');
        }
        
        return this.cards[index];
    }

    getCurrentCard() {
        if (this.currentIndex >= this.cards.length) {
            throw new Error('덱에 사용할 수 있는 카드가 더 이상 없습니다.');
        }

        return this.cards[this.currentIndex];
    }

    peekNext(offset = 0) {
        const index = this.currentIndex + offset;
        if (index < 0 || index >= this.cards.length) {
            return null;
        }
        return this.cards[index];
    }

    reset() {
        this.currentIndex = 0;
        return this;
    }

    lock() {
        this.isLocked = true;
        return this;
    }

    unlock() {
        this.isLocked = false;
        return this;
    }

    isFull() {
        return this.cards.length >= this.maxSize;
    }

    isEmpty() {
        return this.cards.length === 0;
    }

    isComplete() {
        return this.cards.length === this.maxSize;
    }

    hasMoreCards() {
        return this.currentIndex < this.cards.length;
    }

    isValidChoice(choice) {
        const validChoices = ['rock', 'paper', 'scissors'];
        return validChoices.includes(choice);
    }

    getSize() {
        return this.cards.length;
    }

    getMaxSize() {
        return this.maxSize;
    }

    getCurrentIndex() {
        return this.currentIndex;
    }

    getRemainingCards() {
        return this.cards.length - this.currentIndex;
    }

    getCards() {
        return [...this.cards];
    }

    getRemainingCardsArray() {
        return this.cards.slice(this.currentIndex);
    }

    toArray() {
        return [...this.cards];
    }

    toJSON() {
        return {
            cards: this.cards,
            maxSize: this.maxSize,
            currentIndex: this.currentIndex,
            isLocked: this.isLocked
        };
    }

    static fromJSON(data) {
        const deck = new Deck(data.maxSize);
        deck.cards = [...data.cards];
        deck.currentIndex = data.currentIndex;
        deck.isLocked = data.isLocked;
        return deck;
    }

    clone() {
        const clonedDeck = new Deck(this.maxSize);
        clonedDeck.cards = [...this.cards];
        clonedDeck.currentIndex = this.currentIndex;
        clonedDeck.isLocked = this.isLocked;
        return clonedDeck;
    }

    validate() {
        if (this.cards.length > this.maxSize) {
            throw new Error('덱 크기가 최대 크기를 초과했습니다.');
        }

        if (this.currentIndex < 0 || this.currentIndex > this.cards.length) {
            throw new Error('현재 인덱스가 유효하지 않습니다.');
        }

        for (let i = 0; i < this.cards.length; i++) {
            if (!this.isValidChoice(this.cards[i])) {
                throw new Error(`인덱스 ${i}의 카드가 유효하지 않습니다: ${this.cards[i]}`);
            }
        }

        return true;
    }

    getStats() {
        const stats = {
            rock: 0,
            paper: 0,
            scissors: 0
        };

        this.cards.forEach(card => {
            stats[card]++;
        });

        return {
            ...stats,
            total: this.cards.length,
            percentages: {
                rock: this.cards.length > 0 ? (stats.rock / this.cards.length * 100).toFixed(1) : 0,
                paper: this.cards.length > 0 ? (stats.paper / this.cards.length * 100).toFixed(1) : 0,
                scissors: this.cards.length > 0 ? (stats.scissors / this.cards.length * 100).toFixed(1) : 0
            }
        };
    }

    shuffle() {
        if (this.isLocked) {
            throw new Error('덱이 잠겨있어 셞플할 수 없습니다.');
        }

        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
        return this;
    }

    slice(start = 0, end) {
        return this.cards.slice(start, end);
    }

    toString() {
        const cardSymbols = {
            rock: '✊',
            paper: '✋',
            scissors: '✌️'
        };

        return this.cards.map((card, index) => {
            const symbol = cardSymbols[card];
            const marker = index === this.currentIndex ? '→' : ' ';
            return `${marker}${symbol}`;
        }).join(' ');
    }

    equals(otherDeck) {
        if (!(otherDeck instanceof Deck)) {
            return false;
        }

        return this.cards.length === otherDeck.cards.length &&
               this.cards.every((card, index) => card === otherDeck.cards[index]);
    }
}

module.exports = Deck;