# 데이터베이스 마이그레이션 가이드

## 문제: isAdmin 컬럼이 없습니다

어드민 기능을 사용하려면 데이터베이스에 `isAdmin` 컬럼을 추가해야 합니다.

## 해결 방법

### 방법 1: 마이그레이션 사용 (권장)

```bash
# 개발 환경
npx prisma migrate dev --name add_admin_field

# 프로덕션 환경
npx prisma migrate deploy
```

### 방법 2: db push 사용 (빠른 방법)

```bash
npx prisma db push
```

### 방법 3: npm 스크립트 사용

```bash
# 마이그레이션
npm run migrate

# 또는 db push
npm run db:push
```

## 마이그레이션 후 어드민 계정 설정

### 자동 생성 (권장)

마이그레이션 후 서버를 재시작하면 자동으로 어드민 계정이 생성됩니다.

또는 수동으로:

```bash
npm run setup-admin
```

### 수동 설정

데이터베이스에 직접 접속하여:

```sql
-- 어드민 계정 생성 (비밀번호: admin123)
INSERT INTO "User" (id, email, password, name, "isAdmin", "createdAt", "updatedAt")
VALUES (
  'clx...',  -- cuid() 생성
  'admin@game.com',
  '$2a$10$...',  -- bcrypt 해시 (admin123)
  '관리자',
  true,
  NOW(),
  NOW()
);

-- 또는 기존 계정을 어드민으로 변경
UPDATE "User" SET "isAdmin" = true WHERE email = 'admin@game.com';
```

## 어드민 계정 정보

- **이메일**: `admin@game.com`
- **비밀번호**: `admin123`

## 문제 해결

### 에러: "The column `User.isAdmin` does not exist"

이 에러는 마이그레이션이 실행되지 않아서 발생합니다.

**해결책:**
1. 위의 마이그레이션 명령어를 실행하세요
2. 서버를 재시작하세요

### 에러: "Migration failed"

**해결책:**
1. 데이터베이스 연결을 확인하세요
2. `.env` 파일의 `DATABASE_URL`을 확인하세요
3. 데이터베이스 권한을 확인하세요

### 기존 데이터가 있는 경우

마이그레이션은 기존 데이터를 유지하면서 컬럼만 추가합니다. 안전하게 실행할 수 있습니다.



