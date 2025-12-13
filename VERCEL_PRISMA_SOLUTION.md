# Vercel Prisma Query Engine 최종 해결책

## 문제
Vercel 배포 시 `rhel-openssl-3.0.x` Query Engine을 찾을 수 없는 오류

## 적용된 해결책

### 1. Prisma Schema 설정 ✅
```prisma
generator client {
  provider = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
  engineType = "binary"
}
```

### 2. package.json 설정 ✅
- Prisma 버전: `5.22.0` (정확한 버전 고정)
- `vercel-build` 스크립트 추가
- `postinstall` 스크립트에 `--schema` 플래그 추가

### 3. vercel.json 설정 ✅
```json
{
  "buildCommand": "npm run vercel-build"
}
```

### 4. .npmrc 파일 ✅
```
prisma_skip_postinstall_generate=false
```

## 배포 전 확인

### 1. 로컬 빌드 테스트
```bash
npm run build
```

### 2. Prisma 바이너리 확인
```bash
# Windows
dir node_modules\.prisma\client\libquery_engine-rhel-openssl-3.0.x.so.node

# Linux/Mac
ls node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node
```

### 3. Git 커밋
```bash
git add .
git commit -m "Fix Prisma Query Engine for Vercel - version 5.22.0"
git push
```

## Vercel 배포 후 확인

### 빌드 로그에서 확인할 항목:
1. ✅ `prisma generate` 실행 확인
2. ✅ `rhel-openssl-3.0.x` 바이너리 다운로드 확인
3. ✅ 빌드 성공 확인

### 함수 로그에서 확인할 항목:
- Prisma 관련 오류가 없는지 확인

## 문제가 계속되면

### 방법 1: Vercel 빌드 캐시 클리어
1. Vercel Dashboard → Settings
2. "Clear Build Cache" 클릭
3. 재배포

### 방법 2: 환경 변수 재확인
- `DATABASE_URL` 확인
- 모든 환경에 적용되었는지 확인

### 방법 3: 수동 재배포
Vercel Dashboard → Deployments → 최신 배포 → "..." → "Redeploy"

## 중요 사항

⚠️ **Prisma 7.0으로 업그레이드하지 마세요!**
- Prisma 7.0은 스키마 형식이 변경되어 기존 코드와 호환되지 않습니다
- 현재는 Prisma 5.22.0을 사용해야 합니다

## 참고
- `binaryTargets`에 `"native"`는 로컬 개발용
- `"rhel-openssl-3.0.x"`는 Vercel의 Linux 환경용
- `engineType = "binary"`는 바이너리 엔진 사용 명시

