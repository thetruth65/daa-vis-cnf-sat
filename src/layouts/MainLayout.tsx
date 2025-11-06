// src/layouts/MainLayout.tsx

import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar.tsx';
// --- FOOTER IMPORT REMOVED ---

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    // The minHeight is adjusted to ensure the background color covers the full viewport
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* The Navbar remains inside a container to keep it padded and "floating" */}
      <Container maxWidth="xl" sx={{ my: 2 }}>
        <Navbar />
      </Container>
      
      <Box component="main" sx={{ flexGrow: 1, mb: 4 /* Added bottom margin for spacing */ }}>
        {children}
      </Box>

      {/* --- The Footer component has been completely removed from the layout --- */}
    </Box>
  );
};

export default MainLayout;