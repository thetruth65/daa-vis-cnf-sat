// src/pages/ShortCircuitLogicPage.tsx

import React from 'react';
import { Container, Paper, Typography, Box, Divider, Chip } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DangerousOutlinedIcon from '@mui/icons-material/DangerousOutlined';

const ShortCircuitLogicPage: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 } }}>
        <Typography variant="h4" gutterBottom align="center">
          The Logic of Short-Circuiting
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 4 }}>
          Short-circuiting is a powerful optimization based on the fundamental properties of Boolean logic (AND/OR). The visualizer uses two levels of this optimization.
        </Typography>

        <Divider sx={{ mb: 4 }}><Chip label="Optimization 1: Clause Evaluation (OR)" /></Divider>
        
        <Typography variant="h5" gutterBottom>The OR Property</Typography>
        <Typography paragraph>
          A clause is a series of literals joined by the **OR (∨)** operator. For a clause like `(L1 ∨ L2 ∨ L3)` to be TRUE, we only need **at least one** of its literals to be TRUE.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1, mb: 2 }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40 }}/>
            <Typography variant="body1">
                <strong>The Optimization:</strong> If we evaluate `L1` and find it is **TRUE**, we can immediately stop. We don't need to check `L2` or `L3`. The entire clause is guaranteed to be TRUE.
            </Typography>
        </Box>

        <Divider sx={{ my: 4 }}><Chip label="Optimization 2: Formula Evaluation (AND)" /></Divider>

        <Typography variant="h5" gutterBottom>The AND Property</Typography>
        <Typography paragraph>
          A CNF formula is a series of clauses joined by the **AND (∧)** operator. For a formula like `(C1 ∧ C2 ∧ C3)` to be TRUE, **every single one** of its clauses must be TRUE.
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <DangerousOutlinedIcon color="error" sx={{ fontSize: 40 }}/>
            <Typography variant="body1">
                <strong>The Optimization:</strong> If we evaluate `C1` and find it is **FALSE**, we can immediately stop. We don't need to check `C2` or `C3`. The entire formula is guaranteed to be FALSE (UNSATISFIABLE).
            </Typography>
        </Box>

      </Paper>
    </Container>
  );
};

export default ShortCircuitLogicPage;