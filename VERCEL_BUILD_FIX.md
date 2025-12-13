# Vercel 빌드 오류 해결 가이드

## 문제: 빌드 시 "the URL must start with the protocol `postgresql://` or `postgres://`" 오류

이 오류는 Vercel 빌드 시점에 `DATABASE_URL` 환경 변수가 올바르게 로드되지 않을 때 발생합니다.

## 즉시 확인해야 할 사항

### 1. Vercel 환경 변수 확인 (가장 중요!)

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. **Settings** → **Environment Variables** 클릭
3. `DATABASE_URL` 찾기
4. **값 확인**:
   - ✅ 올바른 형식: `postgresql://...` 또는 `postgres://...`
   - ❌ 잘못된 형식: `file:./dev.db` 또는 빈 값

### 2. 환경 변수 적용 범위 확인

각 환경 변수 옆에 체크박스가 있습니다:
- ✅ **Production** - 프로덕션 배포에 적용
- ✅ **Preview** - 프리뷰 배포에 적용  
- ✅ **Development** - 개발 환경에 적용

**중요**: `DATABASE_URL`이 **모든 환경(Production, Preview, Development)**에 체크되어 있는지 확인하세요!

### 3. DATABASE_URL 값 수정

만약 `DATABASE_URL`이 `postgres://`로 시작한다면:

1. `DATABASE_URL` 클릭하여 편집
2. `postgres://`를 `postgresql://`로 변경
3. **모든 환경에 적용** 체크
4. **Save** 클릭

**예시:**
```
변경 전: postgres://38f32cb7...@db.prisma.io:5432/postgres?sslmode=require
변경 후: postgresql://38f32cb7...@db.prisma.io:5432/postgres?sslmode=require
```

### 4. .env 파일 확인

로컬에 `.env` 파일이 있고 Git에 포함되어 있다면, Vercel 빌드 시 이 파일이 사용될 수 있습니다.

**확인 방법:**
```bash
git ls-files | grep .env
```

만약 `.env` 파일이 Git에 포함되어 있다면:
1. `.env` 파일 삭제 또는 `.gitignore`에 추가
2. `.env.local`만 사용 (이미 `.gitignore`에 포함됨)

### 5. 재배포

환경 변수를 수정한 후:
1. Vercel 대시보드에서 **Deployments** 탭 클릭
2. 최신 배포 옆 **"..."** 메뉴 클릭
3. **"Redeploy"** 선택
4. 또는 GitHub에 푸시하여 자동 재배포

## 단계별 체크리스트

- [ ] Vercel Dashboard → Settings → Environment Variables 확인
- [ ] `DATABASE_URL`이 `postgresql://`로 시작하는지 확인
- [ ] `DATABASE_URL`이 Production, Preview, Development 모두에 적용되었는지 확인
- [ ] `.env` 파일이 Git에 포함되어 있지 않은지 확인
- [ ] 환경 변수 저장 후 재배포

## 디버깅 팁

### 빌드 로그에서 환경 변수 확인

Vercel 배포 로그에서:
1. **Build Logs** 탭 확인
2. `prisma generate` 실행 부분 찾기
3. 오류 메시지 확인

### 로컬에서 테스트

로컬에서 빌드 테스트:
```bash
# .env.local에 올바른 DATABASE_URL 설정 후
npm run build
```

성공하면 Vercel 환경 변수만 확인하면 됩니다.

## 여전히 문제가 있다면

1. Vercel Postgres를 다시 생성
2. 새로운 `DATABASE_URL` 복사
3. 환경 변수에 새로 설정
4. 재배포



