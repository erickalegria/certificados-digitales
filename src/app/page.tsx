'use client'

import { useState } from 'react'

interface Certificate {
  id: string
  dni: string
  fullName: string
  course: string
  company: string
  issueDate: Date
  expiryDate: Date
  pdfUrl?: string
  isActive: boolean
}

export default function HomePage() {
  const [dni, setDni] = useState('')
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)

  const searchCertificate = async () => {
    if (!dni.trim()) {
      setError('Por favor ingrese un DNI válido')
      return
    }

    setLoading(true)
    setError('')
    setCertificates([])

    try {
      const response = await fetch(`/api/certificates/search?dni=${dni}`)
      const data = await response.json()

      if (response.ok) {
        setCertificates(data.certificates || [])
      } else {
        setError(data.message || 'Certificados no encontrados')
      }
    } catch (error) {
      setError('Error al buscar certificados')
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = (pdfUrl?: string) => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank')
    }
  }

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email y contraseña son requeridos')
      return
    }

    setLoginLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      
      if (response.ok) {
        window.location.href = '/admin'
      } else {
        const data = await response.json()
        setError(data.message || 'Credenciales inválidas')
      }
    } catch (error) {
      setError('Error de conexión')
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SESMA CONSULTORES</h1>
                <p className="text-sm text-gray-600">PLATAFORMA DE CONSULTA</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-600 hover:text-gray-900">
                Consultar
              </button>
              <button 
                onClick={() => setShowLogin(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Administración
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Certificados Digitales
          </h2>
          <p className="text-lg text-gray-600">
            Verifica si la constancia es genuina
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center mb-6">
            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Buscar Certificado</span>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                DNI
              </label>
              <input
                type="text"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="Ingrese número de DNI"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && searchCertificate()}
              />
            </div>

            <button
              onClick={searchCertificate}
              disabled={loading}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Buscando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Verificar</span>
                </>
              )}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Certificates Results */}
        {certificates.length > 0 && (
          <div className="space-y-6">
            {certificates.map((certificate) => (
              <div key={certificate.id} className="bg-white rounded-2xl shadow-lg p-8">
                <div className="bg-green-500 text-white p-4 rounded-lg mb-6 flex items-center space-x-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Certificado Verificado</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">ID del certificado</h3>
                    <p className="text-gray-900">{certificate.id}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Nombre de Alumno</h3>
                    <p className="text-gray-900">{certificate.fullName}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Fecha Emisión</h3>
                    <p className="text-gray-900">{new Date(certificate.issueDate).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Fecha Expiración</h3>
                    <p className="text-gray-900">{new Date(certificate.expiryDate).toLocaleDateString('es-ES')}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Curso</h3>
                    <p className="text-gray-900">{certificate.course}</p>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-700 mb-1">Empresa</h3>
                    <p className="text-gray-900">{certificate.company}</p>
                  </div>
                </div>

                <div className="mt-8">
                  <button 
                    onClick={() => downloadCertificate(certificate.pdfUrl)}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Descargar Certificado</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Login Modal */}
      {showLogin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Acceso Administrativo</h3>
              <button
                onClick={() => setShowLogin(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ourworldhealth.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <button 
                onClick={handleLogin}
                disabled={loginLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {loginLoading ? 'Ingresando...' : 'Sign In'}
              </button>
              <div className="text-center">
                <a href="#" className="text-blue-600 text-sm hover:underline">
                  Forgot Password?
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}