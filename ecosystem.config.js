// 현재 날짜를 YYYY-MM-DD 형식으로 생성
const now = new Date();
const logDate = now.toISOString().split('T')[0]; // YYYY-MM-DD

module.exports = {
  apps: [{
    name: 'rps-game',
    script: './app.js',

    // 개발 환경 설정
    watch: true,
    watch_delay: 1000,
    ignore_watch: [
      'node_modules',
      'logs',
      '*.log',
      '.git',
      'public'
    ],

    // 환경 변수
    env_development: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },

    // 로그 설정 - 날짜별 로그 파일
    error_file: `./logs/${logDate}-error.log`,
    out_file: `./logs/${logDate}-out.log`,
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,

    // 로그 로테이션 설정 (pm2-logrotate 자동 설치됨)
    // - max_size: 10M (로그 파일이 10MB 넘으면 로테이션)
    // - retain: 30 (최근 30개 로그 파일 보관)
    // - compress: true (오래된 로그 gzip 압축)
    // - rotateInterval: 0 0 * * * (매일 자정에 로테이션)
    // 설정 확인: pm2 conf
    // 수동 설정: pm2 set pm2-logrotate:max_size 10M

    // 프로세스 관리
    instances: 1,
    exec_mode: 'fork',

    // 자동 재시작 설정
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '500M',

    // 에러 발생 시 재시작 대기 시간
    restart_delay: 4000
  }]
};
