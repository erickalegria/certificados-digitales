import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

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