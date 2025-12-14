# Vercel Prisma Query Engine 최종 해결책

## 문제
Vercel 배포 시 `query-engine-rhel-openssl-3.0.x` 파일을 찾을 수 없는 오류

## 최종 해결책

### 1. Prisma Schema 설정 ✅
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```
⚠️ **중요**: `engineType = "binary"`를 제거했습니다. Prisma 5.22.0에서는 기본적으로 바이너리 엔진을 사용합니다.

### 2. Next.js 설정 ✅
`next.config.js`에 `outputFileTracingIncludes` 추가:
```js
outputFileTracingIncludes: {
  '*': [
    './node_modules/.prisma/client/**/*',
    './node_modules/@prisma/client/**/*',
  ],
}
```

### 3. package.json 설정 ✅
- Prisma 버전: `5.22.0` (정확한 버전 고정, `^` 제거)
- `vercel-build` 스크립트: `prisma generate && next build`
- `postinstall` 스크립트: `prisma generate`

### 4. vercel.json 설정 ✅
```json
{
  "buildCommand": "npm run vercel-build"
}
```

## 배포 전 확인

### 1. 로컬 빌드 테스트
```bash
npm run build
```

### 2. Prisma 바이너리 확인
```bash
# Windows PowerShell
dir node_modules\.prisma\client\libquery_engine-rhel-openssl-3.0.x.so.node

# 파일이 존재하는지 확인
```

### 3. Git 커밋
```bash
git add .
git commit -m "Fix Prisma Query Engine for Vercel - final solution"
git push
```

## Vercel 배포 후 확인

### 빌드 로그에서 확인:
1. ✅ `prisma generate` 실행 확인
2. ✅ `rhel-openssl-3.0.x` 바이너리 다운로드 확인
3. ✅ 빌드 성공 확인

### 함수 로그에서 확인:
- Prisma 관련 오류가 없는지 확인

## 문제가 계속되면

### 방법 1: Vercel 빌드 캐시 클리어
1. Vercel Dashboard → Settings
2. "Clear Build Cache" 클릭
3. 재배포

### 방법 2: 환경 변수 확인
- `DATABASE_URL` 확인
- 모든 환경에 적용되었는지 확인

### 방법 3: Prisma 완전 재설치
```bash
rm -rf node_modules/.prisma
rm -rf node_modules/@prisma
npm install
npx prisma generate
```

### 방법 4: Vercel Functions 설정 확인
Vercel Dashboard → Settings → Functions에서:
- Node.js 버전 확인 (18.x 이상 권장)
- Memory 설정 확인

## 참고
- `outputFileTracingIncludes`는 Next.js가 서버리스 함수에 포함할 파일을 명시적으로 지정합니다
- `'*'` 패턴은 모든 경로에 적용됩니다
- Prisma 바이너리는 반드시 포함되어야 합니다


