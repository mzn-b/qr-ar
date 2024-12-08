import React, { useEffect, useRef, useState } from "react";
import { ResultPoint } from "@zxing/library";
import nameIcon from './assets/name.png'; // Bild-Icon für die Anzeige
import addressIcon from './assets/adresse.png'; // Bild-Icon für die Anzeige
import telefonIcon from './assets/telefon.png'; // Bild-Icon für die Anzeige
import webIcon from './assets/web.png'; // Bild-Icon für die Anzeige
import emailIcon from './assets/email.png'; // Bild-Icon für die Anzeige
import { BrowserQRCodeReader } from "@zxing/browser";

interface Person {
  name: string;
  lastName: string;
  address: string;
  city: string;
  tel: string;
  url: string;
  email: string; // New email field
}

const AppOld: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [qrBounds, setQrBounds] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [person, setPerson] = useState<Person | null>(null);
  const x = useRef(0);
  const y = useRef(0);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const codeReader = new BrowserQRCodeReader();
        codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
          if (result) {
            const points = result.getResultPoints();
            if (points && points.length >= 4 && videoRef.current) {
              const video = videoRef.current;
             
              // Größe und Position des Videos berechnen
              const videoBoundingRect = video.getBoundingClientRect();
              const videoWidth = video.videoWidth;
              const videoHeight = video.videoHeight;

              const scaleX = videoBoundingRect.width / videoWidth;
              const scaleY = videoBoundingRect.height / videoHeight;

              // QR-Code Punkte in Bounding-Box umwandeln
              const xValues = points.map((p) => (p as ResultPoint).getX());
              const yValues = points.map((p) => (p as ResultPoint).getY());
              const xMin = Math.min(...xValues);
              const xMax = Math.max(...xValues);
              const yMin = Math.min(...yValues);
              const yMax = Math.max(...yValues);


              if (Math.abs(xMin - x.current) > 5 || Math.abs(yMin - y.current) > 5) {
                // Umrechnung auf die sichtbare Videoanzeige
                const newBounds = {
                  x: videoBoundingRect.left + xMin * scaleX,
                  y: videoBoundingRect.top + yMin * scaleY,
                  width: (xMax - xMin) * scaleX,
                  height: (yMax - yMin) * scaleY,
                };

                setQrBounds(newBounds);
                x.current = xMin;
                y.current = yMin;
              } else {
                console.log("Offset too small")
              }

              // QR-Code Text auslesen und parsen
              const scannedText = result.getText();

              try {
                const parsedData = JSON.parse(scannedText);
                if (parsedData.name && parsedData.lastName && parsedData.address && parsedData.city && parsedData.tel && parsedData.url && parsedData.email) {
                  setPerson({ 
                    name: parsedData.name, 
                    lastName: parsedData.lastName, 
                    address: parsedData.address, 
                    city: parsedData.city, 
                    tel: parsedData.tel, 
                    url: parsedData.url, 
                    email: parsedData.email 
                  });
                } else {
                  console.warn("QR-Code enthält nicht die erwarteten Felder.");
                }
              } catch (e) {
                console.error("Ungültiger QR-Code JSON:", e);
              }
            }
          } else {
            setQrBounds(null);  // Kein QR-Code erkannt
            setPerson(null);  // Daten zurücksetzen
          }
        });
      } catch (error) {
        console.error("Kamera-Zugriffsfehler:", error);
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
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <video
        ref={videoRef}
        style={{ width: "100%", height: "auto", display: "block" }}
        autoPlay
      ></video>

      {qrBounds && person && (
        <div
          style={{
            position: "absolute",
            top: `${qrBounds.y}px`,
            left: `${qrBounds.x}px`,
            width: `${qrBounds.width}px`,
            height: `${qrBounds.height}px`,
            border: "5px solid white",
            background: "rgba(0, 0, 0, 0.8)",
            color: "white",
            pointerEvents: "none",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <table style={{ width: "100%", color: "white", textAlign: "left" }}>
            <tbody>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={nameIcon} alt="Name Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Name:</td>
                <td style={{ padding: "5px" }}>{person.name}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={nameIcon} alt="Last Name Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Lastname:</td>
                <td style={{ padding: "5px" }}>{person.lastName}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={addressIcon} alt="Address Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Address:</td>
                <td style={{ padding: "5px" }}>{person.address}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={emailIcon} alt="Email Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Email:</td>
                <td style={{ padding: "5px" }}>{person.email}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={telefonIcon} alt="Phone Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Phone:</td>
                <td style={{ padding: "5px" }}>{person.tel}</td>
              </tr>
              <tr>
                <td style={{ textAlign: "center", padding: "5px" }}>
                  <img src={webIcon} alt="Web Icon" style={{ width: "20px", height: "20px" }} />
                </td>
                <td style={{ fontWeight: "bold", padding: "5px" }}>Web:</td>
                <td style={{ padding: "5px" }}>{person.url}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AppOld;