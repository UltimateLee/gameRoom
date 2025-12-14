import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { scrapeGame, GameType } from '@/lib/scraper'

// Vercel Cron에서 호출하는 API Route
// Authorization 헤더로 보안 처리
export async function GET(request: Request) {
  try {
    // Vercel Cron 인증 확인
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const games: GameType[] = ['lol', 'valorant', 'pubg']
    const results = []

    for (const game of games) {
      try {
        console.log(`[${game}] 패치노트 크롤링 시작...`)

        // 1. 크롤링
        const patchNoteData = await scrapeGame(game)
        if (!patchNoteData) {
          console.log(`[${game}] 크롤링 실패 또는 데이터 없음`)
          results.push({ game, status: 'skipped', reason: 'no_data' })
          continue
        }

        // 2. 중복 확인 (DB에서 가장 최근 패치노트 제목 비교)
        const latestPatchNote = await prisma.patchNote.findFirst({
          where: { game },
          orderBy: { createdAt: 'desc' },
          select: { title: true },
        })

        if (latestPatchNote && latestPatchNote.title === patchNoteData.title) {
          console.log(`[${game}] 중복 패치노트: ${patchNoteData.title}`)
          results.push({ game, status: 'skipped', reason: 'duplicate' })
          continue
        }

        console.log(`[${game}] 새로운 패치노트 발견: ${patchNoteData.title}`)

        // 3. AI 요약 (내부 API 직접 호출)
        let summary = ''
        try {
          // 내부 API 직접 호출 (환경 변수 사용하지 않고 직접 import)
          const { GoogleGenAI } = await import('@google/genai')
          const apiKey = process.env.GEMINI_API_KEY
          if (apiKey) {
            process.env.GEMINI_API_KEY = apiKey
            const ai = new GoogleGenAI({})
            
            const gameNames: Record<string, string> = {
              lol: '리그 오브 레전드',
              valorant: '발로란트',
              pubg: '배틀그라운드',
            }
            const gameName = gameNames[game] || game
            
            const prompt = `${gameName} 패치노트를 분석하여 다음 형식으로 요약해주세요:

1. 핵심 버프/너프 3가지 (챔피언, 무기, 아이템 등)
2. 시스템 변경 1가지 (게임 모드, UI, 밸런스 등)

요약은 3줄 이내로 간결하게 작성해주세요. 한국어로 답변해주세요.

패치노트 내용:
${patchNoteData.content.substring(0, 8000)}`

            const modelNames = [
              'gemini-2.5-flash',
              'gemini-2.0-flash-exp',
              'gemini-1.5-flash-latest',
              'gemini-1.5-flash-001',
              'gemini-1.5-flash',
              'gemini-1.5-pro-latest',
              'gemini-1.5-pro-001',
              'gemini-1.5-pro',
            ]

            for (const modelName of modelNames) {
              try {
                const response = await ai.models.generateContent({
                  model: modelName,
                  contents: prompt,
                })
                if (response.text) {
                  summary = response.text.trim()
                  break
                }
              } catch (error: any) {
                if (error.status !== 404 && error.statusCode !== 404 && error.status !== 400 && error.statusCode !== 400) {
                  break
                }
                continue
              }
            }
          }
          
          if (!summary) {
            // API 호출 방식으로 폴백
            const baseUrl = process.env.VERCEL_URL 
              ? `https://${process.env.VERCEL_URL}` 
              : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
            
            const summarizeResponse = await fetch(
              `${baseUrl}/api/ai/summarize-patch-note`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  content: patchNoteData.content,
                  game,
                }),
              }
            )

            if (summarizeResponse.ok) {
              const summarizeData = await summarizeResponse.json()
              summary = summarizeData.summary || ''
            } else {
              console.error(`[${game}] AI 요약 실패:`, await summarizeResponse.text())
              // 요약 실패해도 원본 내용으로 저장
              summary = 'AI 요약 생성 실패. 원본 내용을 확인해주세요.'
            }
          }
        } catch (error) {
          console.error(`[${game}] AI 요약 오류:`, error)
          summary = 'AI 요약 생성 중 오류가 발생했습니다.'
        }

        // 4. DB 저장
        const savedPatchNote = await prisma.patchNote.create({
          data: {
            game,
            title: patchNoteData.title,
            originalUrl: patchNoteData.url,
            originalContent: patchNoteData.content,
            summary: summary || patchNoteData.content.substring(0, 500), // 요약 실패 시 원본 일부
            publishedAt: patchNoteData.publishedAt,
          },
        })

        console.log(`[${game}] 패치노트 저장 완료: ${savedPatchNote.id}`)
        results.push({
          game,
          status: 'success',
          patchNoteId: savedPatchNote.id,
          title: savedPatchNote.title,
        })
      } catch (error: any) {
        console.error(`[${game}] 처리 오류:`, error)
        results.push({
          game,
          status: 'error',
          error: error.message || 'Unknown error',
        })
      }
    }

    // 5. ISR Revalidation (메인 페이지 캐시 갱신)
    try {
      revalidatePath('/')
      console.log('메인 페이지 캐시 갱신 완료')
    } catch (error) {
      console.error('캐시 갱신 오류:', error)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    })
  } catch (error: any) {
    console.error('패치노트 Cron Job 오류:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error',
      },
      { status: 500 }
    )
  }
}

