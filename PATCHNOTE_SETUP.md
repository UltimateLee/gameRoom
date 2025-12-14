# 📰 AI 패치노트 요약 기능 설정 가이드

## 개요

이 기능은 리그 오브 레전드, 발로란트, 배틀그라운드의 최신 패치노트를 자동으로 크롤링하고, AI를 사용하여 요약하여 메인 페이지에 표시합니다.

## 주요 기능

- 🔄 **자동 크롤링**: 매일 오전 9시에 3개 게임 사이트를 자동으로 크롤링
- 🤖 **AI 요약**: Gemini API를 사용하여 패치노트를 3줄 이내로 요약
- 🚫 **중복 방지**: DB에서 최근 패치노트와 비교하여 중복 저장 방지
- ⚡ **ISR 캐싱**: Next.js ISR을 사용하여 성능 최적화

## 설정 방법

### 1. 환경 변수 설정

Vercel Dashboard 또는 `.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Gemini API 키 (기존에 설정되어 있다면 생략)
GEMINI_API_KEY=your_gemini_api_key_here

# Cron Job 보안을 위한 시크릿 키 (랜덤 문자열 생성)
CRON_SECRET=your_random_secret_key_here

# Vercel 배포 시 자동으로 설정되지만, 로컬 테스트용
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. CRON_SECRET 생성

터미널에서 다음 명령어로 랜덤 시크릿 키를 생성할 수 있습니다:

```bash
# Node.js 사용
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 또는 온라인 랜덤 문자열 생성기 사용
```

### 3. 데이터베이스 마이그레이션

Prisma 스키마에 `PatchNote` 모델이 추가되었습니다. 다음 명령어로 데이터베이스를 업데이트하세요:

```bash
# 개발 환경
npx prisma migrate dev --name add_patchnote_model

# 또는 스키마만 푸시 (개발용)
npx prisma db push

# 프로덕션 환경
npx prisma migrate deploy
```

### 4. Vercel Cron 설정 확인

`vercel.json` 파일에 다음 설정이 포함되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/cron/patch-note",
      "schedule": "0 9 * * *"
    }
  ]
}
```

이 설정은 매일 오전 9시(UTC)에 Cron Job을 실행합니다.

**참고**: Vercel에서 Cron Job을 사용하려면:
1. Vercel Pro 플랜이 필요할 수 있습니다 (무료 플랜에서는 제한적 지원)
2. 또는 Vercel Cron 대신 외부 서비스(예: cron-job.org)를 사용할 수 있습니다

### 5. 수동 테스트

Cron Job을 수동으로 테스트하려면:

```bash
# 로컬에서 테스트
curl -X GET http://localhost:3000/api/cron/patch-note \
  -H "Authorization: Bearer your_cron_secret_here"
```

또는 브라우저에서 직접 호출 (보안상 권장하지 않음):

```
http://localhost:3000/api/cron/patch-note?secret=your_cron_secret_here
```

## 크롤링 대상 사이트

1. **리그 오브 레전드**: https://www.leagueoflegends.com/ko-kr/news/tags/patch-notes/
2. **발로란트**: https://playvalorant.com/ko-kr/news/tags/patch-notes/
3. **배틀그라운드**: https://pubg.com/ko/news

## 문제 해결

### 크롤링 실패

- 사이트 구조가 변경되었을 수 있습니다. `lib/scraper.ts` 파일의 선택자를 업데이트해야 합니다.
- CORS 또는 봇 차단이 발생할 수 있습니다. User-Agent 헤더를 확인하세요.

### AI 요약 실패

- `GEMINI_API_KEY`가 올바르게 설정되었는지 확인하세요.
- Gemini API 할당량을 확인하세요.
- API 모델 이름이 변경되었을 수 있습니다. `app/api/ai/summarize-patch-note/route.ts`의 모델 목록을 확인하세요.

### Cron Job이 실행되지 않음

- Vercel Pro 플랜이 필요할 수 있습니다.
- `CRON_SECRET`이 올바르게 설정되었는지 확인하세요.
- Vercel Dashboard의 Cron Jobs 섹션에서 실행 로그를 확인하세요.

### 데이터베이스 오류

- Prisma 마이그레이션이 완료되었는지 확인하세요.
- 데이터베이스 연결이 정상인지 확인하세요.

## 외부 Cron 서비스 사용 (Vercel Pro 없을 경우)

Vercel Cron을 사용할 수 없는 경우, 외부 서비스(예: cron-job.org)를 사용할 수 있습니다:

1. https://cron-job.org 에서 계정 생성
2. 새 Cron Job 생성:
   - URL: `https://your-domain.vercel.app/api/cron/patch-note`
   - Method: GET
   - Headers: `Authorization: Bearer your_cron_secret_here`
   - Schedule: 매일 오전 9시 (또는 원하는 시간)

## API 엔드포인트

### GET /api/cron/patch-note

Cron Job이 호출하는 엔드포인트입니다.

**Headers:**
```
Authorization: Bearer {CRON_SECRET}
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-01T09:00:00.000Z",
  "results": [
    {
      "game": "lol",
      "status": "success",
      "patchNoteId": "clx...",
      "title": "패치 14.1 노트"
    }
  ]
}
```

### POST /api/ai/summarize-patch-note

패치노트를 AI로 요약하는 엔드포인트입니다.

**Request Body:**
```json
{
  "content": "패치노트 전체 내용...",
  "game": "lol"
}
```

**Response:**
```json
{
  "summary": "1. 챔피언 A 버프, 챔피언 B 너프...",
  "model": "gemini-2.5-flash"
}
```

## 메인 페이지 표시

메인 페이지(`/`)에 최신 패치노트 3개가 자동으로 표시됩니다. ISR(1시간)을 사용하여 성능을 최적화했습니다.

