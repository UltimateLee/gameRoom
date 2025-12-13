# Vercel Prisma Query Engine 최종 해결 가이드

## 문제
Vercel 배포 시 Prisma Query Engine (`rhel-openssl-3.0.x`)을 찾을 수 없는 오류

## 적용된 해결책

### 1. Prisma Schema 설정
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
  engineType = "binary"
}
```

### 2. package.json 스크립트
- `vercel-build`: Vercel 전용 빌드 스크립트 추가
- `postinstall`: npm install 후 자동으로 Prisma 생성

### 3. vercel.json
- `buildCommand`: `npm run vercel-build` 사용

### 4. next.config.js
- webpack 설정으로 Prisma 클라이언트 외부화

## 배포 전 확인사항

### 1. 로컬에서 테스트
```bash
npm run build
```
빌드가 성공하는지 확인

### 2. Prisma 바이너리 확인
```bash
ls node_modules/.prisma/client/
```
`libquery_engine-rhel-openssl-3.0.x.so.node` 파일이 있는지 확인

### 3. Git 커밋
```bash
git add .
git commit -m "Fix Prisma Query Engine for Vercel"
git push
```

## Vercel 배포 후 확인

### 1. 빌드 로그 확인
Vercel Dashboard → Deployments → Build Logs에서:
- `prisma generate` 실행 확인
- `rhel-openssl-3.0.x` 바이너리 다운로드 확인

### 2. 함수 로그 확인
Vercel Dashboard → Functions → Logs에서:
- Prisma 관련 오류가 없는지 확인

## 문제가 계속되면

### 방법 1: Vercel 빌드 캐시 클리어
1. Vercel Dashboard → Settings
2. "Clear Build Cache" 클릭
3. 재배포

### 방법 2: 환경 변수 확인
- `DATABASE_URL`이 올바르게 설정되어 있는지 확인
- 모든 환경(Production, Preview, Development)에 적용되어 있는지 확인

### 방법 3: Prisma 버전 확인
```bash
npm list prisma @prisma/client
```
버전이 일치하는지 확인 (5.22.0)

### 방법 4: 수동 재배포
Vercel Dashboard → Deployments → 최신 배포 → "..." → "Redeploy"

## 참고
- `binaryTargets`에 `"native"`는 로컬 개발용
- `"rhel-openssl-3.0.x"`는 Vercel의 Linux 환경용
- `engineType = "binary"`는 바이너리 엔진 사용 명시

