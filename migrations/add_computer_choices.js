/**
 * 마이그레이션: streak_games 테이블에 computer_choices 컬럼 추가
 * 실행 방법: node migrations/add_computer_choices.js
 */

const Database = require('../database');

async function migrate() {
    const db = Database.getInstance();

    try {
        await db.init();
        console.log('✅ 데이터베이스 연결 성공');

        // 컬럼 존재 여부 확인
        const [columns] = await db.pool.query(`
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'streak_games'
            AND COLUMN_NAME = 'computer_choices'
        `);

        if (columns.length > 0) {
            console.log('ℹ️  computer_choices 컬럼이 이미 존재합니다.');
            return;
        }

        // 컬럼 추가
        await db.pool.query(`
            ALTER TABLE streak_games
            ADD COLUMN computer_choices JSON NOT NULL COMMENT '미리 생성된 100개의 컴퓨터 선택'
            AFTER user_id
        `);

        console.log('✅ computer_choices 컬럼이 추가되었습니다.');

        // 기존 데이터가 있다면 기본값 설정
        const [games] = await db.pool.query('SELECT id FROM streak_games WHERE computer_choices IS NULL');

        if (games.length > 0) {
            console.log(`ℹ️  ${games.length}개의 기존 게임에 기본 패 생성 중...`);

            const choices = ['rock', 'paper', 'scissors'];
            for (const game of games) {
                const computerChoices = Array.from({ length: 100 }, () =>
                    choices[Math.floor(Math.random() * choices.length)]
                );

                await db.pool.query(
                    'UPDATE streak_games SET computer_choices = ? WHERE id = ?',
                    [JSON.stringify(computerChoices), game.id]
                );
            }

            console.log('✅ 기존 게임에 기본 패가 설정되었습니다.');
        }

    } catch (error) {
        console.error('❌ 마이그레이션 실패:', error.message);
        throw error;
    } finally {
        await db.close();
    }
}

// 스크립트 직접 실행 시
if (require.main === module) {
    migrate()
        .then(() => {
            console.log('✅ 마이그레이션 완료');
            process.exit(0);
        })
        .catch((error) => {
            console.error('❌ 마이그레이션 실패:', error);
            process.exit(1);
        });
}

module.exports = migrate;
