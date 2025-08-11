export interface Certificate {
  id: string
  dni: string
  fullName: string
  course: string
  company: string
  issueDate: Date
  expiryDate: Date
  pdfUrl?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CertificateFormData {
  dni: string
  fullName: string
  course: string
  company: string
  issueDate: string
  expiryDate: string
}