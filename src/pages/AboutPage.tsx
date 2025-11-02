// src/pages/AboutPage.tsx

import React from 'react';
// --- We will not import Grid. We will use Box instead. ---
import { Typography, Container, Card, CardContent, Box } from '@mui/material';

const historyCards = [
    // ... (no changes to this array)
  {
    title: 'The Origin: Boolean Satisfiability (SAT)',
    content:
      'The SAT problem was the first problem proven to be NP-complete. This foundational result came from the Cook-Levin theorem in 1971, establishing the basis for the theory of computational complexity.',
  },
  {
    title: 'Davis-Putnam-Logemann-Loveland (DPLL)',
    content:
      'Developed in the 1960s, the DPLL algorithm was a major breakthrough. It is a complete, backtracking-based search algorithm that is still the foundation for most modern SAT solvers.',
  },
  {
    title: 'Conflict-Driven Clause Learning (CDCL)',
    content:
      'A massive leap forward in the 1990s. CDCL solvers learn from their mistakes. When they hit a dead end (a conflict), they analyze the cause and add a new clause to the formula to prevent that same mistake from happening again.',
  },
  {
    title: 'The Modern Era: Heuristics & Optimization',
    content:
      'Today, SAT solvers can solve problems with millions of variables. This is due to clever heuristics for choosing which variables to branch on, efficient data structures, and periodic restarts to avoid getting stuck in fruitless parts of the search space.',
  },
];

const AboutPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Typography variant="h3" gutterBottom align="center">
        The Story of SAT
      </Typography>

      {/* We use a Box with flexbox to create the container */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mx: -2 }}>
        {historyCards.map((card, index) => (
          // Each item is a Box that takes 50% width on medium screens, and 100% on small screens
          <Box key={index} sx={{ width: { xs: '100%', md: '50%' }, p: 2 }}>
            <Card sx={{ height: '100%', borderLeft: '5px solid', borderColor: 'primary.main' }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  {card.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {card.content}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
};

export default AboutPage;