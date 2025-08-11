import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return NextResponse.json(
        { message: 'DNI es requerido' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.findUnique({
      where: {
        dni: dni,
        isActive: true
      }
    })

    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    const now = new Date()
    if (certificate.expiryDate < now) {
      return NextResponse.json(
        { message: 'Certificado expirado' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Certificado encontrado',
      certificate
    })

  } catch (error) {
    console.error('Error searching certificate:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}