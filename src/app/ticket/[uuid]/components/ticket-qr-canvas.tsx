'use client'

import { QRCodeCanvas } from 'qrcode.react'

interface TicketQrCanvasProps {
  value: string
  size: number
}

export default function TicketQrCanvas({ value, size }: TicketQrCanvasProps) {
  return (
    <QRCodeCanvas
      value={value}
      size={size}
      level="M"
      includeMargin={true}
      className="bg-white p-2 rounded-lg border border-slate-100"
    />
  )
}
