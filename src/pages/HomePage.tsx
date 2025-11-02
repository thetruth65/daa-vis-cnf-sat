// src/pages/HomePage.tsx

import React from 'react';
import { Container, Box, Typography, Card, CardContent, Button, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Link } from 'react-router-dom';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsightsIcon from '@mui/icons-material/Insights';

const HomePage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          CNF-SAT Educational Visualizer
        </Typography>
        <Typography variant="h5" color="text.secondary">
          An interactive tool designed to help you understand the Boolean Satisfiability Problem.
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2, alignItems: 'stretch' }}>
        <Box sx={{ width: { xs: '100%', md: '50%' }, p: 2 }}>
          <Card sx={{ height: '100%', borderTop: 3, borderColor: 'primary.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="div" gutterBottom>
                How to Use the Visualizer
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Step 1: Declare the number of variables (e.g., x1, x2...)." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Step 2: Build your CNF formula using the interactive form." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Step 3: Assign a True/False value to each variable." /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Step 4: Use the animation controls to see the evaluation step-by-step!" /></ListItem>
              </List>
              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button
                  component={Link}
                  to="/visualizer"
                  variant="contained"
                  size="large"
                  endIcon={<InsightsIcon />}
                >
                  Start Visualizing
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ width: { xs: '100%', md: '50%' }, p: 2 }}>
          <Card sx={{ height: '100%', borderTop: 3, borderColor: 'primary.main' }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h5" component="div" gutterBottom>
                Key Features
              </Typography>
              <List dense>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Interactive Formula Builder" /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Detailed, Step-by-Step Animation" /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Full Animation Control (Play, Pause, Step Forward/Backward)" /></ListItem>
                {/* --- NEW AND UPDATED FEATURES --- */}
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Accurate Visualization of Algorithmic Optimizations (Early-Exit Logic)" /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Detailed Pseudo-code that Mirrors the Visualization" /></ListItem>
                <ListItem><ListItemIcon><CheckCircleOutlineIcon color="primary" /></ListItemIcon><ListItemText primary="Clear, Responsive UI for All Devices" /></ListItem>
              </List>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
};

export default HomePage;