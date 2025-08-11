import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const certificates = await prisma.certificate.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      certificates
    })

  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { dni, fullName, course, company, issueDate, expiryDate } = body

    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const existingCertificate = await prisma.certificate.findUnique({
      where: { dni }
    })

    if (existingCertificate) {
      return NextResponse.json(
        { message: 'Ya existe un certificado con este DNI' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.create({
      data: {
        dni,
        fullName,
        course,
        company,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Certificado creado exitosamente',
      certificate
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}