# 성능 최적화 가이드

## 적용된 최적화 사항

### 1. Next.js 설정 최적화 (`next.config.js`)
- ✅ **이미지 최적화**: AVIF, WebP 포맷 지원
- ✅ **압축 활성화**: Gzip 압축으로 전송 크기 감소
- ✅ **보안 헤더 제거**: `X-Powered-By` 헤더 제거
- ✅ **패키지 최적화**: `date-fns`, `@prisma/client` 자동 트리 쉐이킹

### 2. React 컴포넌트 최적화
- ✅ **메모이제이션**: `PostCard`, `Navbar`, `LikeButton`, `BookmarkButton`, `CommentSection`에 `memo` 적용
- ✅ **useCallback**: 이벤트 핸들러 최적화
- ✅ **useMemo**: 계산 비용이 큰 값 메모이제이션

### 3. 데이터베이스 쿼리 최적화
- ✅ **select 사용**: 필요한 필드만 선택 (`include` 대신 `select`)
- ✅ **병렬 처리**: `Promise.all`로 여러 쿼리 병렬 실행
- ✅ **백그라운드 작업**: 조회수 증가를 비동기로 처리
- ✅ **불필요한 데이터 제거**: 댓글 전체 대신 `_count` 사용

### 4. 코드 스플리팅
- ✅ **동적 임포트**: 클라이언트 전용 컴포넌트를 동적으로 로드
- ✅ **SSR 최적화**: 필요한 컴포넌트만 SSR 유지

### 5. 이미지 최적화
- ✅ **lazy loading**: 화면에 보이지 않는 이미지 지연 로드
- ✅ **sizes 속성**: 반응형 이미지 크기 지정
- ✅ **최신 포맷**: AVIF, WebP 자동 변환

### 6. 상태 관리 최적화
- ✅ **함수형 업데이트**: `setState(prev => ...)` 패턴 사용
- ✅ **불필요한 리렌더링 방지**: `memo`와 `useCallback` 조합

## 성능 개선 효과

### 예상 개선 사항:
1. **번들 크기**: 동적 임포트로 초기 로드 시간 감소
2. **렌더링 성능**: 메모이제이션으로 불필요한 리렌더링 방지
3. **데이터베이스**: 선택적 필드 조회로 쿼리 시간 단축
4. **이미지 로딩**: 지연 로딩으로 초기 페이지 로드 시간 감소
5. **네트워크**: 압축으로 전송 크기 감소

## 추가 최적화 권장 사항

### 1. 캐싱 전략
```typescript
// API 라우트에 캐싱 추가
export const revalidate = 60 // 60초마다 재검증
```

### 2. 정적 생성 (Static Generation)
- 자주 변경되지 않는 페이지는 `generateStaticParams` 사용 고려

### 3. 데이터베이스 인덱스
```sql
-- 자주 검색되는 필드에 인덱스 추가
CREATE INDEX idx_post_created_at ON "Post"("createdAt");
CREATE INDEX idx_post_category ON "Post"("category");
CREATE INDEX idx_post_tags ON "Post" USING gin("tags");
```

### 4. CDN 사용
- 정적 자산(이미지, CSS, JS)을 CDN에 배포

### 5. 모니터링
- Next.js Analytics 또는 Vercel Analytics로 성능 모니터링

## 성능 측정

### 개발 환경에서:
```bash
npm run build
npm run start
```

그 다음 Lighthouse로 성능 측정:
- Chrome DevTools → Lighthouse 탭
- Performance 점수 확인

### 주요 지표:
- **FCP (First Contentful Paint)**: < 1.8초
- **LCP (Largest Contentful Paint)**: < 2.5초
- **TTI (Time to Interactive)**: < 3.8초
- **TBT (Total Blocking Time)**: < 200ms

