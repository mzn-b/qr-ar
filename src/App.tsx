import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader, ResultPoint } from "@zxing/library";
import nameIcon from './assets/name.png'; 

interface Person {
  name: string;
  lastName: string;
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrBounds, setQrBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const [lastSeen, setLastSeen] = useState<number>(Date.now());

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
        codeReader.decodeFromVideoDevice(null, videoRef.current!, (result) => {
          if (result) {
            setLastSeen(Date.now());
            try {
              // Attempt to parse JSON from the scanned text
              const scannedText = result.getText();
              const parsedData = JSON.parse(scannedText);
              if (parsedData.name && parsedData.lastName) {
                setPerson({ name: parsedData.name, lastName: parsedData.lastName });
              } else {
                console.warn("JSON does not contain required fields: name and lastName");
              }
            } catch (e) {
              console.error("Invalid JSON:", e);
            }

            // Calculate the bounding box of the QR code
            const points = result.getResultPoints();
            if (points.length >= 4) {
              const xValues = points.map((p) => (p as ResultPoint).getX());
              const yValues = points.map((p) => (p as ResultPoint).getY());
              const xMin = Math.min(...xValues);
              const xMax = Math.max(...xValues);
              const yMin = Math.min(...yValues);
              const yMax = Math.max(...yValues);
              setQrBounds({
                x: xMin,
                y: yMin,
                width: xMax - xMin,
                height: yMax - yMin,
              });
            }
          } else {
            const timeDiff = Date.now() - lastSeen;
            if (timeDiff > 100) {
              // Clear state if no QR code is detected
              setQrBounds(null);
              setPerson(null);
            }
          }
        });
      } catch (error) {
        console.error("Camera access error:", error);
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
    <div className="scanner-container" style={{ position: "relative"/*, width: "100%", height: "100%"*/ }}>
      <video ref={videoRef} className="camera-feed" autoPlay style={{/* width: "100%", height: "100%" */}}></video>
      {qrBounds && person && (
        <div
          className="qr-overlay"
          style={{
            position: "absolute",
            top: `${qrBounds.y}px`,
            left: `${qrBounds.x}px`,
            width: `${qrBounds.width}px`,
            height: `${qrBounds.height}px`,
            transform: "translate(-50%, -50%)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            fontSize: `${Math.max(qrBounds.width, qrBounds.height) * 0.1}px`,
            border: "5px solid white",
            borderRadius: "5px",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <table
          style={{
            width: "100%",
            color: "white", // White text
            textAlign: "left", // Align text to the left
          }}
        >
          <tbody>
            {/* First Row: Name */}
            <tr>
              <td style={{ textAlign: "center", padding: "5px" }}>
                <img
                  src={nameIcon}
                  alt="Name Icon"
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                />
              </td>
              <td style={{ fontWeight: "bold", padding: "5px" }}>Name:</td>
              <td style={{ padding: "5px" }}>{person.name}</td>
            </tr>
            {/* Second Row: Last Name */}
            <tr>
              <td style={{ textAlign: "center", padding: "5px" }}>
                <img
                  src={nameIcon}
                  alt="Last Name Icon"
                  style={{
                    width: "20px",
                    height: "20px",
                  }}
                />
              </td>
              <td style={{ fontWeight: "bold", padding: "5px" }}>Last Name:</td>
              <td style={{ padding: "5px" }}>{person.lastName}</td>
            </tr>
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
};

export default App;
