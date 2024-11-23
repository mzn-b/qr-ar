import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, ResultPoint } from "@zxing/library";

interface Person {
  name: string;
  lastName: string;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrText, setQrText] = useState<string>("Scanning...");
  const [qrPosition, setQrPosition] = useState<{ x: number; y: number } | null>(null);
  const [person, setPerson] = useState<Person | null>(null);

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
            const scannedText = result.getText();
            setQrText(scannedText);

            try {
              // Attempt to parse JSON from the scanned text
              const parsedData = JSON.parse(scannedText);
              if (parsedData.name && parsedData.lastName) {
                setPerson({ name: parsedData.name, lastName: parsedData.lastName });
              } else {
                console.warn("JSON does not contain required fields: name and lastName");
                setPerson(null);
              }
            } catch (e) {
              console.error("Invalid JSON:", e);
              setPerson(null);
            }

            // Calculate the center position of the QR code
            const points = result.getResultPoints();
            if (points.length > 0) {
              const x = points.reduce((sum, p) => sum + (p as ResultPoint).getX(), 0) / points.length;
              const y = points.reduce((sum, p) => sum + (p as ResultPoint).getY(), 0) / points.length;
              setQrPosition({ x, y });
            }
          } else if (err) {
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
    <div className="scanner-container" style={{ position: "relative", width: "100%", height: "100%" }}>
      <video ref={videoRef} className="camera-feed" autoPlay style={{ width: "100%", height: "100%" }}></video>
      {qrPosition && (
        <div
          className="qr-overlay"
          style={{
            position: "absolute",
            top: `${qrPosition.y}px`,
            left: `${qrPosition.x}px`,
            transform: "translate(-50%, -50%)",
            background: "rgba(0, 0, 0, 0.5)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
        >
          {person ? (
            <>
              <div>Name: {person.name}</div>
              <div>Last Name: {person.lastName}</div>
            </>
          ) : (
            "Invalid QR Data"
          )}
        </div>
      )}
    </div>
  );
};

export default App;
