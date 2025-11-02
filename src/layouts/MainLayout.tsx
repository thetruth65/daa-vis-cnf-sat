// src/layouts/MainLayout.tsx

import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar.tsx';
import Footer from '../components/Footer.tsx';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* The Navbar remains inside a container to keep it padded and "floating" */}
      <Container maxWidth="xl" sx={{ my: 2 }}>
        <Navbar />
      </Container>
      
      <Box component="main" sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* The Footer is now outside the container, making it full-width */}
      <Footer />
    </Box>
  );
};

export default MainLayout;