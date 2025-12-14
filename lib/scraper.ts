import { parse } from 'node-html-parser'

export type GameType = 'lol' | 'valorant' | 'pubg'

export interface PatchNoteData {
  title: string
  url: string
  content: string
  publishedAt: Date
}

// 리그오브레전드 패치노트 크롤링
export async function scrapeLOL(): Promise<PatchNoteData | null> {
  try {
    const url = 'https://www.leagueoflegends.com/ko-kr/news/tags/patch-notes/'
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 첫 번째 패치노트 찾기
    const firstArticle = root.querySelector('article')
    if (!firstArticle) {
      // 대체 선택자 시도
      const firstLink = root.querySelector('a[href*="patch-notes"]')
      if (!firstLink) {
        return null
      }
      const articleUrl = firstLink.getAttribute('href') || ''
      const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://www.leagueoflegends.com${articleUrl}`
      
      return await scrapeLOLArticle(fullUrl)
    }

    const articleLink = firstArticle.querySelector('a')
    const articleUrl = articleLink?.getAttribute('href') || ''
    const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://www.leagueoflegends.com${articleUrl}`

    return await scrapeLOLArticle(fullUrl)
  } catch (error) {
    console.error('LOL 크롤링 오류:', error)
    return null
  }
}

async function scrapeLOLArticle(url: string): Promise<PatchNoteData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 제목 추출
    const titleEl = root.querySelector('h1')
    const title = titleEl?.text.trim() || root.querySelector('title')?.text.trim() || ''

    // 본문 추출 (불필요한 요소 제거)
    const scripts = root.querySelectorAll('script')
    const styles = root.querySelectorAll('style')
    const navs = root.querySelectorAll('nav')
    const headers = root.querySelectorAll('header')
    const footers = root.querySelectorAll('footer')
    const asides = root.querySelectorAll('aside')
    
    scripts.forEach(el => el.remove())
    styles.forEach(el => el.remove())
    navs.forEach(el => el.remove())
    headers.forEach(el => el.remove())
    footers.forEach(el => el.remove())
    asides.forEach(el => el.remove())

    const article = root.querySelector('article, .article-content, main, .content')
    const content = article?.text.trim() || root.querySelector('body')?.text.trim() || ''

    // 날짜 추출
    const timeEl = root.querySelector('time[datetime]') || root.querySelector('[datetime]')
    const dateText = timeEl?.getAttribute('datetime') || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      content: content.replace(/\s+/g, ' ').substring(0, 10000), // 최대 10000자로 제한
      publishedAt,
    }
  } catch (error) {
    console.error('LOL 아티클 크롤링 오류:', error)
    return null
  }
}

// 발로란트 패치노트 크롤링
export async function scrapeValorant(): Promise<PatchNoteData | null> {
  try {
    const url = 'https://playvalorant.com/ko-kr/news/tags/patch-notes/'
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 첫 번째 패치노트 찾기
    const firstArticle = root.querySelector('article')
    if (!firstArticle) {
      const firstLink = root.querySelector('a[href*="patch-notes"]')
      if (!firstLink) {
        return null
      }
      const articleUrl = firstLink.getAttribute('href') || ''
      const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://playvalorant.com${articleUrl}`
      
      return await scrapeValorantArticle(fullUrl)
    }

    const articleLink = firstArticle.querySelector('a')
    const articleUrl = articleLink?.getAttribute('href') || ''
    const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://playvalorant.com${articleUrl}`

    return await scrapeValorantArticle(fullUrl)
  } catch (error) {
    console.error('Valorant 크롤링 오류:', error)
    return null
  }
}

async function scrapeValorantArticle(url: string): Promise<PatchNoteData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 제목 추출
    const titleEl = root.querySelector('h1')
    const title = titleEl?.text.trim() || root.querySelector('title')?.text.trim() || ''

    // 본문 추출
    const scripts = root.querySelectorAll('script')
    const styles = root.querySelectorAll('style')
    const navs = root.querySelectorAll('nav')
    const headers = root.querySelectorAll('header')
    const footers = root.querySelectorAll('footer')
    const asides = root.querySelectorAll('aside')
    
    scripts.forEach(el => el.remove())
    styles.forEach(el => el.remove())
    navs.forEach(el => el.remove())
    headers.forEach(el => el.remove())
    footers.forEach(el => el.remove())
    asides.forEach(el => el.remove())

    const article = root.querySelector('article, .article-content, main, .content')
    const content = article?.text.trim() || root.querySelector('body')?.text.trim() || ''

    // 날짜 추출
    const timeEl = root.querySelector('time[datetime]') || root.querySelector('[datetime]')
    const dateText = timeEl?.getAttribute('datetime') || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      content: content.replace(/\s+/g, ' ').substring(0, 10000),
      publishedAt,
    }
  } catch (error) {
    console.error('Valorant 아티클 크롤링 오류:', error)
    return null
  }
}

// 배틀그라운드 패치노트 크롤링
export async function scrapePUBG(): Promise<PatchNoteData | null> {
  try {
    // PUBG 공식 사이트의 패치노트 페이지
    const url = 'https://pubg.com/ko/news'
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 패치노트 관련 링크 찾기
    const patchNoteLink = root.querySelector('a[href*="patch"], a[href*="update"]')
    if (!patchNoteLink) {
      // 대체: 첫 번째 뉴스 기사
      const firstArticle = root.querySelector('article, .news-item, .post')
      if (!firstArticle) {
        return null
      }
      const articleLink = firstArticle.querySelector('a')
      const articleUrl = articleLink?.getAttribute('href') || ''
      const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://pubg.com${articleUrl}`
      
      return await scrapePUBGArticle(fullUrl)
    }

    const articleUrl = patchNoteLink.getAttribute('href') || ''
    const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://pubg.com${articleUrl}`

    return await scrapePUBGArticle(fullUrl)
  } catch (error) {
    console.error('PUBG 크롤링 오류:', error)
    return null
  }
}

async function scrapePUBGArticle(url: string): Promise<PatchNoteData | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const html = await response.text()
    const root = parse(html)

    // 제목 추출
    const titleEl = root.querySelector('h1')
    const title = titleEl?.text.trim() || root.querySelector('title')?.text.trim() || ''

    // 본문 추출
    const scripts = root.querySelectorAll('script')
    const styles = root.querySelectorAll('style')
    const navs = root.querySelectorAll('nav')
    const headers = root.querySelectorAll('header')
    const footers = root.querySelectorAll('footer')
    const asides = root.querySelectorAll('aside')
    
    scripts.forEach(el => el.remove())
    styles.forEach(el => el.remove())
    navs.forEach(el => el.remove())
    headers.forEach(el => el.remove())
    footers.forEach(el => el.remove())
    asides.forEach(el => el.remove())

    const article = root.querySelector('article, .article-content, main, .content, .post-content')
    const content = article?.text.trim() || root.querySelector('body')?.text.trim() || ''

    // 날짜 추출
    const timeEl = root.querySelector('time[datetime]') || root.querySelector('[datetime]')
    const dateText = timeEl?.getAttribute('datetime') || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      content: content.replace(/\s+/g, ' ').substring(0, 10000),
      publishedAt,
    }
  } catch (error) {
    console.error('PUBG 아티클 크롤링 오류:', error)
    return null
  }
}

// 게임 타입에 따라 크롤링 함수 호출
export async function scrapeGame(game: GameType): Promise<PatchNoteData | null> {
  switch (game) {
    case 'lol':
      return await scrapeLOL()
    case 'valorant':
      return await scrapeValorant()
    case 'pubg':
      return await scrapePUBG()
    default:
      return null
  }
}
