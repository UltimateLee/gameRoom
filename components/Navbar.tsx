'use client'

import { memo, useState, useCallback } from 'react'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import Image from 'next/image'

function Navbar() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = useCallback(() => {
    signOut()
  }, [])

  const toggleMobileMenu = useCallback(() => {
    setMobileMenuOpen(prev => !prev)
  }, [])

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
  }, [])

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              게임방
            </span>
          </Link>

          {/* 데스크톱 메뉴 */}
          <div className="hidden md:flex items-center gap-2 lg:gap-4">
            <Link
              href="/posts"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              일반 게시판
            </Link>
            <Link
              href="/posts?category=game-recommend"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              게임 추천
            </Link>
            <Link
              href="/games"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50"
            >
              인기 게임
            </Link>
            <Link
              href="/games/ai-recommend"
              className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50 flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI 추천
            </Link>
            {status === 'loading' ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : session ? (
              <>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-2 lg:px-3 py-2 rounded-lg hover:bg-primary-50 flex items-center gap-1.5"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    관리자
                  </Link>
                )}
                <Link
                  href="/posts/new"
                  className="hidden lg:flex items-center gap-1.5 text-gray-700 hover:text-primary-600 transition-colors font-medium text-sm px-3 py-2 rounded-lg hover:bg-primary-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  글쓰기
                </Link>
                <Link
                  href={`/users/${encodeURIComponent(session.user?.email || '')}`}
                  className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {session.user?.image ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || session.user?.email || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                      {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span className="text-gray-700 text-xs sm:text-sm hidden xl:inline font-medium">
                    {session.user?.name || session.user?.email}
                  </span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-gray-600 hover:text-red-600 transition-colors text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg hover:bg-red-50"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="bg-gradient-to-r from-primary-600 to-primary-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 shadow-md shadow-primary-500/30 font-medium text-xs sm:text-sm"
              >
                로그인
              </Link>
            )}
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="md:hidden flex items-center gap-2">
            {session && (
              <Link
                href="/posts/new"
                className="p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-700 hover:text-primary-600 transition-colors rounded-lg hover:bg-primary-50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4 space-y-2">
            <Link
              href="/posts"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
            >
              일반 게시판
            </Link>
            <Link
              href="/posts?category=game-recommend"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
            >
              게임 추천
            </Link>
            <Link
              href="/games"
              onClick={closeMobileMenu}
              className="block px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
            >
              인기 게임
            </Link>
            <Link
              href="/games/ai-recommend"
              onClick={closeMobileMenu}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              AI 추천
            </Link>
            {session ? (
              <>
                {session.user?.isAdmin && (
                  <Link
                    href="/admin"
                    onClick={closeMobileMenu}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    관리자
                  </Link>
                )}
                <Link
                  href={`/users/${encodeURIComponent(session.user?.email || '')}`}
                  onClick={closeMobileMenu}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-colors font-medium text-sm rounded-lg"
                >
                  {session.user?.image ? (
                    <div className="relative w-6 h-6 rounded-full overflow-hidden">
                      <Image
                        src={session.user.image}
                        alt={session.user?.name || session.user?.email || 'User'}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-semibold">
                      {(session.user?.name || session.user?.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <span>{session.user?.name || session.user?.email}</span>
                </Link>
                <button
                  onClick={() => {
                    handleSignOut()
                    closeMobileMenu()
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 transition-colors font-medium text-sm rounded-lg"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMobileMenu}
                className="block px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition-all duration-200 font-medium text-sm text-center"
              >
                로그인
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}

export default memo(Navbar)
