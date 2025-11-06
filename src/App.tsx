// src/App.tsx

import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import theme from './theme.ts';
import HomePage from './pages/HomePage.tsx';
import VisualizePage from './pages/VisualizePage.tsx';
//import AboutPage from './pages/AboutPage.tsx';
import PseudoCodePage from './pages/PseudoCodePage.tsx';
import ProjectOfPage from './pages/ProjectOfPage.tsx'; // Import the new page
import MainLayout from './layouts/MainLayout.tsx';
import './styles/App.css';
import ComparisonPage from './pages/ComparisonPage'; // <-- IMPORT THE NEW PAGE

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/visualizer" element={<VisualizePage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          <Route path="/compare" element={<ComparisonPage />} /> {/* <-- ADD THE NEW ROUTE */}
          <Route path="/pseudo-code" element={<PseudoCodePage />} />
          <Route path="/project-of" element={<ProjectOfPage />} /> {/* Add the new route */}
        </Routes>
      </MainLayout>
    </ThemeProvider>
  );
};

export default App;