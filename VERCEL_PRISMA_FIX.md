# Vercel Prisma Query Engine 오류 해결 가이드

## 문제
Vercel 배포 시 다음과 같은 오류 발생:
```
Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"
```

## 해결 방법

### 1. Prisma Schema 수정 (완료)
`prisma/schema.prisma`의 generator에 `binaryTargets` 추가:
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

### 2. 로컬에서 Prisma 재생성
```bash
npx prisma generate
```

### 3. 변경사항 커밋 및 푸시
```bash
git add prisma/schema.prisma
git commit -m "Fix Prisma binary targets for Vercel"
git push
```

### 4. Vercel 재배포
- Vercel Dashboard에서 자동으로 재배포되거나
- 수동으로 "Redeploy" 클릭

## 추가 확인 사항

### package.json 확인
- `postinstall` 스크립트에 `prisma generate`가 있는지 확인
- `build` 스크립트에 `prisma generate`가 포함되어 있는지 확인

### vercel.json 확인
- `buildCommand`에 `prisma generate`가 포함되어 있는지 확인

## 문제가 계속되면

1. **Prisma 버전 업데이트**:
   ```bash
   npm install prisma@latest @prisma/client@latest
   ```

2. **Vercel 빌드 로그 확인**:
   - Vercel Dashboard → Deployments → Build Logs
   - `prisma generate`가 실행되었는지 확인

3. **환경 변수 확인**:
   - `DATABASE_URL`이 올바르게 설정되어 있는지 확인

4. **캐시 클리어**:
   - Vercel Dashboard → Settings → Clear Build Cache

## 참고
- `binaryTargets`에 `"native"`는 로컬 개발용
- `"rhel-openssl-3.0.x"`는 Vercel의 Linux 환경용
- 두 개를 모두 포함하면 로컬과 프로덕션 모두에서 작동합니다


