//import React from "react";
import { useQrScanner } from "./hooks/useQrScanner";
import PersonCard from "./components/PersonCard";
import './styles/App.css';

function App() {
    const { videoRef, qrBounds, person } = useQrScanner();

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
                    <PersonCard person={person} />
                </div>
            )}
        </div>
    );
}

export default App;
