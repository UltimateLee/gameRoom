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
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
```

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

1. GitHub에 프로젝트를 푸시합니다
2. [Vercel](https://vercel.com)에 로그인합니다
3. "New Project"를 클릭하고 저장소를 선택합니다
4. 환경 변수를 추가합니다:
   - `DATABASE_URL`
   - `NEXTAUTH_URL`
   - `NEXTAUTH_SECRET`
5. "Deploy"를 클릭합니다

## 기술 스택

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Prisma (SQLite/PostgreSQL)
- **Authentication**: NextAuth.js
- **Deployment**: Vercel

