import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const formData = await request.formData()
    
    const dni = formData.get('dni') as string
    const fullName = formData.get('fullName') as string
    const course = formData.get('course') as string
    const company = formData.get('company') as string
    const issueDate = formData.get('issueDate') as string
    const expiryDate = formData.get('expiryDate') as string
    const pdfFile = formData.get('pdfFile') as File

    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Buscar certificado existente
    const existingCertificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!existingCertificate) {
      return NextResponse.json(
        { error: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    let pdfUrl = existingCertificate.pdfUrl

    // Procesar nuevo archivo PDF si se proporciona
    if (pdfFile && pdfFile.size > 0) {
      if (pdfFile.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Solo se permiten archivos PDF' },
          { status: 400 }
        )
      }

      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'El archivo no puede ser mayor a 10MB' },
          { status: 400 }
        )
      }

      const certificatesDir = join(process.cwd(), 'certificates')
      if (!existsSync(certificatesDir)) {
        await mkdir(certificatesDir, { recursive: true })
      }

      const timestamp = Date.now()
      const sanitizedCourse = course.replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${dni}_${sanitizedCourse}_${timestamp}.pdf`
      const filePath = join(certificatesDir, filename)

      const bytes = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      pdfUrl = `/api/certificates/download/${filename}`
    }

    // Actualizar certificado
    const updatedCertificate = await prisma.certificate.update({
      where: { id },
      data: {
        dni,
        fullName,
        course,
        company,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        pdfUrl
      }
    })

    return NextResponse.json({
      message: 'Certificado actualizado exitosamente',
      certificate: updatedCertificate
    })

  } catch (_error) {
    console.error('Error updating certificate:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
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
        { error: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    await prisma.certificate.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      message: 'Certificado eliminado exitosamente'
    })

  } catch (_error) {
    console.error('Error deleting certificate:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}