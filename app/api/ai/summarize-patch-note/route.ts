import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(request: Request) {
  try {
    const { content, game } = await request.json()

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: '패치노트 내용이 필요합니다.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    // GoogleGenAI 초기화
    let ai
    try {
      process.env.GEMINI_API_KEY = apiKey
      ai = new GoogleGenAI({})
    } catch (error: any) {
      console.error('Gemini API 초기화 오류:', error)
      return NextResponse.json(
        { error: 'AI 서비스를 초기화하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 게임 이름 매핑
    const gameNames: Record<string, string> = {
      lol: '리그 오브 레전드',
      valorant: '발로란트',
      pubg: '배틀그라운드',
    }

    const gameName = gameNames[game as string] || game

    // 프롬프트 생성 (게임별 맞춤)
    let prompt = ''
    if (game === 'lol') {
      prompt = `${gameName} 패치노트를 분석하여 다음 형식으로 요약해주세요:

1. 핵심 버프/너프 3가지 (챔피언, 아이템, 룬 등)
2. 시스템 변경 1가지 (게임 모드, UI, 밸런스 등)

요약은 3줄 이내로 간결하게 작성해주세요. 한국어로 답변해주세요.

패치노트 내용:
${content.substring(0, 15000)}`
    } else if (game === 'valorant') {
      prompt = `${gameName} 패치노트를 분석하여 다음 형식으로 요약해주세요:

1. 핵심 변경사항 3가지 (요원, 무기, 맵 등)
2. 시스템 변경 1가지 (게임 모드, UI, 밸런스 등)

요약은 3줄 이내로 간결하게 작성해주세요. 한국어로 답변해주세요.

패치노트 내용:
${content.substring(0, 15000)}`
    } else {
      // PUBG - 버프/너프가 아닌 업데이트 내용 중심
      // 본문이 짧을 경우를 대비한 안내 추가
      const contentLength = content.length
      const contentNote = contentLength < 500 
        ? '\n\n※ 주의: 제공된 내용이 짧습니다. 가능한 범위에서 요약해주세요.'
        : ''
      
      prompt = `${gameName} 패치노트를 분석하여 다음 형식으로 요약해주세요:

1. 주요 업데이트 내용 3가지 (맵, 무기, 아이템, 게임 모드, 신규 기능 등)
2. 시스템 변경 1가지 (UI, 버그 수정, 밸런스, 성능 개선 등)

요약은 3줄 이내로 간결하게 작성해주세요. 한국어로 답변해주세요.
${contentNote}

패치노트 내용:
${content.substring(0, 15000)}`
    }

    // 모델 목록 (우선순위 순)
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

    let text: string | undefined
    let lastError: any = null
    let successfulModel: string | null = null

    // SDK 방식으로 시도
    for (const modelName of modelNames) {
      try {
        console.log(`패치노트 요약 - 모델 ${modelName} 시도 중...`)
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        })
        text = response.text
        successfulModel = modelName
        console.log(`패치노트 요약 - 모델 ${modelName} 성공!`)
        break
      } catch (error: any) {
        lastError = error
        console.log(`패치노트 요약 - 모델 ${modelName} 실패:`, error.status || error.statusCode, error.message || error.statusText)
        if (error.status !== 404 && error.statusCode !== 404 && error.status !== 400 && error.statusCode !== 400) {
          console.error('예상치 못한 오류:', error)
          break
        }
        continue
      }
    }

    if (!text) {
      console.error('패치노트 요약 - 모든 모델 시도 실패. 마지막 오류:', lastError)
      return NextResponse.json(
        {
          error: 'AI 요약을 생성할 수 없습니다.',
          details: process.env.NODE_ENV === 'development' ? {
            lastError: lastError?.message || lastError?.statusText || lastError,
            triedModels: modelNames,
          } : undefined
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      summary: text.trim(),
      model: successfulModel,
    })
  } catch (error: any) {
    console.error('패치노트 요약 API 오류:', error)
    return NextResponse.json(
      {
        error: '패치노트 요약을 생성하는 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

