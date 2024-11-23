import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/library";

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrText, setQrText] = useState<string>("Scanning...");

  useEffect(() => {
    const startScanner = async () => {
      try {
        // Request video stream from user's camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
  
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
  
        const codeReader = new BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(null, videoRef.current!, (result, err) => {
          if (result) {
            setQrText(result.getText()); // Set scanned QR text
          } else if (err ) {
            console.error(err);
          }
        });
      } catch (error) {
        console.error("Camera access error:", error);
        setQrText("Unable to access camera");
      }
    };
  
    startScanner();
  
    return () => {
      const stream = videoRef.current?.srcObject as MediaStream;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
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
