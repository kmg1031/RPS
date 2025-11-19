class AchievementManager {
    constructor(database) {
        this.db = database;
        this.achievements = new Map(); // 캐시된 업적 정보
        this.userProgress = new Map(); // 사용자 진행도 캐시
    }

    // 업적 시스템 초기화
    async init() {
        try {
            await this.loadAchievements();
            await this.createDefaultAchievements();
            console.log('✅ 업적 시스템 초기화 완료');
        } catch (error) {
            console.error('❌ 업적 시스템 초기화 실패:', error);
            throw error;
        }
    }

    // 업적 데이터를 메모리로 로드
    async loadAchievements() {
        try {
            const achievements = await this.db.getAllAchievements();
            this.achievements.clear();

            achievements.forEach(achievement => {
                this.achievements.set(achievement.achievement_key, {
                    id: achievement.id,
                    key: achievement.achievement_key,
                    name: achievement.name,
                    description: achievement.description,
                    category: achievement.category,
                    icon: achievement.icon,
                    target_value: achievement.target_value,
                    reward_points: achievement.reward_points,
                    difficulty: achievement.difficulty,
                    is_hidden: achievement.is_hidden,
                    is_active: achievement.is_active
                });
            });

            console.log(`📋 ${achievements.length}개의 업적을 로드했습니다.`);
        } catch (error) {
            console.error('업적 로드 실패:', error);
            throw error;
        }
    }

    // 기본 업적들 생성
    async createDefaultAchievements() {
        const defaultAchievements = [
            // 게임 플레이 업적
            {
                key: 'first_game',
                name: '첫 게임',
                description: '첫 번째 게임을 완료하세요',
                category: 'GAMEPLAY',
                icon: '🎮',
                target_value: 1,
                reward_points: 10,
                difficulty: 'easy'
            },
            {
                key: 'first_round',
                name: '첫 라운드',
                description: '첫 번째 라운드를 완료하세요',
                category: 'GAMEPLAY',
                icon: '🏁',
                target_value: 1,
                reward_points: 50,
                difficulty: 'easy'
            },
            {
                key: 'enthusiastic_player',
                name: '열정적인 플레이어',
                description: '10라운드를 완료하세요',
                category: 'GAMEPLAY',
                icon: '⚡',
                target_value: 10,
                reward_points: 100,
                difficulty: 'easy'
            },

            // 연속 기록 업적
            {
                key: 'first_win',
                name: '첫 승리',
                description: '첫 게임 승리를 달성하세요',
                category: 'STREAK',
                icon: '🏆',
                target_value: 1,
                reward_points: 20,
                difficulty: 'easy'
            },
            {
                key: 'game_win_streak_3',
                name: '연승 시작',
                description: '3게임 연승을 달성하세요',
                category: 'STREAK',
                icon: '🔥',
                target_value: 3,
                reward_points: 50,
                difficulty: 'easy'
            },
            {
                key: 'game_win_streak_10',
                name: '승리의 연쇄',
                description: '10게임 연승을 달성하세요',
                category: 'STREAK',
                icon: '⚡',
                target_value: 10,
                reward_points: 200,
                difficulty: 'normal'
            },

            // 컬렉션 업적
            {
                key: 'rock_maniac',
                name: '바위 매니아',
                description: '바위를 100번 사용하세요',
                category: 'COLLECTION',
                icon: '✊',
                target_value: 100,
                reward_points: 50,
                difficulty: 'easy'
            },
            {
                key: 'paper_collector',
                name: '보 수집가',
                description: '보를 100번 사용하세요',
                category: 'COLLECTION',
                icon: '✋',
                target_value: 100,
                reward_points: 50,
                difficulty: 'easy'
            },
            {
                key: 'scissors_lover',
                name: '가위 애호가',
                description: '가위를 100번 사용하세요',
                category: 'COLLECTION',
                icon: '✌️',
                target_value: 100,
                reward_points: 50,
                difficulty: 'easy'
            },

            // 이정표 업적
            {
                key: 'hundred_points',
                name: '백점 돌파',
                description: '총 100점을 달성하세요',
                category: 'MILESTONE',
                icon: '💯',
                target_value: 100,
                reward_points: 50,
                difficulty: 'normal'
            }
        ];

        let createdCount = 0;

        for (const achievementData of defaultAchievements) {
            try {
                // 이미 존재하는지 확인
                const existing = await this.db.getAchievementByKey(achievementData.key);
                if (!existing) {
                    await this.db.createAchievement(achievementData);
                    createdCount++;
                }
            } catch (error) {
                console.error(`업적 생성 실패 (${achievementData.key}):`, error.message);
            }
        }

        if (createdCount > 0) {
            console.log(`🎯 ${createdCount}개의 새로운 업적을 생성했습니다.`);
            await this.loadAchievements(); // 새로 생성된 업적 다시 로드
        }
    }

    // 게임 완료 이벤트 처리
    async onGameComplete(userId, gameData) {
        if (!userId) return; // 게스트 모드는 업적 처리 안함

        try {
            const eventData = {
                type: 'GAME_COMPLETE',
                choice: gameData.playerChoice,
                result: gameData.result,
                pointsEarned: gameData.pointsEarned || 0
            };

            await this.checkAchievements(userId, eventData);
        } catch (error) {
            console.error('게임 완료 업적 처리 오류:', error);
        }
    }

    // 라운드 완료 이벤트 처리
    async onRoundComplete(userId, roundData) {
        if (!userId) return;

        try {
            const eventData = {
                type: 'ROUND_COMPLETE',
                playerScore: roundData.playerScore,
                computerScore: roundData.computerScore,
                gameResults: roundData.gameResults
            };

            await this.checkAchievements(userId, eventData);
        } catch (error) {
            console.error('라운드 완료 업적 처리 오류:', error);
        }
    }

    // 연속 기록 이벤트 처리
    async onStreak(userId, streakData) {
        if (!userId) return;

        try {
            const eventData = {
                type: 'STREAK',
                streakType: streakData.type, // 'WIN' or 'LOSE'
                streakCount: streakData.count
            };

            await this.checkAchievements(userId, eventData);
        } catch (error) {
            console.error('연속 기록 업적 처리 오류:', error);
        }
    }

    // 업적 확인 및 업데이트
    async checkAchievements(userId, eventData) {
        const relevantAchievements = this.getAchievementsByEvent(eventData.type);

        for (const achievement of relevantAchievements) {
            await this.updateProgress(userId, achievement, eventData);
        }
    }

    // 이벤트 타입별 관련 업적 가져오기
    getAchievementsByEvent(eventType) {
        const eventMap = {
            'GAME_COMPLETE': ['first_game', 'rock_maniac', 'paper_collector', 'scissors_lover'],
            'ROUND_COMPLETE': ['first_round', 'enthusiastic_player', 'hundred_points'],
            'STREAK': ['first_win', 'game_win_streak_3', 'game_win_streak_10']
        };

        const keys = eventMap[eventType] || [];
        return keys.map(key => this.achievements.get(key)).filter(Boolean);
    }

    // 진행도 업데이트
    async updateProgress(userId, achievement, eventData) {
        try {
            const current = await this.db.getUserProgress(userId, achievement.id);
            let increment = this.calculateIncrement(achievement, eventData);

            if (increment === 0) return;

            const oldValue = current.current_value || 0;
            const newValue = oldValue + increment;

            // 진행도 업데이트
            await this.db.updateAchievementProgress(userId, achievement.id, newValue);

            // 로그 기록
            await this.db.logAchievementProgress(userId, achievement.id, 'progress', oldValue, newValue, eventData);

            // 달성 확인
            if (newValue >= achievement.target_value && !current.is_completed) {
                await this.completeAchievement(userId, achievement);
            }

        } catch (error) {
            console.error(`업적 진행도 업데이트 실패 (${achievement.key}):`, error);
        }
    }

    // 증가치 계산
    calculateIncrement(achievement, eventData) {
        switch (achievement.category) {
            case 'GAMEPLAY':
                if (achievement.key === 'first_game') return 1;
                if (achievement.key === 'first_round' && eventData.type === 'ROUND_COMPLETE') return 1;
                if (achievement.key === 'enthusiastic_player' && eventData.type === 'ROUND_COMPLETE') return 1;
                break;

            case 'COLLECTION':
                if (eventData.type === 'GAME_COMPLETE') {
                    if (achievement.key === 'rock_maniac' && eventData.choice === 'rock') return 1;
                    if (achievement.key === 'paper_collector' && eventData.choice === 'paper') return 1;
                    if (achievement.key === 'scissors_lover' && eventData.choice === 'scissors') return 1;
                }
                break;

            case 'STREAK':
                if (eventData.type === 'STREAK' && eventData.streakType === 'WIN') {
                    if (achievement.key === 'first_win' && eventData.streakCount >= 1) return 1;
                    if (achievement.key === 'game_win_streak_3' && eventData.streakCount === 3) return 1;
                    if (achievement.key === 'game_win_streak_10' && eventData.streakCount === 10) return 1;
                }
                break;

            case 'MILESTONE':
                if (achievement.key === 'hundred_points' && eventData.type === 'ROUND_COMPLETE') {
                    return eventData.playerScore || 0;
                }
                break;
        }

        return 0;
    }

    // 업적 달성 처리
    async completeAchievement(userId, achievement) {
        try {
            // 업적 완료 마킹
            await this.db.completeAchievement(userId, achievement.id);

            // 보상 지급
            await this.db.updateUserPoints(userId, achievement.reward_points);

            // 로그 기록
            await this.db.logAchievementProgress(userId, achievement.id, 'complete', 0, achievement.target_value);

            console.log(`🎉 사용자 ${userId}가 업적 "${achievement.name}"을 달성했습니다! (+${achievement.reward_points}점)`);

            // 클라이언트 알림을 위한 정보 반환
            return {
                achievement,
                reward_points: achievement.reward_points
            };

        } catch (error) {
            console.error(`업적 완료 처리 실패 (${achievement.key}):`, error);
            throw error;
        }
    }

    // 사용자 업적 목록 조회
    async getUserAchievements(userId) {
        return await this.db.getUserAchievements(userId);
    }

    // 업적 통계 조회
    async getAchievementStats(userId) {
        return await this.db.getAchievementStats(userId);
    }

    // 모든 업적 목록 조회 (공개용)
    async getAllPublicAchievements() {
        return Array.from(this.achievements.values()).filter(a => !a.is_hidden && a.is_active);
    }
}

module.exports = AchievementManager;