# 프로젝트 위치 설정
REPOSITORY=/home/ubuntu/LocalMingle-BE

# 프로젝트 위치로 이동
cd $REPOSITORY

# 의존성 설치
echo "> install dependency"
npm install

# 프로젝트 build
echo "> build application"
nest build

# pm2 실행 또는 리로드
if pm2 list | grep -q "LocalMingle-BE"; then
  echo "> reload application"
  pm2 reload LocalMingle-BE
else
  echo "> start application"
  pm2 start dist/src/main.js --name LocalMingle-BE
fi