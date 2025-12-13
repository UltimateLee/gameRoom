# Gemini API 모델 오류 해결 가이드

## 문제
모든 Gemini 모델에서 404 오류 발생:
```
models/gemini-1.5-flash is not found for API version v1beta
```

## 가능한 원인

### 1. API 키 권한 문제
- API 키가 Generative AI API에 대한 접근 권한이 없을 수 있습니다
- Google Cloud Console에서 API가 활성화되어 있는지 확인하세요

### 2. 모델 이름 형식 문제
- API 버전에 따라 모델 이름 형식이 다를 수 있습니다
- `v1beta` API에서는 다른 형식을 사용할 수 있습니다

### 3. API 키가 올바르지 않음
- API 키가 만료되었거나 잘못되었을 수 있습니다

## 해결 방법

### 방법 1: Google AI Studio에서 모델 확인
1. [Google AI Studio](https://makersuite.google.com/app/apikey) 접속
2. API 키 확인
3. "Get API Key" 또는 "Create API Key" 클릭
4. 새 API 키 생성 (필요한 경우)

### 방법 2: Google Cloud Console에서 API 활성화
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. "APIs & Services" → "Library" 이동
4. "Generative Language API" 검색
5. "Enable" 클릭하여 API 활성화

### 방법 3: API 키 재생성
1. Google AI Studio에서 기존 API 키 삭제
2. 새 API 키 생성
3. Vercel 환경 변수에 새 API 키 설정
4. 재배포

### 방법 4: 사용 가능한 모델 확인
코드가 자동으로 사용 가능한 모델 목록을 조회합니다. 
서버 로그에서 "사용 가능한 모델 목록"을 확인하세요.

## 확인 사항

### Vercel 환경 변수
- `GEMINI_API_KEY`가 올바르게 설정되어 있는지 확인
- 모든 환경(Production, Preview, Development)에 적용되었는지 확인

### API 키 형식
- API 키는 `AIza...`로 시작해야 합니다
- 공백이나 특수 문자가 포함되지 않아야 합니다

## 대안

만약 Gemini API가 계속 작동하지 않는다면:
1. 다른 AI 서비스 고려 (OpenAI, Anthropic 등)
2. Google Cloud Console에서 지원 문의
3. API 키 권한 및 할당량 확인

## 참고 링크
- [Google AI Studio](https://makersuite.google.com/app/apikey)
- [Generative AI API 문서](https://ai.google.dev/docs)
- [Google Cloud Console](https://console.cloud.google.com/)

