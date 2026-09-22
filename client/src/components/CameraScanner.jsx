import { useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'

export default function CameraScanner({ onScan }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner('tourify-reader', { fps: 10, qrbox: { width: 230, height: 230 } }, false)
    scanner.render(text => { onScan(text); scanner.clear().catch(() => {}) }, () => {})
    return () => scanner.clear().catch(() => {})
  }, [onScan])
  return <div id="tourify-reader" />
}
