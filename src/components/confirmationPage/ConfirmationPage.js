import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import checkIcon from './check-icon.png'; // Adjust the path if necessary
import './ConfirmationPage.css';

const ConfirmationPage = () => {
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
      if (transcript === 'retune') {
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
        src={checkIcon} 
        alt="Start Tuning" 
        onClick={startListening}
        className="intro-image"
      />
      
      <button className="intro-button" onClick={startTuning}>Retune</button>
      <h2 className="intro-instructions">Press the check icon and say "Retune".</h2>
    </div>
  );
};

export default ConfirmationPage;
