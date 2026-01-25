# 🌐 외부 접속 가능하도록 만들기

금/은 시세 대시보드를 집 밖에서도 접속할 수 있도록 만드는 방법입니다.

---

## 🎯 결론 요약

### ✅ 가장 쉬운 방법: Vercel 무료 배포

**장점:**
- 💰 **완전 무료**
- ⚡ **15-20분 안에 완료**
- 🌐 **전 세계 어디서든 접속**
- 🔒 **HTTPS 자동 적용**
- 📱 **모바일 지원**
- 🔄 **자동 배포** (코드 수정 시)

---

## 🚀 3단계 배포

### 1단계: GitHub에 코드 올리기

```bash
cd gold-dashboard
git init
git add .
git commit -m "Initial commit"

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/your-username/gold-dashboard.git
git push -u origin main
```

### 2단계: Vercel 연동

1. [Vercel.com](https://vercel.com) 접속
2. GitHub 계정으로 로그인
3. "Add New Project" → 저장소 선택
4. "Import" 클릭

### 3단계: 환경 변수 및 배포

1. Environment Variables 추가:
   - `METALS_API_KEY`
   - `DATA_GO_KR_SERVICE_KEY`
2. "Deploy" 클릭
3. 완료! 🎉

---

## ⚡ 더 빠른 방법: 자동 스크립트

```powershell
# Windows
.\deploy.ps1

# Mac/Linux
./deploy.sh
```

스크립트가 모든 것을 자동으로 처리합니다!

---

## 📱 배포 후 할 일

### 스마트폰에 추가하기

**iPhone:**
1. Safari로 접속
2. 공유 버튼 → "홈 화면에 추가"

**Android:**
1. Chrome으로 접속
2. 메뉴(⋮) → "홈 화면에 추가"

### 북마크 저장

제공받은 URL(예: `https://gold-dashboard-xxx.vercel.app`)을 북마크에 저장하세요.

---

## 💰 비용

- **호스팅**: 무료 (Vercel)
- **도메인**: 선택사항 (연간 1-2만원)
- **API**: 무료 플랜 사용 가능

**총 비용: 0원** (무료 URL 사용 시)

---

## 🔄 코드 업데이트 방법

```bash
# 코드 수정 후
git add .
git commit -m "업데이트"
git push

# → Vercel이 자동으로 재배포! (1-2분)
```

---

## 📚 상세 가이드

더 자세한 내용은 다음 문서를 참조하세요:

| 문서 | 내용 | 소요 시간 |
|------|------|-----------|
| [⚡ QUICKSTART.md](./QUICKSTART.md) | 빠른 배포 | 15분 |
| [✅ DEPLOY_CHECKLIST.md](./DEPLOY_CHECKLIST.md) | 체크리스트 | 20분 |
| [📘 DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) | 상세 가이드 | 필요시 |
| [🔑 API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md) | API 키 발급 | 10-15분 |

---

## ✨ 배포 후 효과

### Before (로컬 실행)
- ❌ 집에서만 접속 가능
- ❌ 컴퓨터 켜져 있어야 함
- ❌ `localhost:3000`으로만 접속

### After (Vercel 배포)
- ✅ **어디서든** 접속 가능
- ✅ 컴퓨터 꺼져 있어도 OK
- ✅ `https://your-app.vercel.app`로 접속
- ✅ 스마트폰에서도 접속
- ✅ 회사, 카페, 여행지에서도 접속

---

## 🌍 사용 시나리오

### 시나리오 1: 출근길 지하철
📱 스마트폰으로 오늘의 금시세 확인

### 시나리오 2: 회사에서
💼 점심시간에 실시간 시세 체크

### 시나리오 3: 카페에서
☕ 친구에게 대시보드 URL 공유

### 시나리오 4: 여행 중
✈️ 해외에서도 한국 금시세 확인

---

## ❓ FAQ

### Q: 완전 무료인가요?

**A**: 네! Vercel 무료 플랜으로 충분합니다.

### Q: 설정 어렵나요?

**A**: 아니요! 클릭 몇 번이면 완료됩니다. 자동 스크립트도 제공합니다.

### Q: API 키 없이도 되나요?

**A**: 네! Mock 데이터로 작동합니다.

### Q: 배포 시간은?

**A**: 처음 배포는 15-20분, 이후 업데이트는 1-2분입니다.

### Q: 모바일에서도 잘 되나요?

**A**: 네! 반응형 디자인으로 모든 기기에서 완벽하게 작동합니다.

---

## 🎉 결론

**Vercel 무료 배포**를 사용하면:
- ⏱️ **15-20분**만에 완료
- 💰 **무료**
- 🌐 **전 세계 어디서든** 접속 가능

**지금 바로 시작하세요!** → [⚡ QUICKSTART.md](./QUICKSTART.md)

---

**마지막 업데이트**: 2026-01-25
