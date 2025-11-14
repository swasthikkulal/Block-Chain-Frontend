import React, { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function FaceAuth({ onSuccess }) {
  const videoRef = useRef();
  const [status, setStatus] = useState("Loading models...");
  const [borderColor, setBorderColor] = useState("border-gray-700");
  const [emotion, setemotion] = useState("");

  // 🔹 Load face-api models once
  useEffect(() => {
    async function loadModels() {
      const MODEL_URL = window.location.origin + "/models";
      console.log("Loading models from:", MODEL_URL);

      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(
            MODEL_URL + "/tiny_face_detector"
          ),
          faceapi.nets.faceExpressionNet.loadFromUri(
            MODEL_URL + "/face_expression"
          ),
        ]);

        console.log("✅ Models loaded successfully");
        setStatus("Models loaded ✅");
        startVideo();
      } catch (err) {
        console.error("❌ Error loading models:", err);
        setStatus("Error loading models");
      }
    }

    loadModels();
  }, []);

  // 🔹 Start webcam feed
  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          console.log("🎥 Video started!");
        };
      })
      .catch((err) => {
        console.error("Camera access error:", err);
        setStatus("Camera not accessible 🚫");
      });
  };

  // 🔹 Detect face + emotion continuously
  // inside FaceAuth.jsx — replace the previous detection useEffect with this
  useEffect(() => {
    let rafId = null;
    let lastRun = 0;
    const maxFps = 5; // 5 frames per second -> change to 4..8 as needed
    const minMsBetween = 1000 / maxFps;

    const options = new faceapi.TinyFaceDetectorOptions({
      inputSize: 320, // lower = faster, higher = more accurate
      scoreThreshold: 0.35,
    });

    async function tick(now) {
      try {
        // throttle
        if (now - lastRun >= minMsBetween) {
          lastRun = now;

          if (videoRef.current && videoRef.current.readyState === 4) {
            // single detection with expressions
            const detections = await faceapi
              .detectSingleFace(videoRef.current, options)
              .withFaceExpressions();

            if (detections) {
              const emotion = getDominantEmotion(detections.expressions);
              console.log(emotion, "emotion");
              setStatus(`Detected emotion: ${emotion}`);
              setemotion(emotion);
              setBorderColor("border-green-500");

              if (["happy", "neutral", "surprised"].includes(emotion)) {
                // success — stop the loop and notify parent
                setStatus("✅ Face verified successfully");
                // small delay so user sees message
                setTimeout(() => onSuccess(), 900);
                return; // stop requesting frames
              }
            } else {
              setStatus("No face detected 👀");
              setBorderColor("border-red-500");
            }
          }
        }
      } catch (err) {
        // Do not spam console; log minimal info for debugging
        console.error("Detection error (suppressed):", err.message || err);
      } finally {
        rafId = requestAnimationFrame(tick);
      }
    }

    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onSuccess]); // keep dependencies minimal

  // 🔹 Helper: Find dominant emotion
  const getDominantEmotion = (expressions) => {
    return Object.keys(expressions).reduce((a, b) =>
      expressions[a] > expressions[b] ? a : b
    );
  };

  // 🔹 UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-2xl font-bold mb-4">Face Authentication</h1>

      <div className={`relative border-4 ${borderColor} rounded-lg`}>
        <video
          ref={videoRef}
          autoPlay
          muted
          width="400"
          height="300"
          className="rounded-lg"
        />
      </div>

      <p className="mt-4 text-lg text-black">{status}</p>
      <p className="mt-4 text-lg text-black">{emotion}</p>
      <p className="text-sm text-gray-400 mt-2">(Try smiling or blinking 😄)</p>
    </div>
  );
}
