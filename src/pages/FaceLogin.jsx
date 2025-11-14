import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceLogin() {
  const videoRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const BACKEND_VERIFY = "http://localhost:5000/api/verify-face";

  // Load models
  useEffect(() => {
    (async () => {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector/"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68/"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models/face_recognition/"
        );

        setStatus("Models loaded ✔");
        startCamera();
      } catch (err) {
        console.error("Model load error:", err);
        setStatus("❌ Failed to load face models");
      }
    })();
  }, []);

  // Start camera
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Look into the camera to login");
    } catch (err) {
      console.error(err);
      setStatus("Camera access blocked");
    }
  }

  // Login with face
  async function loginWithFace() {
    setStatus("Detecting face...");

    const detection = await faceapi
      .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      setStatus("❌ No face detected. Try again.");
      return;
    }

    const embedding = Array.from(detection.descriptor);

    // Send ONLY embedding
    const res = await fetch(BACKEND_VERIFY, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embedding }),
    });

    const data = await res.json();

    if (data.success) {
      setStatus("Face match! Logging in...");

      // Save identified user
      localStorage.setItem("USER_ID", data.userId);
      localStorage.setItem("TOKEN", data.token);

      setTimeout(() => {
        window.location.href = "/create-wallet";
      }, 500);
    } else {
      setStatus("❌ Face mismatch");
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 30 }}>
      <h2 style={{ marginBottom: 10 }}>Face Login</h2>

      <video
        ref={videoRef}
        width={350}
        height={260}
        autoPlay
        muted
        style={{ borderRadius: 10, border: "2px solid #333" }}
      />

      <button
        onClick={loginWithFace}
        style={{
          marginTop: 20,
          padding: "10px 18px",
          fontSize: 16,
          background: "#0078ff",
          color: "white",
          borderRadius: 8,
        }}
      >
        Login with Face
      </button>

      <p style={{ marginTop: 12 }}>{status}</p>
    </div>
  );
}
