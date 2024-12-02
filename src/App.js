import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import IntroPage from './components/introPage//IntroPage';
import TuningPage from './components/tuningPage/TuningPage';
import ConfirmationPage from './components/confirmationPage/ConfirmationPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IntroPage />} />
        <Route path="/tuning" element={<TuningPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
      </Routes>
    </Router>
  );
}

export default App;
