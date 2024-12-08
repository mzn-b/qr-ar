import { useEffect, useState, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import { ResultPoint } from "@zxing/library";

interface Person {
    name: string;
    lastName: string;
    address: string;
    city: string;
    tel: string;
    url: string;
    email: string;
}

interface Bounds {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface QRScannerResult {
    person: Person | null;
    bounds: Bounds | null;
}

export function useQRCodeScanner(videoRef: React.RefObject<HTMLVideoElement>): QRScannerResult {
    const [person, setPerson] = useState<Person | null>(null);
    const [qrBounds, setQrBounds] = useState<Bounds | null>(null);

    const xRef = useRef<number>(0);
    const yRef = useRef<number>(0);
    const OFFSET_THRESHOLD = 5;

    useEffect(() => {
        let codeReader: BrowserQRCodeReader | null = null;
        let isMounted = true;

        (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: "environment" },
                });
                if (videoRef.current && isMounted) {
                    videoRef.current.srcObject = stream;
                    await videoRef.current.play();
                }

                codeReader = new BrowserQRCodeReader();
                codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
                    if (!isMounted) return;

                    if (result) {
                        const points = result.getResultPoints();
                        if (points && points.length >= 4 && videoRef.current) {
                            const video = videoRef.current;
                            const videoBoundingRect = video.getBoundingClientRect();
                            const { videoWidth, videoHeight } = video;
                            const scaleX = videoBoundingRect.width / videoWidth;
                            const scaleY = videoBoundingRect.height / videoHeight;

                            const xValues = points.map((p) => (p as ResultPoint).getX());
                            const yValues = points.map((p) => (p as ResultPoint).getY());
                            const xMin = Math.min(...xValues);
                            const xMax = Math.max(...xValues);
                            const yMin = Math.min(...yValues);
                            const yMax = Math.max(...yValues);

                            // Nur aktualisieren, wenn der Offset groß genug ist, um "Flackern" zu vermeiden
                            if (Math.abs(xMin - xRef.current) > OFFSET_THRESHOLD || Math.abs(yMin - yRef.current) > OFFSET_THRESHOLD) {
                                const newBounds = {
                                    x: videoBoundingRect.left + xMin * scaleX,
                                    y: videoBoundingRect.top + yMin * scaleY,
                                    width: (xMax - xMin) * scaleX,
                                    height: (yMax - yMin) * scaleY,
                                };
                                setQrBounds(newBounds);
                                xRef.current = xMin;
                                yRef.current = yMin;
                            }

                            // Versuch, JSON zu parsen
                            try {
                                const scannedText = result.getText();
                                const parsedData = JSON.parse(scannedText);
                                if (parsedData.name && parsedData.lastName && parsedData.address && parsedData.city && parsedData.tel && parsedData.url && parsedData.email) {
                                    setPerson(parsedData);
                                } else {
                                    console.warn("QR-Code enthält nicht alle erwarteten Felder.");
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
        })();

        return () => {
            isMounted = false;
            if (videoRef.current?.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach((track) => track.stop());
            }

            // codeReader?.reset();
        };
    }, [videoRef]);

    return { person, bounds: qrBounds };
}
