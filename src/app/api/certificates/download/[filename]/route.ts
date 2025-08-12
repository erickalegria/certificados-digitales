import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await context.params
    
    // Validar filename para seguridad
    if (!filename || filename.includes('..') || !filename.endsWith('.pdf')) {
      return NextResponse.json(
        { message: 'Archivo no válido' },
        { status: 400 }
      )
    }

    const filePath = path.join(process.cwd(), 'public', 'certificates', filename)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache'
        }
      })
    } catch (error) {
      return NextResponse.json(
        { message: 'Archivo no encontrado' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error downloading file:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}