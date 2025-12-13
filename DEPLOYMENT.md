# Vercel 배포 가이드

## 문제: SQLite는 Vercel에서 작동하지 않음

Vercel은 서버리스 환경이며 파일 시스템이 읽기 전용입니다. 따라서 SQLite 데이터베이스 파일을 저장할 수 없습니다.

## 해결책: PostgreSQL 사용

Vercel에서는 PostgreSQL 같은 클라우드 데이터베이스를 사용해야 합니다.

## 단계별 설정

### 1. Vercel Postgres 생성

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. "Storage" 탭 클릭
4. "Create Database" → "Postgres" 선택
5. 데이터베이스 이름 입력 후 생성

### 2. 환경 변수 설정

Vercel이 자동으로 `DATABASE_URL`을 생성합니다. 다음 환경 변수들을 추가하세요:

#### Vercel 대시보드에서:
- `DATABASE_URL` - 자동 생성됨 (확인만 하면 됨)
- `NEXTAUTH_URL` - 배포된 도메인 (예: `https://your-project.vercel.app`)
- `NEXTAUTH_SECRET` - 랜덤 문자열 생성:
  ```bash
  openssl rand -base64 32
  ```

### 3. 로컬 개발 환경 설정

로컬에서도 같은 데이터베이스를 사용하려면:

1. Vercel Postgres의 연결 문자열 복사
2. `.env.local` 파일 생성:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

### 4. Prisma 설정 업데이트

`prisma/schema.prisma` 파일이 이미 PostgreSQL로 설정되어 있습니다:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5. 데이터베이스 마이그레이션

#### 로컬에서:
```bash
npx prisma generate
npx prisma db push
```

또는 마이그레이션 파일 사용:
```bash
npx prisma migrate dev --name init
```

#### 프로덕션에서:
Vercel은 빌드 시 자동으로 Prisma를 설정하지만, 수동으로 마이그레이션하려면:

```bash
npx prisma migrate deploy
```

### 6. 대안: 다른 클라우드 데이터베이스

Vercel Postgres 외에도 다음을 사용할 수 있습니다:

- **Supabase** (무료 티어 제공)
- **Neon** (서버리스 PostgreSQL)
- **Railway** (PostgreSQL 호스팅)
- **PlanetScale** (MySQL 호환)

각 서비스의 연결 문자열을 `DATABASE_URL`에 설정하면 됩니다.

## 주의사항

1. **로컬 개발**: 로컬에서는 SQLite를 계속 사용할 수 있지만, 프로덕션과 다른 스키마를 사용하면 문제가 발생할 수 있습니다. 가능하면 로컬에서도 PostgreSQL을 사용하는 것을 권장합니다.

2. **데이터 마이그레이션**: 기존 SQLite 데이터가 있다면 PostgreSQL로 마이그레이션해야 합니다.

3. **연결 풀링**: Vercel Postgres는 자동으로 연결 풀링을 제공합니다.

## 문제 해결

### "Unable to open the database file" 오류
- SQLite를 사용하고 있다는 의미입니다
- `prisma/schema.prisma`에서 `provider = "postgresql"`로 변경했는지 확인
- `DATABASE_URL`이 PostgreSQL 연결 문자열인지 확인

### 연결 오류
- `DATABASE_URL`이 올바른지 확인
- SSL 모드가 필요한 경우 `?sslmode=require` 추가
- 방화벽 설정 확인



