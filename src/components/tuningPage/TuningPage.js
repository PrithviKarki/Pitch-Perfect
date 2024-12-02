import React, { useState, useEffect } from 'react';
import './TuningPage.css'; // Import CSS file for styling

function autoCorrelate(buf, sampleRate) {
  let SIZE = buf.length;
  let rms = 0;

  for (let i = 0; i < SIZE; i++) {
    rms += buf[i] * buf[i];
  }

  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1; // Not enough signal

  let r1 = 0, r2 = SIZE - 1, threshold = 0.2;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) < threshold) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) < threshold) {
      r2 = SIZE - i;
      break;
    }
  }

  buf = buf.slice(r1, r2);
  SIZE = buf.length;

  const c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE - i; j++) {
      c[i] += buf[j] * buf[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  let T0 = maxpos;
  const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) T0 = T0 - b / (2 * a);

  return sampleRate / T0;
}

const TuningPage = () => {
  const [frequency, setFrequency] = useState(null);
  const [tuningStatus, setTuningStatus] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [currentString, setCurrentString] = useState("E");

  const LOW_E_FREQUENCY = 82;
  const TOLERANCE = 5;

  let audioCtx, analyserNode, buffer, mediaStream;
  let intervalId;

  const setupAudioContext = async () => {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 2048;
    buffer = new Float32Array(analyserNode.fftSize);

    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaSource = audioCtx.createMediaStreamSource(mediaStream);
    mediaSource.connect(analyserNode);
  };

  const getSoundData = () => {
    analyserNode.getFloatTimeDomainData(buffer);
    const frequencyDetected = autoCorrelate(buffer, audioCtx.sampleRate);
    if (frequencyDetected > 0) {
      setFrequency(frequencyDetected.toFixed(2));

      let status = "";
      let speech = "";

      if (frequencyDetected < LOW_E_FREQUENCY - TOLERANCE) {
        status = "Under Tune";
        speech = "Low";
      } else if (frequencyDetected > LOW_E_FREQUENCY + TOLERANCE) {
        status = "Over Tune";
        speech = "High";
      } else {
        status = "In Tune";
        speech = "Tune";
      }

      setTuningStatus(status);
      speak(speech);
    }
  };

  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = async () => {
    setIsListening(true);
    await setupAudioContext();
    intervalId = setInterval(getSoundData, 500);
  };

  const stopListening = () => {
    setIsListening(false);
    clearInterval(intervalId);
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
    }
    if (audioCtx) {
      audioCtx.close();
    }
    setFrequency(null);
    setTuningStatus("");
  };

  const handleStringChange = (string) => {
    setCurrentString(string);
  };

  useEffect(() => {
    if (isListening) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [isListening]);

  return (
    <div className="tuning-container">
      <h1 className="title">Standard Tuning</h1>
      <div className="current-string">{currentString}</div>
      <div className="button-container">
        <button
          className="start-stop-btn"
          onClick={() => setIsListening((prev) => !prev)}
        >
          {isListening ? 'Listening' : 'Start Listening'}
        </button>
      </div>
      <div className="status-container">
        {isListening ? (
          <p className="status">Detected Frequency: {frequency} Hz</p>
        ) : (
          <p className="status">Click to Start</p>
        )}
        {tuningStatus && <p className="status">Status: {tuningStatus}</p>}
      </div>
      <div className="strings-buttons">
        <button className="string-btn" onClick={() => handleStringChange("E")}>E</button>
        <button className="string-btn" onClick={() => handleStringChange("A")}>A</button>
        <button className="string-btn" onClick={() => handleStringChange("D")}>D</button>
        <button className="string-btn" onClick={() => handleStringChange("G")}>G</button>
        <button className="string-btn" onClick={() => handleStringChange("B")}>B</button>
        <button className="string-btn" onClick={() => handleStringChange("e")}>e</button>
      </div>
    </div>
  );
};

export default TuningPage;
