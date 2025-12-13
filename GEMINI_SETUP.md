# Gemini API 설정 가이드

## 1. Gemini API 키 발급

1. [Google AI Studio](https://makersuite.google.com/app/apikey)에 접속
2. Google 계정으로 로그인
3. "Create API Key" 버튼 클릭
4. API 키 복사

## 2. 환경 변수 설정

### 로컬 개발 환경

`.env.local` 파일에 다음을 추가:

```env
GEMINI_API_KEY=your-api-key-here
```

### Vercel 배포 환경

1. Vercel Dashboard → 프로젝트 선택
2. Settings → Environment Variables
3. 다음 환경 변수 추가:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: 발급받은 API 키
   - **Environment**: Production, Preview, Development 모두 체크
4. Save 클릭

## 3. 사용 방법

1. 네비게이션 바에서 "AI 추천" 클릭
2. 선호도/요구사항 입력
3. 플랫폼, 장르, 플레이 스타일 선택 (선택사항)
4. "게임 추천 받기" 버튼 클릭
5. AI가 추천한 게임 목록 확인
6. 원하는 게임의 "이 게임 추천 글 작성하기" 클릭하여 바로 게시글 작성

## 4. API 사용량 및 제한

- Gemini API는 무료 티어에서 분당 60회 요청 제한이 있습니다
- 대량 사용 시 Google Cloud Console에서 할당량을 확인하세요
- API 키는 절대 공개 저장소에 커밋하지 마세요

## 5. 문제 해결

### 오류: "Gemini API 키가 설정되지 않았습니다"

- 환경 변수 `GEMINI_API_KEY`가 설정되었는지 확인
- Vercel 배포 시 환경 변수가 모든 환경에 적용되었는지 확인
- 재배포 필요할 수 있음

### 오류: "API 호출 실패"

- API 키가 유효한지 확인
- Google AI Studio에서 API 키 상태 확인
- 네트워크 연결 확인

