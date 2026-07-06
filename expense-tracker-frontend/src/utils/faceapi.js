import * as faceapi from 'face-api.js';

let modelsLoaded = false;

// Models ek hi baar load karta hai (app me jahan bhi pehli baar face feature use ho)
export async function loadFaceModels() {
  if (modelsLoaded) return;
  const MODEL_URL = '/models';
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

// Video element se live face descriptor aur confidence score nikalta hai
// Face na mile to null return karta hai
export async function getFaceDescriptor(videoElement) {
  const detection = await faceapi
    .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) return null;

  return {
    descriptor: Array.from(detection.descriptor), // Float32Array -> plain array
    confidence: Math.round(detection.detection.score * 100), // 0-100 percentage
  };
}
