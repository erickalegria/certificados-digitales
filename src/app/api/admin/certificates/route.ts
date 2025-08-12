import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

    // Validaciones
    if (!dni || !fullName || !course || !company || !issueDate || !expiryDate) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Verificar certificado duplicado (usando el constraint único del schema)
    try {
      const existingCertificate = await prisma.certificate.findFirst({
        where: {
          dni,
          course
        }
      })

      if (existingCertificate) {
        return NextResponse.json(
          { message: 'Ya existe un certificado para este DNI y curso' },
          { status: 400 }
        )
      }
    } catch (error) {
      // Manejo del constraint único a nivel de DB
    }

    let pdfUrl = null

    // Procesar archivo PDF
    if (pdfFile && pdfFile.size > 0) {
      // Validar archivo
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

      // Crear directorio
      const uploadDir = path.join(process.cwd(), 'public', 'certificates')
      await mkdir(uploadDir, { recursive: true })

      // Guardar archivo
      const timestamp = Date.now()
      const sanitizedFileName = `${dni}-${course.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.pdf`
      const filePath = path.join(uploadDir, sanitizedFileName)

      const bytes = await pdfFile.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filePath, buffer)

      pdfUrl = `/api/certificates/download/${sanitizedFileName}`
    }

    // Crear certificado
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

  } catch (error) {
    console.error('Error creating certificate:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}