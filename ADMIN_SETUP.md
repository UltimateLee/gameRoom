# 어드민 설정 가이드

## 1. 데이터베이스 마이그레이션

Prisma 스키마에 `isAdmin` 필드가 추가되었습니다. 다음 명령어로 마이그레이션을 실행하세요:

```bash
npx prisma migrate dev --name add_admin_field
```

또는 프로덕션 환경에서는:

```bash
npx prisma migrate deploy
```

## 2. 기본 어드민 계정 자동 생성

**기본 어드민 계정이 자동으로 생성됩니다!**

- **이메일**: `admin@game.com`
- **비밀번호**: `admin123`

### 자동 생성 시점

1. **서버 시작 시**: 앱이 시작되면 자동으로 어드민 계정이 생성됩니다.
2. **어드민 페이지 접근 시**: `/admin` 페이지에 접근하면 자동으로 확인하고 생성합니다.
3. **수동 초기화**: `/api/admin/init` 엔드포인트를 호출하여 수동으로 생성할 수 있습니다.

### 수동 초기화 방법

브라우저나 curl로 다음 URL에 접근:

```bash
# GET 요청
curl http://localhost:3000/api/admin/init

# POST 요청
curl -X POST http://localhost:3000/api/admin/init
```

### 기존 사용자를 어드민으로 만들기

기존 사용자를 어드민으로 만들려면:

#### 방법 1: 데이터베이스에서 직접 수정

PostgreSQL 예시:
```sql
UPDATE "User" SET "isAdmin" = true WHERE email = 'your-email@example.com';
```

#### 방법 2: Prisma Studio 사용

```bash
npx prisma studio
```

Prisma Studio에서 사용자를 찾아 `isAdmin` 필드를 `true`로 변경하세요.

## 3. 어드민 기능

### 대시보드 (`/admin`)
- 전체 통계 (회원 수, 게시글 수, 댓글 수)
- 최근 게시글 목록

### 게시글 관리 (`/admin/posts`)
- 모든 게시글 목록 및 검색
- 게시글 삭제
- 게시글 수정 링크

### 회원 관리 (`/admin/users`)
- 모든 회원 목록 및 검색
- 회원 삭제
- 관리자 권한 부여/해제

## 4. 보안 주의사항

- 관리자는 자신의 계정을 삭제하거나 권한을 변경할 수 없습니다.
- 모든 어드민 페이지는 인증 및 권한 검사를 거칩니다.
- 네비게이션에 "관리자" 링크는 관리자만 볼 수 있습니다.

