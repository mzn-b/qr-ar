import { useEffect, useRef, useState } from "react";
import { ResultPoint } from "@zxing/library"; // Wichtig: unverändert lassen
import { BrowserQRCodeReader } from "@zxing/browser";
import { Person } from "../types/person";

export function useQrScanner() {
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

                            // Größe und Position des Videos berechnen (Logik unverändert)
                            const videoBoundingRect = video.getBoundingClientRect();
                            const videoWidth = video.videoWidth;
                            const videoHeight = video.videoHeight;

                            const scaleX = videoBoundingRect.width / videoWidth;
                            const scaleY = videoBoundingRect.height / videoHeight;

                            const xValues = points.map((p) => (p as ResultPoint).getX());
                            const yValues = points.map((p) => (p as ResultPoint).getY());
                            const xMin = Math.min(...xValues);
                            const xMax = Math.max(...xValues);
                            const yMin = Math.min(...yValues);
                            const yMax = Math.max(...yValues);

                            if (Math.abs(xMin - x.current) > 5 || Math.abs(yMin - y.current) > 5) {
                                // Umrechnung auf die sichtbare Videoanzeige (Logik unverändert)
                                const newBounds = {
                                    x: videoBoundingRect.left + xMin * scaleX,
                                    y: videoBoundingRect.top + yMin * scaleY,
                                    width: (xMax - xMin) * scaleX,
                                    height: (yMax - yMin) * scaleY,
                                };

                                setQrBounds(newBounds);
                                x.current = xMin;
                                y.current = yMin;
                            }


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
                        setQrBounds(null);
                        setPerson(null);
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

    return { videoRef, qrBounds, person };
}
