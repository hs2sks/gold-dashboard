# 금/은 시세 대시보드 - 빠른 배포 가이드

Write-Host "================================" -ForegroundColor Cyan
Write-Host "  금/은 시세 대시보드 배포 도구" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# 1단계: 사전 확인
Write-Host "📋 1단계: 사전 확인 중..." -ForegroundColor Yellow
Write-Host ""

# Git 설치 확인
$gitInstalled = Get-Command git -ErrorAction SilentlyContinue
if (-not $gitInstalled) {
    Write-Host "❌ Git이 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "   https://git-scm.com/download/win 에서 Git을 설치해주세요." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Git 설치됨" -ForegroundColor Green

# Node.js 설치 확인
$nodeInstalled = Get-Command node -ErrorAction SilentlyContinue
if (-not $nodeInstalled) {
    Write-Host "❌ Node.js가 설치되어 있지 않습니다." -ForegroundColor Red
    Write-Host "   https://nodejs.org/ 에서 Node.js를 설치해주세요." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Node.js 설치됨 ($(node --version))" -ForegroundColor Green

# npm 확인
$npmInstalled = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmInstalled) {
    Write-Host "❌ npm이 설치되어 있지 않습니다." -ForegroundColor Red
    exit 1
}
Write-Host "✅ npm 설치됨 ($(npm --version))" -ForegroundColor Green
Write-Host ""

# 2단계: 프로젝트 빌드 테스트
Write-Host "📦 2단계: 프로젝트 빌드 테스트 중..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   의존성 설치 중..." -ForegroundColor Cyan
npm install --silent
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 의존성 설치 실패" -ForegroundColor Red
    exit 1
}
Write-Host "✅ 의존성 설치 완료" -ForegroundColor Green

Write-Host "   빌드 테스트 중..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 빌드 실패" -ForegroundColor Red
    Write-Host "   에러를 확인하고 수정 후 다시 실행해주세요." -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ 빌드 테스트 통과" -ForegroundColor Green
Write-Host ""

# 3단계: Git 저장소 확인
Write-Host "📝 3단계: Git 저장소 확인 중..." -ForegroundColor Yellow
Write-Host ""

$gitInitialized = Test-Path .git
if (-not $gitInitialized) {
    Write-Host "   Git 저장소가 초기화되지 않았습니다. 초기화 중..." -ForegroundColor Cyan
    git init
    Write-Host "✅ Git 저장소 초기화 완료" -ForegroundColor Green
} else {
    Write-Host "✅ Git 저장소가 이미 초기화되어 있습니다." -ForegroundColor Green
}

# .gitignore 확인
if (-not (Test-Path .gitignore)) {
    Write-Host "   .gitignore 파일 생성 중..." -ForegroundColor Cyan
    @"
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
"@ | Out-File -FilePath .gitignore -Encoding utf8
    Write-Host "✅ .gitignore 파일 생성 완료" -ForegroundColor Green
}

# Git 상태 확인
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   변경사항이 있습니다. 커밋 준비 중..." -ForegroundColor Cyan
    git add .
    git commit -m "Initial commit for deployment"
    Write-Host "✅ 변경사항 커밋 완료" -ForegroundColor Green
} else {
    Write-Host "✅ 변경사항 없음 또는 이미 커밋됨" -ForegroundColor Green
}
Write-Host ""

# 4단계: 원격 저장소 확인
Write-Host "🌐 4단계: GitHub 저장소 확인..." -ForegroundColor Yellow
Write-Host ""

$remoteUrl = git remote get-url origin 2>$null
if ($remoteUrl) {
    Write-Host "✅ GitHub 저장소가 연결되어 있습니다:" -ForegroundColor Green
    Write-Host "   $remoteUrl" -ForegroundColor Cyan
    Write-Host ""
    
    $pushConfirm = Read-Host "   GitHub에 push하시겠습니까? (Y/N)"
    if ($pushConfirm -eq 'Y' -or $pushConfirm -eq 'y') {
        git push origin main
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   main 브랜치 push 실패. master 브랜치 시도 중..." -ForegroundColor Yellow
            git push origin master
        }
        Write-Host "✅ GitHub에 push 완료" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  GitHub 저장소가 연결되어 있지 않습니다." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   다음 단계를 따라주세요:" -ForegroundColor Cyan
    Write-Host "   1. https://github.com/new 에서 새 저장소 생성" -ForegroundColor White
    Write-Host "   2. 저장소 이름: gold-dashboard" -ForegroundColor White
    Write-Host "   3. Public 선택" -ForegroundColor White
    Write-Host "   4. 'Create repository' 클릭" -ForegroundColor White
    Write-Host ""
    
    $repoUrl = Read-Host "   생성한 저장소 URL을 입력하세요 (예: https://github.com/username/gold-dashboard.git)"
    if ($repoUrl) {
        git remote add origin $repoUrl
        git branch -M main
        git push -u origin main
        Write-Host "✅ GitHub 저장소 연결 및 push 완료" -ForegroundColor Green
    }
}
Write-Host ""

# 5단계: Vercel 배포
Write-Host "🚀 5단계: Vercel 배포..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   다음 단계를 따라주세요:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   1. https://vercel.com 접속" -ForegroundColor White
Write-Host "   2. GitHub 계정으로 로그인" -ForegroundColor White
Write-Host "   3. 'Add New Project' 클릭" -ForegroundColor White
Write-Host "   4. 'Import Git Repository' 선택" -ForegroundColor White
Write-Host "   5. 'gold-dashboard' 저장소 선택" -ForegroundColor White
Write-Host "   6. Environment Variables 섹션에서:" -ForegroundColor White
Write-Host "      - METALS_API_KEY=[당신의_API_키]" -ForegroundColor Gray
Write-Host "      - EXCHANGE_RATE_API_KEY=[당신의_환율_API_키]" -ForegroundColor Gray
Write-Host "      - DATA_GO_KR_SERVICE_KEY=[당신의_서비스_키]" -ForegroundColor Gray
Write-Host "   7. 'Deploy' 클릭" -ForegroundColor White
Write-Host ""

$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if ($vercelInstalled) {
    Write-Host "   또는 명령어로 배포:" -ForegroundColor Cyan
    Write-Host "   vercel" -ForegroundColor Yellow
    Write-Host ""
    
    $cliDeploy = Read-Host "   Vercel CLI로 배포하시겠습니까? (Y/N)"
    if ($cliDeploy -eq 'Y' -or $cliDeploy -eq 'y') {
        vercel
    }
} else {
    Write-Host "   💡 Tip: Vercel CLI를 설치하면 명령어로도 배포할 수 있습니다:" -ForegroundColor Cyan
    Write-Host "   npm install -g vercel" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "  ✅ 배포 준비 완료!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 추가 자료:" -ForegroundColor Yellow
Write-Host "   - 배포 가이드: DEPLOYMENT_GUIDE.md" -ForegroundColor Cyan
Write-Host "   - 체크리스트: DEPLOY_CHECKLIST.md" -ForegroundColor Cyan
Write-Host "   - API 키 발급: API_SETUP_GUIDE.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎉 배포가 완료되면 제공된 URL로 어디서든 접속 가능합니다!" -ForegroundColor Green
Write-Host ""
