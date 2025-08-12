import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params
    
    // Validar que el archivo tenga extensión .pdf
    if (!filename.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Archivo no válido' },
        { status: 400 }
      )
    }

    // Construir la ruta del archivo
    const filePath = join(process.cwd(), 'certificates', filename)
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // FIX: Convertir Buffer a Uint8Array para Next.js 15
      return new NextResponse(new Uint8Array(fileBuffer), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      })
    } catch (_fileError) {
      return NextResponse.json(
        { error: 'Archivo no encontrado' },
        { status: 404 }
      )
    }
  } catch (_error) {
    console.error('Error descargando certificado:', _error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}