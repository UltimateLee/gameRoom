import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]

    if (files.length === 0) {
      return NextResponse.json(
        { error: '파일이 없습니다.' },
        { status: 400 }
      )
    }

    // 파일 크기 검증 (10MB 제한)
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: `파일 크기는 10MB 이하여야 합니다. (${file.name}: ${(file.size / 1024 / 1024).toFixed(2)}MB)` },
          { status: 400 }
        )
      }
    }

    // Vercel 환경 체크
    const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV
    
    // Base64 인코딩 모드 (Vercel 환경에서 사용)
    const useBase64 = isVercel || process.env.UPLOAD_MODE === 'base64'

    if (useBase64) {
      // Base64로 인코딩하여 반환 (데이터베이스에 저장 가능)
      const uploadedFiles = []
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) {
          continue
        }

        try {
          const bytes = await file.arrayBuffer()
          const buffer = Buffer.from(bytes)
          const base64 = buffer.toString('base64')
          const dataUrl = `data:${file.type};base64,${base64}`
          
          uploadedFiles.push(dataUrl)
        } catch (fileError: any) {
          console.error(`파일 인코딩 실패 (${file.name}):`, fileError)
          continue
        }
      }

      if (uploadedFiles.length === 0) {
        return NextResponse.json(
          { error: '업로드할 수 있는 이미지 파일이 없습니다.' },
          { status: 400 }
        )
      }

      return NextResponse.json({ urls: uploadedFiles })
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads')
    
    try {
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }
    } catch (dirError: any) {
      console.error('디렉토리 생성 실패:', dirError)
      return NextResponse.json(
        { error: `업로드 디렉토리 생성에 실패했습니다: ${dirError.message}` },
        { status: 500 }
      )
    }

    const uploadedFiles = []

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        console.warn(`이미지가 아닌 파일 무시: ${file.name} (${file.type})`)
        continue
      }

      try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        const timestamp = Date.now()
        const randomStr = Math.random().toString(36).substring(2, 9)
        const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
        const filename = `${timestamp}-${randomStr}-${sanitizedName}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)

        uploadedFiles.push(`/uploads/${filename}`)
      } catch (fileError: any) {
        console.error(`파일 업로드 실패 (${file.name}):`, fileError)
        // 개별 파일 실패해도 계속 진행
        continue
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: '업로드할 수 있는 이미지 파일이 없습니다.' },
        { status: 400 }
      )
    }

    return NextResponse.json({ urls: uploadedFiles })
  } catch (error: any) {
    console.error('업로드 API 에러:', error)
    return NextResponse.json(
      { 
        error: '파일 업로드에 실패했습니다.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

