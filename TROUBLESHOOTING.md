# Vercel 배포 문제 해결 가이드

## 오류: "the URL must start with the protocol `postgresql://` or `postgres://`"

이 오류는 Vercel 환경 변수에 `DATABASE_URL`이 올바르게 설정되지 않았을 때 발생합니다.

## 해결 방법

### 1. Vercel Postgres 생성 확인

1. [Vercel Dashboard](https://vercel.com/dashboard) → 프로젝트 선택
2. "Storage" 탭 확인
3. Postgres 데이터베이스가 생성되어 있는지 확인
4. 없다면 "Create Database" → "Postgres" 선택하여 생성

### 2. 환경 변수 확인 및 설정

**프로젝트 Settings → Environment Variables**에서 확인:

#### 필수 환경 변수:

1. **`DATABASE_URL`**
   - Vercel Postgres를 생성하면 자동으로 생성됩니다
   - 형식: `postgresql://user:password@host:port/database?sslmode=require`
   - **중요**: `postgresql://` 또는 `postgres://`로 시작해야 합니다
   - SQLite 형식(`file:./dev.db`)이면 안 됩니다

2. **`NEXTAUTH_URL`**
   - 배포된 도메인 (예: `https://your-project.vercel.app`)
   - 또는 `http://localhost:3000` (로컬 개발용)

3. **`NEXTAUTH_SECRET`**
   - 랜덤 문자열
   - 생성 방법:
     ```bash
     openssl rand -base64 32
     ```

### 3. 환경 변수 형식 확인

Vercel 대시보드에서 `DATABASE_URL`의 값이 다음과 같은 형식인지 확인:

```
postgresql://default:password@host.vercel-storage.com:5432/verceldb
```

또는

```
postgres://default:password@host.vercel-storage.com:5432/verceldb
```

**잘못된 형식 예시:**
- `file:./dev.db` ❌
- `sqlite:./dev.db` ❌
- 빈 값 ❌

### 4. 환경 변수 재설정

만약 `DATABASE_URL`이 올바르지 않다면:

1. Vercel Postgres를 다시 생성하거나
2. 기존 Postgres의 연결 문자열을 복사하여 환경 변수에 설정

**Vercel Postgres 연결 문자열 복사 방법:**
1. Storage → Postgres 데이터베이스 선택
2. ".env.local" 탭 클릭
3. `DATABASE_URL` 값 복사
4. Environment Variables에 붙여넣기

### 5. 환경 변수 적용 확인

환경 변수를 추가/수정한 후:
- **Production**, **Preview**, **Development** 모두에 적용되었는지 확인
- 변경사항 저장 후 재배포

### 6. 재배포

환경 변수를 수정한 후:
1. GitHub에 푸시하거나
2. Vercel 대시보드에서 "Redeploy" 클릭

## 추가 확인사항

### Prisma 스키마 확인

`prisma/schema.prisma` 파일이 PostgreSQL로 설정되어 있는지 확인:

```prisma
datasource db {
  provider = "postgresql"  // ✅ 올바름
  url      = env("DATABASE_URL")
}
```

### 빌드 로그 확인

Vercel 배포 로그에서:
- `DATABASE_URL`이 올바르게 로드되는지 확인
- Prisma generate가 성공하는지 확인

## 대안: 다른 PostgreSQL 서비스 사용

Vercel Postgres 대신 다른 서비스를 사용할 수도 있습니다:

### Supabase (무료)
1. https://supabase.com 가입
2. 프로젝트 생성
3. Settings → Database → Connection string 복사
4. Vercel 환경 변수에 설정

### Neon (무료)
1. https://neon.tech 가입
2. 프로젝트 생성
3. Connection string 복사
4. Vercel 환경 변수에 설정

## 문제가 계속되면

1. Vercel 대시보드의 "Deployments" 탭에서 빌드 로그 확인
2. 환경 변수가 올바르게 설정되었는지 다시 확인
3. Postgres 데이터베이스가 활성화되어 있는지 확인
4. 필요시 Vercel 지원팀에 문의



