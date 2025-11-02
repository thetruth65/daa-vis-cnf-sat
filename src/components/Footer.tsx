// src/components/Footer.tsx

import React from 'react';
import { Box, Container, IconButton, Link as MuiLink, Typography, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const Footer: React.FC = () => {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'primary.main',
        color: 'white',
        py: 2,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <MuiLink component={RouterLink} to="/" variant="body2" color="inherit" sx={{ mb: 1 }}>
              Home
            </MuiLink>
            <MuiLink component={RouterLink} to="/about" variant="body2" color="inherit" sx={{ mb: 1 }}>
              About
            </MuiLink>
            <MuiLink component={RouterLink} to="/pseudo-code" variant="body2" color="inherit">
              Pseudo Code
            </MuiLink>
          </Box>
          
          {/* --- ADDED "CONTACT US" SECTION --- */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="overline" sx={{ display: 'block', mb: 1 }}>
              Contact Me
            </Typography>
            <Box>
              <IconButton href="https://github.com/thetruth65" target="_blank" color="inherit">
                <GitHubIcon />
              </IconButton>
              <IconButton href="https://www.linkedin.com/in/mohit-sharma-701648310/" target="_blank" color="inherit">
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Box>
        </Box>
        
        {/* --- ADDED DIVIDER AND "PROJECT OF" LINK --- */}
        <Divider sx={{ my: 2, bgcolor: 'rgba(255, 255, 255, 0.2)' }} />
        <Box sx={{ textAlign: 'center' }}>
            <MuiLink component={RouterLink} to="/project-of" variant="caption" color="inherit" sx={{ textDecoration: 'none' }}>
                Project Of: Mohit Sharma
            </MuiLink>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;