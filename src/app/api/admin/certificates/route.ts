import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

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

  } catch (_error) {
    console.error('Error fetching certificates:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Extraer datos del formulario
    const dni = formData.get('dni') as string
    const fullName = formData.get('fullName') as string
    const course = formData.get('course') as string
    const company = formData.get('company') as string
    const issueDate = formData.get('issueDate') as string
    const expiryDate = formData.get('expiryDate') as string
    const pdfFile = formData.get('pdfFile') as File

    // Validaciones básicas
    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar certificado duplicado
    const existingCertificate = await prisma.certificate.findFirst({
      where: {
        dni,
        course
      }
    })

    if (existingCertificate) {
      return NextResponse.json(
        { error: 'Ya existe un certificado para este DNI y curso' },
        { status: 400 }
      )
    }

    let pdfUrl = null

    // Procesar archivo PDF si existe
    if (pdfFile && pdfFile.size > 0) {
      // Validar tipo de archivo
      if (pdfFile.type !== 'application/pdf') {
        return NextResponse.json(
          { error: 'Solo se permiten archivos PDF' },
          { status: 400 }
        )
      }

      // Validar tamaño (máximo 10MB)
      if (pdfFile.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: 'El archivo no puede ser mayor a 10MB' },
          { status: 400 }
        )
      }

      // Crear directorio si no existe
      const certificatesDir = join(process.cwd(), 'certificates')
      if (!existsSync(certificatesDir)) {
        await mkdir(certificatesDir, { recursive: true })
      }

      // Generar nombre único para el archivo
      const timestamp = Date.now()
      const sanitizedCourse = course.replace(/[^a-zA-Z0-9]/g, '_')
      const filename = `${dni}_${sanitizedCourse}_${timestamp}.pdf`
      const filePath = join(certificatesDir, filename)

      // Guardar archivo
      const bytes = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      // Generar URL para descarga
      pdfUrl = `/api/certificates/download/${filename}`
    }

    // Crear certificado en la base de datos
    const certificate = await prisma.certificate.create({
      data: {
        dni,
        fullName,
        course,
        company,
        issueDate: new Date(issueDate),
        expiryDate: new Date(expiryDate),
        pdfUrl,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Certificado creado exitosamente',
      certificate
    }, { status: 201 })

  } catch (_error) {
    console.error('Error creating certificate:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

