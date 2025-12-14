#!/bin/bash
# 패치노트 크롤링 테스트 스크립트

# 배포된 URL (본인의 Vercel URL로 변경하세요)
DEPLOYED_URL="https://your-domain.vercel.app"

# CRON_SECRET (환경 변수에서 가져오거나 직접 입력)
CRON_SECRET="${CRON_SECRET:-your_cron_secret_here}"

echo "패치노트 크롤링 테스트 시작..."
echo "URL: ${DEPLOYED_URL}/api/cron/patch-note"
echo ""

# API 호출
curl -X GET "${DEPLOYED_URL}/api/cron/patch-note" \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  -H "Content-Type: application/json" \
  -v

echo ""
echo "테스트 완료!"

