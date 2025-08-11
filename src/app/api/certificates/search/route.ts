import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface Certificate {
  id: string
  dni: string
  fullName: string
  course: string
  company: string
  issueDate: Date
  expiryDate: Date
  pdfUrl?: string
  isActive: boolean
}

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

    const certificates = await prisma.certificate.findMany({
      where: {
        dni: dni,
        isActive: true
      }
    })

    if (certificates.length === 0) {
      return NextResponse.json(
        { message: 'Certificados no encontrados' },
        { status: 404 }
      )
    }

    // Filtrar certificados no expirados
    const now = new Date()
    const validCertificates = certificates.filter((cert: Certificate) => cert.expiryDate >= now)

    if (validCertificates.length === 0) {
      return NextResponse.json(
        { message: 'Todos los certificados están expirados' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Certificados encontrados',
      certificates: validCertificates
    })

  } catch (error) {
    console.error('Error searching certificates:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}