# DATABASE_URL 형식 확인

## 현재 DATABASE_URL

```
postgres://38f32cb73c9c831e7cdd9e269cce8be4f470bd24fac86321ed0cd569797e0af3:sk_yRjX0XkNtJLhYYwvL8hC8@db.prisma.io:5432/postgres?sslmode=require
```

## 문제점

이 URL은 형식상 올바르지만, **Prisma는 `postgresql://` 프로토콜을 선호**합니다.

## 해결 방법

### 방법 1: `postgres://`를 `postgresql://`로 변경 (권장)

Vercel 환경 변수에서 `DATABASE_URL`을 다음과 같이 변경:

```
postgresql://38f32cb73c9c831e7cdd9e269cce8be4f470bd24fac86321ed0cd569797e0af3:sk_yRjX0XkNtJLhYYwvL8hC8@db.prisma.io:5432/postgres?sslmode=require
```

**변경 사항**: `postgres://` → `postgresql://`

### 방법 2: URL 인코딩 확인

특수 문자가 포함된 경우 URL 인코딩이 필요할 수 있습니다:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `=` → `%3D`

하지만 일반적으로는 필요 없습니다.

## Vercel 환경 변수 설정 방법

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. `DATABASE_URL` 찾기
4. 값 편집
5. `postgres://`를 `postgresql://`로 변경
6. 저장
7. 재배포

## 확인 사항

올바른 형식:
- ✅ `postgresql://user:password@host:port/database?sslmode=require`
- ✅ `postgres://user:password@host:port/database?sslmode=require` (일부 경우 작동)

Prisma 권장 형식:
- ✅ `postgresql://user:password@host:port/database?sslmode=require`

## 추가 확인

1. **호스트 접근 가능 여부**: `db.prisma.io`가 접근 가능한지 확인
2. **포트**: `5432`가 올바른지 확인
3. **SSL 모드**: `sslmode=require`가 필요한지 확인
4. **인증 정보**: 사용자명과 비밀번호가 올바른지 확인

## 테스트

로컬에서 테스트하려면 `.env.local`에 추가:

```env
DATABASE_URL="postgresql://38f32cb73c9c831e7cdd9e269cce8be4f470bd24fac86321ed0cd569797e0af3:sk_yRjX0XkNtJLhYYwvL8hC8@db.prisma.io:5432/postgres?sslmode=require"
```

그리고 실행:
```bash
npx prisma db push
```

성공하면 연결이 정상입니다.

