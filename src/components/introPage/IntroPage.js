import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import micIcon from './mic-icon.png'; // Adjust the path if necessary
import './IntroPage.css';

const IntroPage = () => {
  const navigate = useNavigate();

  // Create a Speech Recognition instance
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  const startTuning = () => {
    navigate('/tuning');
  };

  const startListening = () => {
    recognition.start();
  };

  useEffect(() => {
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      console.log(transcript);
      if (transcript === 'start tuning') {
        startTuning();
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
    };

    return () => {
      recognition.stop();
    };
  }, [recognition]);

  return (
    <div className="intro-container">
      <h1 className="intro-title">Pitch Perfect</h1>

      <img 
        src={micIcon} 
        alt="Start Tuning" 
        onClick={startListening}
        className="intro-image"
      />
      
      <button className="intro-button" onClick={startTuning}>Start Tuning</button>
      <h2 className="intro-instructions">Press the mic icon and say "Start Tuning".</h2>
    </div>
  );
};

export default IntroPage;
