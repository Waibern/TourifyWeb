import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function CameraScanner({ onScan }) {
  const locked = useRef(false);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "tourify-reader",
      { fps: 10, qrbox: { width: 230, height: 230 } },
      false,
    );
    scanner.render(
      (text) => {
        if (locked.current) return;
        locked.current = true;
        onScan(text);
        // Keep the camera open, but ignore duplicate frames from the same QR
        // for a moment while the validation result is displayed.
        window.setTimeout(() => {
          locked.current = false;
        }, 1800);
      },
      () => {},
    );
    return () => scanner.clear().catch(() => {});
  }, [onScan]);
  return <div id="tourify-reader" />;
}
