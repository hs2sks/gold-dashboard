#!/bin/bash

# 금/은 시세 대시보드 - 빠른 배포 가이드

echo ""
echo "================================"
echo "  금/은 시세 대시보드 배포 도구"
echo "================================"
echo ""

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
NC='\033[0m' # No Color

# 1단계: 사전 확인
echo -e "${YELLOW}📋 1단계: 사전 확인 중...${NC}"
echo ""

# Git 설치 확인
if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git이 설치되어 있지 않습니다.${NC}"
    echo -e "${YELLOW}   https://git-scm.com/downloads 에서 Git을 설치해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Git 설치됨${NC}"

# Node.js 설치 확인
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js가 설치되어 있지 않습니다.${NC}"
    echo -e "${YELLOW}   https://nodejs.org/ 에서 Node.js를 설치해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js 설치됨 ($(node --version))${NC}"

# npm 확인
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm이 설치되어 있지 않습니다.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm 설치됨 ($(npm --version))${NC}"
echo ""

# 2단계: 프로젝트 빌드 테스트
echo -e "${YELLOW}📦 2단계: 프로젝트 빌드 테스트 중...${NC}"
echo ""

echo -e "${CYAN}   의존성 설치 중...${NC}"
npm install --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 의존성 설치 실패${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 의존성 설치 완료${NC}"

echo -e "${CYAN}   빌드 테스트 중...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ 빌드 실패${NC}"
    echo -e "${YELLOW}   에러를 확인하고 수정 후 다시 실행해주세요.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ 빌드 테스트 통과${NC}"
echo ""

# 3단계: Git 저장소 확인
echo -e "${YELLOW}📝 3단계: Git 저장소 확인 중...${NC}"
echo ""

if [ ! -d .git ]; then
    echo -e "${CYAN}   Git 저장소가 초기화되지 않았습니다. 초기화 중...${NC}"
    git init
    echo -e "${GREEN}✅ Git 저장소 초기화 완료${NC}"
else
    echo -e "${GREEN}✅ Git 저장소가 이미 초기화되어 있습니다.${NC}"
fi

# .gitignore 확인
if [ ! -f .gitignore ]; then
    echo -e "${CYAN}   .gitignore 파일 생성 중...${NC}"
    cat > .gitignore << 'EOF'
# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts
EOF
    echo -e "${GREEN}✅ .gitignore 파일 생성 완료${NC}"
fi

# Git 상태 확인
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${CYAN}   변경사항이 있습니다. 커밋 준비 중...${NC}"
    git add .
    git commit -m "Initial commit for deployment"
    echo -e "${GREEN}✅ 변경사항 커밋 완료${NC}"
else
    echo -e "${GREEN}✅ 변경사항 없음 또는 이미 커밋됨${NC}"
fi
echo ""

# 4단계: 원격 저장소 확인
echo -e "${YELLOW}🌐 4단계: GitHub 저장소 확인...${NC}"
echo ""

REMOTE_URL=$(git remote get-url origin 2>/dev/null)
if [ -n "$REMOTE_URL" ]; then
    echo -e "${GREEN}✅ GitHub 저장소가 연결되어 있습니다:${NC}"
    echo -e "${CYAN}   $REMOTE_URL${NC}"
    echo ""
    
    read -p "   GitHub에 push하시겠습니까? (Y/N): " PUSH_CONFIRM
    if [[ $PUSH_CONFIRM == "Y" || $PUSH_CONFIRM == "y" ]]; then
        git push origin main 2>/dev/null || git push origin master
        echo -e "${GREEN}✅ GitHub에 push 완료${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GitHub 저장소가 연결되어 있지 않습니다.${NC}"
    echo ""
    echo -e "${CYAN}   다음 단계를 따라주세요:${NC}"
    echo -e "${WHITE}   1. https://github.com/new 에서 새 저장소 생성${NC}"
    echo -e "${WHITE}   2. 저장소 이름: gold-dashboard${NC}"
    echo -e "${WHITE}   3. Public 선택${NC}"
    echo -e "${WHITE}   4. 'Create repository' 클릭${NC}"
    echo ""
    
    read -p "   생성한 저장소 URL을 입력하세요 (예: https://github.com/username/gold-dashboard.git): " REPO_URL
    if [ -n "$REPO_URL" ]; then
        git remote add origin "$REPO_URL"
        git branch -M main
        git push -u origin main
        echo -e "${GREEN}✅ GitHub 저장소 연결 및 push 완료${NC}"
    fi
fi
echo ""

# 5단계: Vercel 배포
echo -e "${YELLOW}🚀 5단계: Vercel 배포...${NC}"
echo ""

echo -e "${CYAN}   다음 단계를 따라주세요:${NC}"
echo ""
echo -e "${WHITE}   1. https://vercel.com 접속${NC}"
echo -e "${WHITE}   2. GitHub 계정으로 로그인${NC}"
echo -e "${WHITE}   3. 'Add New Project' 클릭${NC}"
echo -e "${WHITE}   4. 'Import Git Repository' 선택${NC}"
echo -e "${WHITE}   5. 'gold-dashboard' 저장소 선택${NC}"
echo -e "${WHITE}   6. Environment Variables 섹션에서:${NC}"
echo -e "${GRAY}      - METALS_API_KEY=[당신의_API_키]${NC}"
echo -e "${GRAY}      - DATA_GO_KR_SERVICE_KEY=[당신의_서비스_키]${NC}"
echo -e "${WHITE}   7. 'Deploy' 클릭${NC}"
echo ""

if command -v vercel &> /dev/null; then
    echo -e "${CYAN}   또는 명령어로 배포:${NC}"
    echo -e "${YELLOW}   vercel${NC}"
    echo ""
    
    read -p "   Vercel CLI로 배포하시겠습니까? (Y/N): " CLI_DEPLOY
    if [[ $CLI_DEPLOY == "Y" || $CLI_DEPLOY == "y" ]]; then
        vercel
    fi
else
    echo -e "${CYAN}   💡 Tip: Vercel CLI를 설치하면 명령어로도 배포할 수 있습니다:${NC}"
    echo -e "${YELLOW}   npm install -g vercel${NC}"
fi

echo ""
echo "================================"
echo -e "${GREEN}  ✅ 배포 준비 완료!${NC}"
echo "================================"
echo ""
echo -e "${YELLOW}📚 추가 자료:${NC}"
echo -e "${CYAN}   - 배포 가이드: DEPLOYMENT_GUIDE.md${NC}"
echo -e "${CYAN}   - 체크리스트: DEPLOY_CHECKLIST.md${NC}"
echo -e "${CYAN}   - API 키 발급: API_SETUP_GUIDE.md${NC}"
echo ""
echo -e "${GREEN}🎉 배포가 완료되면 제공된 URL로 어디서든 접속 가능합니다!${NC}"
echo ""
