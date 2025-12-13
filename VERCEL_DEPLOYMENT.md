# Vercel 배포 시 PostgreSQL 설정 가이드

## 중요: Vercel 배포 전에 해야 할 일

Vercel은 SQLite를 지원하지 않으므로, **배포 전에** 다음 단계를 따라야 합니다.

## 방법 1: Vercel 배포 시에만 PostgreSQL 사용 (권장)

### 1단계: Vercel Postgres 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. "Storage" 탭 → "Create Database" → "Postgres" 선택
3. 데이터베이스 생성

### 2단계: Vercel 환경 변수 설정

프로젝트 Settings → Environment Variables:
- `DATABASE_URL` - Vercel Postgres에서 자동 생성됨
- `NEXTAUTH_URL` - 배포된 도메인
- `NEXTAUTH_SECRET` - 랜덤 문자열

### 3단계: 배포 전에 Prisma 스키마 변경

**배포 직전에만** `prisma/schema.prisma` 파일을 수정:

```prisma
datasource db {
  provider = "postgresql"  // SQLite에서 변경
  url      = env("DATABASE_URL")
}
```

그리고 커밋 & 푸시:
```bash
git add prisma/schema.prisma
git commit -m "Use PostgreSQL for production"
git push
```

### 4단계: 배포 후 로컬 개발을 위해 되돌리기 (선택사항)

로컬 개발을 계속하려면 다시 SQLite로 변경:
```prisma
datasource db {
  provider = "sqlite"  // 다시 변경
  url      = env("DATABASE_URL")
}
```

## 방법 2: 로컬에서도 PostgreSQL 사용 (더 권장)

로컬과 프로덕션 모두 PostgreSQL을 사용하면 더 일관성 있습니다.

### 무료 PostgreSQL 옵션:

1. **Supabase** (권장)
   - https://supabase.com
   - 무료 티어 제공
   - PostgreSQL 호환

2. **Neon**
   - https://neon.tech
   - 서버리스 PostgreSQL
   - 무료 티어 제공

3. **Railway**
   - https://railway.app
   - 무료 크레딧 제공

### 설정 방법 (Supabase 예시):

1. Supabase 프로젝트 생성
2. Settings → Database → Connection string 복사
3. `.env.local` 파일에 추가:
   ```env
   DATABASE_URL="postgresql://postgres:[password]@[host]:5432/postgres"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```
4. `prisma/schema.prisma`를 PostgreSQL로 변경:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
5. 마이그레이션:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 현재 상태

- **로컬**: SQLite 사용 (`file:./dev.db`)
- **프로덕션**: PostgreSQL 필요 (Vercel Postgres)

배포 시에는 반드시 PostgreSQL로 변경해야 합니다!



