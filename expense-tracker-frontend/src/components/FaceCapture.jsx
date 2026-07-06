import { useEffect, useRef, useState } from 'react';
import { loadFaceModels, getFaceDescriptor } from '../utils/faceapi';

// confidence ke hisaab se color decide karta hai
function getConfidenceColor(score) {
  if (score >= 80) return '#22c55e'; // green  — excellent
  if (score >= 60) return '#f59e0b'; // yellow — acceptable
  return '#ef4444';                  // red    — poor
}

function getConfidenceLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  return 'Poor — move closer to camera';
}

export default function FaceCapture({ onCapture, buttonLabel = 'Capture Face' }) {
  const videoRef = useRef(null);
  const [status, setStatus] = useState('loading'); // loading | ready | capturing | error
  const [errorMsg, setErrorMsg] = useState('');
  const [confidence, setConfidence] = useState(null); // 0-100 or null

  useEffect(() => {
    let stream;

    async function setup() {
      try {
        setStatus('loading');
        await loadFaceModels();
        stream = await navigator.mediaDevices.getUserMedia({ video: {} });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('ready');
      } catch (err) {
        console.error('Face capture setup failed', err);
        setErrorMsg(
          err.name === 'NotAllowedError'
            ? 'Camera permission denied. Browser settings me allow karo.'
            : 'Camera ya face models load nahi ho paaye.',
        );
        setStatus('error');
      }
    }

    setup();

    return () => {
      if (stream) stream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = async () => {
    setStatus('capturing');
    setConfidence(null);

    const result = await getFaceDescriptor(videoRef.current);

    if (!result) {
      setErrorMsg('Chehra detect nahi hua. Camera ke saamne seedha dekho aur dobara try karo.');
      setStatus('ready');
      return;
    }

    setErrorMsg('');
    setConfidence(result.confidence);
    setStatus('ready');
    onCapture(result.descriptor); // sirf descriptor parent ko bhejo
  };

  const confidenceColor = confidence !== null ? getConfidenceColor(confidence) : null;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Camera feed */}
      <div
        style={{
          width: 280, height: 210,
          margin: '0 auto 14px',
          borderRadius: 12,
          overflow: 'hidden',
          background: '#000',
          border: `1.5px solid ${confidenceColor || 'var(--border)'}`,
          transition: 'border-color 0.4s',
        }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
        />
      </div>

      {/* Confidence indicator — only shows after capture */}
      {confidence !== null && (
        <div style={{ margin: '0 auto 12px', width: 280 }}>
          {/* Bar background */}
          <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
            {/* Filled bar */}
            <div
              style={{
                width: `${confidence}%`,
                height: '100%',
                background: confidenceColor,
                borderRadius: 6,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
          {/* Label */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontSize: 12, color: confidenceColor, fontWeight: 600 }}>
              {getConfidenceLabel(confidence)}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {confidence}%
            </span>
          </div>
        </div>
      )}

      {status === 'loading' && <div className="sub-text">Camera aur face models load ho rahe hain...</div>}
      {errorMsg && <div className="error-text" style={{ margin: '0 0 12px' }}>{errorMsg}</div>}

      {(status === 'ready' || status === 'capturing') && (
        <button
          type="button"
          className="btn-primary"
          style={{ width: 'auto', padding: '10px 24px' }}
          onClick={handleCapture}
          disabled={status === 'capturing'}
        >
          {status === 'capturing' ? 'Detecting...' : buttonLabel}
        </button>
      )}
    </div>
  );
}
