import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Email y password requeridos' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ message: 'Credenciales inválidas' }, { status: 401 })
    }

    const token = generateToken(user.id)
    
    const response = NextResponse.json({ message: 'Login exitoso', user: { id: user.id, email: user.email, role: user.role } })
    response.cookies.set('auth-token', token, { httpOnly: true, maxAge: 86400 })
    
    return response
  } catch (error) {
    return NextResponse.json({ message: 'Error interno' }, { status: 500 })
  }
}