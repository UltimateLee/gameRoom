import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    redirect('/login')
  }

  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  })

  if (!user?.isAdmin) {
    redirect('/')
  }

  return session
}

export async function isAdmin() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.email) {
    return false
  }

  const { prisma } = await import('@/lib/prisma')
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { isAdmin: true },
  })

  return user?.isAdmin || false
}

