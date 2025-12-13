import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: Request) {
  try {
    let body
    try {
      body = await request.json()
    } catch (error) {
      return NextResponse.json(
        { error: '잘못된 요청 형식입니다.' },
        { status: 400 }
      )
    }

    const { preferences, platform, genre, playStyle } = body

    if (!preferences || preferences.trim() === '') {
      return NextResponse.json(
        { error: '선호도/요구사항을 입력해주세요.' },
        { status: 400 }
      )
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY가 설정되지 않았습니다.')
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }

    let genAI
    try {
      genAI = new GoogleGenerativeAI(apiKey)
    } catch (error: any) {
      console.error('Gemini API 초기화 오류:', error)
      return NextResponse.json(
        { error: 'AI 서비스를 초기화하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 사용자 선호도 기반 프롬프트 생성
    let prompt = `당신은 게임 추천 전문가입니다. 사용자의 선호도에 맞는 게임을 추천해주세요.

사용자 정보:
${preferences ? `- 선호도/요구사항: ${preferences}` : ''}
${platform ? `- 플랫폼: ${platform}` : ''}
${genre ? `- 장르: ${genre}` : ''}
${playStyle ? `- 플레이 스타일: ${playStyle}` : ''}

다음 형식으로 추천해주세요:
1. 게임 이름
2. 플랫폼
3. 장르
4. 추천 이유 (2-3문장)
5. 평점 (1-10점)

최소 3개, 최대 5개의 게임을 추천해주세요. 각 게임은 한 줄씩 구분해주세요.
형식: 게임명 | 플랫폼 | 장르 | 추천이유 | 평점

한국어로 답변해주세요.`

    // 사용 가능한 모델 목록 시도 (우선순위 순)
    // 실제 API 호출 시 여러 모델을 시도하여 작동하는 모델 찾기
    const modelNames = [
      'gemini-1.5-flash-latest',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash',
      'gemini-1.5-pro-latest',
      'gemini-1.5-pro-001',
      'gemini-1.5-pro',
      'gemini-pro-vision',
      'gemini-pro',
    ]
    
    let result
    let response
    let text: string | undefined
    let lastError: any = null
    
    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        console.log(`모델 ${modelName} 시도 중...`)
        
        result = await model.generateContent(prompt)
        response = await result.response
        text = response.text()
        
        console.log(`모델 ${modelName} 성공!`)
        break // 성공하면 루프 종료
      } catch (error: any) {
        lastError = error
        console.log(`모델 ${modelName} 실패:`, error.status, error.message)
        
        // 404 오류가 아니면 다른 오류이므로 중단
        if (error.status !== 404) {
          console.error('예상치 못한 오류:', error)
          break
        }
        
        // 404 오류면 다음 모델 시도
        continue
      }
    }
    
    // 모든 모델 시도 실패
    if (!text) {
      console.error('모든 Gemini 모델 시도 실패. 마지막 오류:', lastError)
      return NextResponse.json(
        { 
          error: '사용 가능한 AI 모델을 찾을 수 없습니다. API 키와 모델 설정을 확인해주세요.',
          details: process.env.NODE_ENV === 'development' ? lastError?.message : undefined
        },
        { status: 500 }
      )
    }

    // 응답 파싱
    const recommendations = parseRecommendations(text)

    if (recommendations.length === 0) {
      return NextResponse.json({
        recommendations: [{
          gameName: '게임 추천',
          platform: platform || '다양',
          genre: genre || '다양',
          reason: text.substring(0, 200) || 'AI가 추천하는 게임입니다.',
          rating: 8,
        }],
        rawResponse: text,
      })
    }

    return NextResponse.json({
      recommendations,
      rawResponse: text,
    })
  } catch (error: any) {
    console.error('게임 추천 API 오류:', error)
    return NextResponse.json(
      { 
        error: '게임 추천을 생성하는 중 오류가 발생했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

function parseRecommendations(text: string) {
  const lines = text.split('\n').filter(line => line.trim())
  const recommendations: Array<{
    gameName: string
    platform: string
    genre: string
    reason: string
    rating: number
  }> = []

  for (const line of lines) {
    // "게임명 | 플랫폼 | 장르 | 추천이유 | 평점" 형식 파싱
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 5) {
        const rating = parseFloat(parts[4]) || 0
        recommendations.push({
          gameName: parts[0],
          platform: parts[1],
          genre: parts[2],
          reason: parts[3],
          rating: isNaN(rating) ? 0 : Math.min(10, Math.max(0, rating)),
        })
      }
    } else if (line.match(/^\d+\./)) {
      // 번호가 있는 경우 다음 줄들을 찾아서 파싱 시도
      continue
    }
  }

  // 파싱 실패 시 원본 텍스트를 그대로 반환
  if (recommendations.length === 0) {
    // 간단한 파싱 시도
    const gameMatches = text.match(/([가-힣a-zA-Z0-9\s]+)\s*[|:]\s*([가-힣a-zA-Z0-9\s]+)/g)
    if (gameMatches) {
      gameMatches.slice(0, 5).forEach((match, index) => {
        const parts = match.split(/[|:]/).map(p => p.trim())
        if (parts.length >= 2) {
          recommendations.push({
            gameName: parts[0] || `게임 ${index + 1}`,
            platform: parts[1] || '다양',
            genre: parts[2] || '다양',
            reason: text.substring(text.indexOf(match), text.indexOf(match) + 100) || '추천 게임입니다.',
            rating: 8,
          })
        }
      })
    }
  }

  return recommendations.length > 0 ? recommendations : [{
    gameName: '추천 게임',
    platform: '다양',
    genre: '다양',
    reason: text.substring(0, 200) || 'AI가 추천하는 게임입니다.',
    rating: 8,
  }]
}
