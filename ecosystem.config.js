module.exports = {
  apps: [
    {
      name: 'webcompass-proxy',
      script: 'dist/index.js', // <--- CORREÇÃO: Aponta para o arquivo JS compilado
      // interpreter: 'tsx', // <--- CORREÇÃO: Removido/Comentado para produção, pois não é necessário para o código compilado
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '500M',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        HOST: '0.0.0.0'
      },
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_restarts: 10,
      min_uptime: '10s',
      restart_delay: 4000,
      autorestart: true,
      kill_timeout: 1600
    }
  ],
  deploy: {
    production: {
      user: 'root',
      host: 'YOUR_VPS_IP', // <--- Lembre-se de substituir pelo IP externo da sua VPS
      ref: 'origin/main',
      repo: 'https://github.com/jeanoliveirafs/WebCompassProxy.git',
      path: '/var/www/webcompass',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.cjs --env production',
      'pre-setup': ''
    }
  }
};
