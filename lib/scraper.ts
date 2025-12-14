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

    // 패치노트 링크 찾기 (여러 패턴 시도)
    let patchNoteLink = root.querySelector('a[href*="patch-notes"]') 
      || root.querySelector('a[href*="game-updates/patch"]')
      || root.querySelector('a[href*="/patch-"]')
      || root.querySelector('article a[href*="patch"]')
      || root.querySelector('.article-list a, .news-list a, .post-list a')

    if (!patchNoteLink) {
      // 더 넓은 범위로 검색
      const allLinks = root.querySelectorAll('a[href*="patch"], a[href*="update"]')
      for (const link of allLinks) {
        const href = link.getAttribute('href') || ''
        if (href.includes('patch') && (href.includes('notes') || href.includes('update'))) {
          patchNoteLink = link
          break
        }
      }
    }

    if (!patchNoteLink) {
      console.error('LOL: 패치노트 링크를 찾을 수 없습니다')
      return null
    }

    const articleUrl = patchNoteLink.getAttribute('href') || ''
    const fullUrl = articleUrl.startsWith('http') 
      ? articleUrl 
      : articleUrl.startsWith('/') 
        ? `https://www.leagueoflegends.com${articleUrl}`
        : `https://www.leagueoflegends.com/${articleUrl}`

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

    // 제목 추출 (여러 패턴 시도)
    const titleEl = root.querySelector('h1') 
      || root.querySelector('.article-title, .post-title, .news-title')
      || root.querySelector('title')
    const title = titleEl?.text.trim() || ''

    // 본문 추출 (불필요한 요소 제거)
    const scripts = root.querySelectorAll('script')
    const styles = root.querySelectorAll('style')
    const navs = root.querySelectorAll('nav')
    const headers = root.querySelectorAll('header')
    const footers = root.querySelectorAll('footer')
    const asides = root.querySelectorAll('aside')
    const ads = root.querySelectorAll('.ad, .advertisement, .ads, [class*="ad-"]')
    
    scripts.forEach(el => el.remove())
    styles.forEach(el => el.remove())
    navs.forEach(el => el.remove())
    headers.forEach(el => el.remove())
    footers.forEach(el => el.remove())
    asides.forEach(el => el.remove())
    ads.forEach(el => el.remove())

    // 본문 추출 (여러 선택자 시도)
    const article = root.querySelector('article') 
      || root.querySelector('.article-content, .article-body, .post-content, .news-content')
      || root.querySelector('main')
      || root.querySelector('.content')
      || root.querySelector('[role="article"]')
    
    let content = article?.text.trim() || root.querySelector('body')?.text.trim() || ''
    
    // 본문이 너무 짧으면 더 넓은 범위에서 추출
    if (content.length < 500) {
      const mainContent = root.querySelector('main, .main-content, #main-content')
      if (mainContent) {
        content = mainContent.text.trim()
      }
    }

    // 날짜 추출
    const timeEl = root.querySelector('time[datetime]') 
      || root.querySelector('[datetime]')
      || root.querySelector('.article-date, .post-date, .published-date')
    const dateText = timeEl?.getAttribute('datetime') || timeEl?.text.trim() || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      content: content.replace(/\s+/g, ' ').substring(0, 50000), // 최대 50000자로 증가
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

    // 패치노트 관련 링크 찾기 (여러 패턴 시도)
    let patchNoteLink = root.querySelector('a[href*="patch"], a[href*="update"]')
      || root.querySelector('a[href*="patch_notes"]')
      || root.querySelector('a[href*="category=patch"]')
    
    if (!patchNoteLink) {
      // 더 넓은 범위로 검색
      const allLinks = root.querySelectorAll('a[href*="patch"], a[href*="update"], a[href*="news"]')
      for (const link of allLinks) {
        const href = link.getAttribute('href') || ''
        const text = link.text.trim().toLowerCase()
        if ((href.includes('patch') || href.includes('update') || text.includes('패치')) 
            && (href.includes('news') || href.includes('/ko/'))) {
          patchNoteLink = link
          break
        }
      }
    }

    if (!patchNoteLink) {
      // 대체: 첫 번째 뉴스 기사
      const firstArticle = root.querySelector('article, .news-item, .post, .news-card')
      if (!firstArticle) {
        console.error('PUBG: 패치노트 링크를 찾을 수 없습니다')
        return null
      }
      const articleLink = firstArticle.querySelector('a')
      const articleUrl = articleLink?.getAttribute('href') || ''
      const fullUrl = articleUrl.startsWith('http') ? articleUrl : `https://pubg.com${articleUrl}`
      
      return await scrapePUBGArticle(fullUrl)
    }

    const articleUrl = patchNoteLink.getAttribute('href') || ''
    const fullUrl = articleUrl.startsWith('http') 
      ? articleUrl 
      : articleUrl.startsWith('/') 
        ? `https://pubg.com${articleUrl}`
        : `https://pubg.com/${articleUrl}`

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

    // 제목 추출 (여러 패턴 시도)
    const titleEl = root.querySelector('h1') 
      || root.querySelector('.article-title, .post-title, .news-title, .patch-title')
      || root.querySelector('title')
    const title = titleEl?.text.trim() || ''

    // 본문 추출 (불필요한 요소 제거)
    const scripts = root.querySelectorAll('script')
    const styles = root.querySelectorAll('style')
    const navs = root.querySelectorAll('nav')
    const headers = root.querySelectorAll('header')
    const footers = root.querySelectorAll('footer')
    const asides = root.querySelectorAll('aside')
    const ads = root.querySelectorAll('.ad, .advertisement, .ads, [class*="ad-"]')
    const socials = root.querySelectorAll('.social, .share, [class*="social"]')
    
    scripts.forEach(el => el.remove())
    styles.forEach(el => el.remove())
    navs.forEach(el => el.remove())
    headers.forEach(el => el.remove())
    footers.forEach(el => el.remove())
    asides.forEach(el => el.remove())
    ads.forEach(el => el.remove())
    socials.forEach(el => el.remove())

    // 본문 추출 (여러 선택자 시도, 우선순위 순)
    let article = root.querySelector('article') 
      || root.querySelector('.article-content, .article-body')
      || root.querySelector('.post-content, .news-content')
      || root.querySelector('main')
      || root.querySelector('.content, .main-content')
      || root.querySelector('[role="article"]')
      || root.querySelector('.patch-note-content')
    
    let content = ''
    
    if (article) {
      // article 내부의 본문만 추출 (제목 제외)
      const titleInArticle = article.querySelector('h1, h2, .title')
      if (titleInArticle) {
        titleInArticle.remove()
      }
      content = article.text.trim()
    } else {
      // article을 찾지 못한 경우 body에서 추출하되, 불필요한 부분 제거
      const body = root.querySelector('body')
      if (body) {
        // 본문이 될 수 있는 섹션 찾기
        const mainSections = body.querySelectorAll('section, div[class*="content"], div[class*="article"]')
        for (const section of mainSections) {
          const sectionText = section.text.trim()
          if (sectionText.length > 500) { // 충분히 긴 섹션만 본문으로 간주
            content += sectionText + ' '
          }
        }
        if (!content) {
          content = body.text.trim()
        }
      }
    }

    // 본문이 너무 짧으면 더 넓은 범위에서 추출
    if (content.length < 1000) {
      const mainContent = root.querySelector('main, .main-content, #main-content, .news-detail')
      if (mainContent) {
        const mainText = mainContent.text.trim()
        if (mainText.length > content.length) {
          content = mainText
        }
      }
    }

    // 날짜 추출
    const timeEl = root.querySelector('time[datetime]') 
      || root.querySelector('[datetime]')
      || root.querySelector('.article-date, .post-date, .published-date, .date')
    const dateText = timeEl?.getAttribute('datetime') || timeEl?.text.trim() || ''
    const publishedAt = dateText ? new Date(dateText) : new Date()

    return {
      title,
      url,
      content: content.replace(/\s+/g, ' ').substring(0, 50000), // 최대 50000자로 증가
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
