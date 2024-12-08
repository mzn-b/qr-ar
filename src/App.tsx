// src/App.tsx
import React, { useRef } from "react";
import { useQRCodeScanner } from "./hooks/useQRCodeScanner";
import PersonCard from "./components/PersonCard";
import './App.css'; // Falls du zusätzliche Styles hast

const App: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const { person, bounds } = useQRCodeScanner(videoRef);

    return (
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
            <video
                ref={videoRef}
                style={{ width: "100%", height: "auto", display: "block" }}
                autoPlay
            ></video>
            {bounds && person && (
                <PersonCard
                    person={person}
                    style={{
                        position: "absolute",
                        top: `${bounds.y}px`,
                        left: `${bounds.x}px`,
                        width: `${bounds.width}px`,
                        height: `${bounds.height}px`
                    }}
                />
            )}
        </div>
    );
};

export default App;
