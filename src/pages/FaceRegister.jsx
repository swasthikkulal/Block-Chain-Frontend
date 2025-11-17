import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceRegister() {
  const userId = localStorage.getItem("USER_ID");

  const videoRef = useRef(null);
  const [status, setStatus] = useState("Loading models...");
  const BACKEND_SAVE_FACE = "http://localhost:5000/api/save-face"; // use full URL

  useEffect(() => {
    (async () => {
      try {
        // IMPORTANT: point to the exact subfolders inside public/models
        // Example folder structure (public/models):
        // ├─ tiny_face_detector/
        // ├─ face_landmark_68/
        // ├─ face_recognition/
        // └─ face_expression/
        await faceapi.nets.tinyFaceDetector.loadFromUri(
          "/models/tiny_face_detector"
        );
        await faceapi.nets.faceLandmark68Net.loadFromUri(
          "/models/face_landmark_68"
        );
        await faceapi.nets.faceRecognitionNet.loadFromUri(
          "/models/face_recognition"
        );
        // optional: expressions if you have them
        await faceapi.nets.faceExpressionNet.loadFromUri(
          "/models/face_expression"
        );

        console.log("✅ face models loaded");
        setStatus("Models loaded — starting camera...");

        // 🛑 wait for video element to mount
        setTimeout(() => {
          startCamera();
        }, 300);
      } catch (err) {
        console.error("❌ Failed to load model files!", err);
        setStatus("Failed to load face models (check console).");
      }
    })();
    // cleanup on unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
      }
    };
  }, []);

  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      setStatus("Look at the camera and press Capture");
      console.log("🎥 Camera started");
    } catch (err) {
      console.error("Camera error:", err);
      setStatus("Camera access denied or not available.");
    }
  }

  async function captureFace() {
    try {
      setStatus("Detecting face...");
      // good options for speed/accuracy
      const options = new faceapi.TinyFaceDetectorOptions({
        inputSize: 320,
        scoreThreshold: 0.4,
      });

      const detection = await faceapi
        .detectSingleFace(videoRef.current, options)
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatus("No face detected. Move closer and try again.");
        return;
      }

      const embedding = Array.from(detection.descriptor); // Float32Array -> plain array
      setStatus("Face captured — uploading...");

      console.log("UserID from localStorage:", localStorage.getItem("USER_ID"));
console.log("Sending to backend:", { userId, embedding });

      // send to backend (full URL)
      const res = await fetch(BACKEND_SAVE_FACE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, embedding }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("save-face response error:", res.status, text);
        setStatus("Server error while saving face. Check console.");
        return;
      }

      const data = await res.json();
      console.log("save-face response:", data);
      setStatus("Face registered successfully ✅");
      alert("Face registered successfully!");
      // redirect or next step
      window.location.href = "/login";
    } catch (err) {
      console.error("captureFace error:", err);
      setStatus("Error detecting face. Check console for details.");
    }
  }

  return (
    <div style={{ textAlign: "center", padding: 24 }} className="flex flex-col items-center justify-between ">
      <h2 className="pt-[10%] pb-[5%] text-2xl font-bold">Face Registration</h2>
      <video
        ref={videoRef}
        width={360}
        height={280}
        autoPlay
        muted
        style={{ borderRadius: 8, border: "1px solid #444" }}
      />
      <div style={{ marginTop: 30 }}>
        <button
          onClick={captureFace}
          className="p-2 shadow bg-green-500 rounded-md text-white"
          style={{ padding: "8px 16px", marginRight: 8 }}
        >
          Capture Face
        </button>
        <button onClick={startCamera} className="p-2 shadow bg-red-500 rounded-md text-white" style={{ padding: "8px 16px" }}>
          Restart Camera
        </button>
      </div>
      <p style={{ marginTop: 12 }}>{status}</p>
    </div>
  );
}
