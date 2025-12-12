# 커뮤니티 플랫폼

Next.js 기반의 현대적인 커뮤니티 플랫폼입니다.

## 기능

- 🔐 사용자 인증 (이메일/비밀번호)
- 📝 게시글 작성 및 수정
- 💬 댓글 시스템
- 👤 사용자 프로필
- 🎨 모던한 UI/UX

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

> **참고**: PostgreSQL 연결 문자열이 필요합니다. Vercel Postgres, Supabase, Neon 등의 서비스를 사용할 수 있습니다.

### 3. 데이터베이스 설정

```bash
npx prisma generate
npx prisma db push
```

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

## Vercel 배포

### 1. Vercel Postgres 설정

Vercel에서는 SQLite를 사용할 수 없으므로 PostgreSQL을 사용해야 합니다.

1. Vercel 대시보드에서 프로젝트를 선택합니다
2. "Storage" 탭으로 이동합니다
3. "Create Database" → "Postgres"를 선택합니다
4. 데이터베이스를 생성하면 `DATABASE_URL`이 자동으로 생성됩니다

### 2. 환경 변수 설정

Vercel 프로젝트 설정에서 다음 환경 변수를 추가합니다:

- `DATABASE_URL` - Vercel Postgres에서 자동 생성됨
- `NEXTAUTH_URL` - 배포된 도메인 (예: `https://your-project.vercel.app`)
- `NEXTAUTH_SECRET` - 랜덤 문자열 (터미널에서 `openssl rand -base64 32` 실행)

### 3. 로컬 개발 환경 설정

로컬에서도 PostgreSQL을 사용하려면:

1. Vercel Postgres의 연결 문자열을 복사합니다
2. `.env.local` 파일에 추가합니다:
   ```env
   DATABASE_URL="postgresql://..."
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   ```

### 4. 데이터베이스 마이그레이션

```bash
npx prisma generate
npx prisma db push
```

또는 마이그레이션 파일을 사용하려면:

```bash
npx prisma migrate dev --name init
```

### 5. 배포

GitHub에 푸시하면 Vercel이 자동으로 배포합니다.

## 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma (SQLite/PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

