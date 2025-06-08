# WebCompass - Guia de Deploy VPS com PM2

## Pré-requisitos da VPS Ubuntu

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 globalmente
sudo npm install -g pm2

# Instalar dependências do Puppeteer/Chrome
sudo apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libc6 \
  libcairo2 \
  libcups2 \
  libdbus-1-3 \
  libexpat1 \
  libfontconfig1 \
  libgbm1 \
  libgcc1 \
  libglib2.0-0 \
  libgtk-3-0 \
  libnspr4 \
  libnss3 \
  libpango-1.0-0 \
  libpangocairo-1.0-0 \
  libstdc++6 \
  libx11-6 \
  libx11-xcb1 \
  libxcb1 \
  libxcomposite1 \
  libxcursor1 \
  libxdamage1 \
  libxext6 \
  libxfixes3 \
  libxi6 \
  libxrandr2 \
  libxrender1 \
  libxss1 \
  libxtst6 \
  lsb-release \
  wget \
  xdg-utils

# Instalar Google Chrome
wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | sudo apt-key add -
sudo sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'
sudo apt-get update
sudo apt-get install -y google-chrome-stable
```

## Deploy do WebCompass

### 1. Clonar e Configurar

```bash
# Criar diretório do projeto
sudo mkdir -p /var/www/webcompass
sudo chown $USER:$USER /var/www/webcompass
cd /var/www/webcompass

# Clonar código (substitua pela sua URL)
git clone https://github.com/seu-usuario/webcompass.git .

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
nano .env
```

### 2. Configurar Arquivo .env

```bash
# Editar configurações
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 3. Build e Deploy

```bash
# Fazer build da aplicação
npm run build

# Criar diretório de logs
mkdir -p logs

# Iniciar com PM2
pm2 start ecosystem.config.js --env production

# Salvar configuração PM2
pm2 save
pm2 startup
```

## Configuração do Firewall

```bash
# Abrir porta 5000
sudo ufw allow 5000
sudo ufw status
```

## Configuração do Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Criar configuração
sudo nano /etc/nginx/sites-available/webcompass
```

### Configuração do Nginx:

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
    }

    # Configuração para screenshots
    location /screenshots/ {
        alias /var/www/webcompass/dist/screenshots/;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Configuração PWA
    location /manifest.json {
        add_header Cache-Control "public, max-age=604800";
    }

    location /sw.js {
        add_header Cache-Control "no-cache";
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/webcompass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## SSL com Certbot (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obter certificado SSL
sudo certbot --nginx -d seu-dominio.com

# Auto-renovação
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Comandos PM2 Úteis

```bash
# Visualizar status
pm2 status

# Ver logs em tempo real
pm2 logs webcompass-proxy

# Reiniciar aplicação
pm2 restart webcompass-proxy

# Parar aplicação
pm2 stop webcompass-proxy

# Monitoramento
pm2 monit

# Visualizar métricas
pm2 show webcompass-proxy
```

## Configuração de Monitoramento

```bash
# Instalar PM2 Web Monitor (opcional)
pm2 install pm2-server-monit

# Configurar alertas por email
pm2 set pm2-server-monit:email your-email@domain.com
```

## Scripts de Backup

```bash
# Criar script de backup
sudo nano /usr/local/bin/backup-webcompass.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/webcompass"
APP_DIR="/var/www/webcompass"

mkdir -p $BACKUP_DIR

# Backup do código
tar -czf $BACKUP_DIR/webcompass_$DATE.tar.gz $APP_DIR

# Manter apenas últimos 7 backups
find $BACKUP_DIR -name "webcompass_*.tar.gz" -mtime +7 -delete

echo "Backup completed: webcompass_$DATE.tar.gz"
```

```bash
# Tornar executável
sudo chmod +x /usr/local/bin/backup-webcompass.sh

# Configurar cron para backup diário
sudo crontab -e
# Adicionar: 0 2 * * * /usr/local/bin/backup-webcompass.sh
```

## Acessar a Aplicação

Após o deploy, a aplicação estará disponível em:
- **HTTP**: `http://seu-ip-vps:5000`
- **Com Nginx**: `http://seu-dominio.com`
- **Com SSL**: `https://seu-dominio.com`

## Funcionalidades PWA

A aplicação agora é um PWA completo:
- **Instalável**: Botão "Install App" aparece no navegador
- **Offline**: Funciona sem conexão para funcionalidades básicas
- **Responsivo**: Otimizado para desktop e mobile
- **Service Worker**: Cache inteligente de recursos

## Troubleshooting

### Puppeteer não funciona:
```bash
# Verificar Chrome
google-chrome-stable --version

# Testar manualmente
node -e "const puppeteer = require('puppeteer'); (async () => { const browser = await puppeteer.launch({headless: true}); console.log('OK'); await browser.close(); })()"
```

### PM2 não inicia:
```bash
# Limpar processos PM2
pm2 kill
pm2 resurrect

# Verificar logs
pm2 logs --lines 100
```

### Problemas de permissão:
```bash
# Ajustar permissões
sudo chown -R $USER:$USER /var/www/webcompass
chmod -R 755 /var/www/webcompass
```

## Atualização da Aplicação

```bash
cd /var/www/webcompass

# Backup antes da atualização
/usr/local/bin/backup-webcompass.sh

# Atualizar código
git pull origin main

# Reinstalar dependências se necessário
npm install

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart webcompass-proxy
```

## Configuração de Performance

```bash
# Configurar limites do sistema
echo "fs.file-max = 65536" | sudo tee -a /etc/sysctl.conf
echo "* soft nofile 65536" | sudo tee -a /etc/security/limits.conf
echo "* hard nofile 65536" | sudo tee -a /etc/security/limits.conf

# Aplicar mudanças
sudo sysctl -p
```

O WebCompass está agora configurado como PWA e pronto para deploy profissional na VPS com PM2!