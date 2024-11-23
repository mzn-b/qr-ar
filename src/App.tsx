import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/library";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrText, setQrText] = useState<string>("Scanning...");

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let activeDeviceId: string | null = null;

    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        activeDeviceId = videoInputDevices[0]?.deviceId || null;

        if (activeDeviceId && videoRef.current) {
          codeReader.decodeFromVideoDevice(
            activeDeviceId,
            videoRef.current,
            (result, err) => {
              if (result) {
                setQrText(result.getText()); // Display the QR code text
              } else if (err) {
                console.error(err);
              }
            }
          );
        }
      } catch (error) {
        console.error("Error starting scanner:", error);
      }
    };

    startScanner();

    return () => {
      codeReader.reset();
    };
  }, []);

  return (
    <div className="scanner-container">
      <video ref={videoRef} className="camera-feed" autoPlay></video>
      <div className="overlay">{qrText}</div>
    </div>
  );
};

export default App;
