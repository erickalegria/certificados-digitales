import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const dni = searchParams.get('dni')

    if (!dni) {
      return NextResponse.json(
        { error: 'DNI es requerido' },
        { status: 400 }
      )
    }

    const certificates = await prisma.certificate.findMany({
      where: {
        dni: dni,
        isActive: true
      },
      select: {
        id: true,
        dni: true,
        fullName: true,
        course: true,
        company: true,
        issueDate: true,
        expiryDate: true,
        pdfUrl: true,
        isActive: true
      }
    })

    // Mapear a la estructura esperada por el frontend
    const certificatesWithUrl = certificates.map((cert: any) => ({
      id: cert.id,
      dni: cert.dni,
      fullName: cert.fullName,
      course: cert.course,
      company: cert.company,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      isActive: cert.isActive,
      pdfUrl: cert.pdfUrl || null
    }))

    return NextResponse.json({
      certificates: certificatesWithUrl,
      message: certificates.length > 0 ? 'Certificados encontrados' : 'No se encontraron certificados'
    })

  } catch (_error) {
    console.error('Error searching certificates:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}