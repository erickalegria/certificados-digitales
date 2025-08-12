import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const formData = await request.formData()
    
    // Extraer datos
    const dni = formData.get('dni') as string
    const fullName = formData.get('fullName') as string
    const course = formData.get('course') as string
    const company = formData.get('company') as string
    const issueDate = formData.get('issueDate') as string
    const expiryDate = formData.get('expiryDate') as string
    const pdfFile = formData.get('pdfFile') as File

    // Validaciones
    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el certificado existe
    const existingCertificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!existingCertificate) {
      return NextResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    let pdfUrl = existingCertificate.pdfUrl

    // Procesar nuevo archivo PDF si se subió uno
    if (pdfFile && pdfFile.size > 0) {
      // Validar archivo
      if (pdfFile.type !== 'application/pdf') {
        return NextResponse.json(
          { message: 'Solo se permiten archivos PDF' },
          { status: 400 }
        )
      }

      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { message: 'El archivo no puede ser mayor a 10MB' },
          { status: 400 }
        )
      }

      // Eliminar archivo anterior si existe
      if (existingCertificate.pdfUrl) {
        try {
          const oldFilePath = path.join(process.cwd(), 'public', existingCertificate.pdfUrl)
          await unlink(oldFilePath)
        } catch (error) {
          console.warn('No se pudo eliminar el archivo anterior:', error)
        }
      }

      // Crear directorio
      const uploadDir = path.join(process.cwd(), 'public', 'certificates')
      await mkdir(uploadDir, { recursive: true })

      // Guardar nuevo archivo
      const timestamp = Date.now()
      const sanitizedFileName = `${dni}-${course.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.pdf`
      const filePath = path.join(uploadDir, sanitizedFileName)

      const bytes = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      pdfUrl = `/api/certificates/download/${sanitizedFileName}`
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

    // Buscar certificado
    const certificate = await prisma.certificate.findUnique({
      where: { id }
    })

    if (!certificate) {
      return NextResponse.json(
        { message: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar archivo PDF si existe
    if (certificate.pdfUrl) {
      try {
        const filePath = path.join(process.cwd(), 'public', certificate.pdfUrl)
        await unlink(filePath)
      } catch (error) {
        console.warn('No se pudo eliminar el archivo:', error)
      }
    }

    // Eliminar de la base de datos
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