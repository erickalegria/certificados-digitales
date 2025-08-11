import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { dni, fullName, course, company, issueDate, expiryDate } = body

    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const certificate = await prisma.certificate.update({
      where: { id },
      data: {
        dni,
        fullName,
        course,
        company,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate)
      }
    })

    return NextResponse.json({
      message: 'Certificado actualizado exitosamente',
      certificate
    })

  } catch (error) {
    console.error('Error updating certificate:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    const certificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    await prisma.certificate.delete({
      where: { id }
    })

    return NextResponse.json({
      message: 'Certificado eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error deleting certificate:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}