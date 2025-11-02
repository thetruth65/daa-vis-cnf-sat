// src/pages/ProjectOfPage.tsx

import React from 'react';
import { Container, Paper, Typography, Box, Avatar, Divider } from '@mui/material';

const ProjectOfPage: React.FC = () => {
  return (
    <Container maxWidth="sm" sx={{ my: 4 }}>
      <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ width: 80, height: 80, mb: 2, bgcolor: 'primary.main', fontSize: '2.5rem' }}>
            MS
          </Avatar>
          <Typography variant="h4" component="h1" gutterBottom>
            Mohit Sharma
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Roll No: 2024UCD2168
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />

        <Box>
          <Typography variant="h6" gutterBottom><strong>Course:</strong> Design And Analysis of Algorithms (DAA)</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            This project serves as a practical implementation and educational tool for the concepts studied in the course.
          </Typography>
          
          <Typography variant="h6" gutterBottom><strong>Branch:</strong></Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Computer Science and Engineering (Specialisation in Data Science)
          </Typography>

          <Typography variant="h6" gutterBottom><strong>Institution:</strong></Typography>
          <Typography variant="body1" color="text.secondary">
            Netaji Subhas University of Technology (NSUT)
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProjectOfPage;