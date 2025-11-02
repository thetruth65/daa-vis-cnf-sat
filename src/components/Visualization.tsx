// src/components/Visualization.tsx

import React from 'react';
import { Box, Typography, Paper, Grow, useTheme, Alert } from '@mui/material';
import type { CNFFormula, VariableAssignment } from '../types';

interface VisualizationProps {
  formula: CNFFormula;
  assignment: VariableAssignment;
  literalResults: (boolean | null)[][];
  clauseResults: (boolean | null)[];
  animationStep: { clauseIndex: number; literalIndex: number; phase: string };
  animationMessage: string;
}

const Visualization: React.FC<VisualizationProps> = ({ formula, literalResults, clauseResults, animationStep, animationMessage }) => {
  const theme = useTheme();

  const getLiteralStyle = (literalValue: boolean | null, clauseValue: boolean | null, isHighlighted: boolean) => {
    // --- DYNAMIC COLOR LOGIC ---
    let color = theme.palette.text.primary; // Default to white for dark backgrounds
    if (clauseValue === null) { // If the clause BG is white
      if (literalValue === true) color = theme.palette.custom.trueTextDark;
      if (literalValue === false) color = theme.palette.custom.falseTextDark;
      if (literalValue === null) color = '#000'; // Default un-evaluated text is black
    } else { // If the clause BG is colored
      if (literalValue === true) color = theme.palette.custom.trueTextLight;
      if (literalValue === false) color = theme.palette.custom.falseTextLight;
    }

    return {
      color: color,
      fontWeight: literalValue !== null ? 'bold' : 'normal',
      outline: isHighlighted ? `2px solid ${theme.palette.primary.light}` : '2px solid transparent',
      borderRadius: 1, padding: '2px 6px', transition: 'all 0.3s ease',
    };
  };

  const getClauseStyle = (value: boolean | null, isHighlighted: boolean) => {
    if (value === null) {
      return {
        backgroundColor: '#ffffff', color: '#000000',
        border: isHighlighted ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
        transition: 'all 0.5s ease-in-out', p: 2, m: 1, display: 'flex', alignItems: 'center', gap: 1,
      };
    }
    return {
      backgroundColor: value === true ? theme.palette.custom.trueBg : theme.palette.custom.falseBg,
      color: theme.palette.text.primary,
      border: isHighlighted ? `3px solid ${theme.palette.primary.main}` : '3px solid transparent',
      transition: 'all 0.5s ease-in-out', p: 2, m: 1, display: 'flex', alignItems: 'center', gap: 1,
    };
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mt: 2, overflow: 'hidden' }}>
      {animationMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>{animationMessage}</Alert>
      )}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', p: 2, background: theme.palette.background.default, borderRadius: 1 }}>
        {formula.map((clause, clauseIndex) => (
          <React.Fragment key={clauseIndex}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Grow in={true} timeout={500}>
                <Paper
                  elevation={4}
                  sx={getClauseStyle(clauseResults[clauseIndex], animationStep.phase === 'clause' && animationStep.clauseIndex === clauseIndex)}
                >
                  <Typography variant="h6" component="span" sx={{color: 'inherit'}}>( </Typography>
                  {clause.map((literal, literalIndex) => (
                    <Typography
                      component="span" key={literalIndex}
                      sx={getLiteralStyle(
                        literalResults[clauseIndex]?.[literalIndex],
                        clauseResults[clauseIndex], // Pass clause result to determine BG color
                        animationStep.phase === 'literal' && animationStep.clauseIndex === clauseIndex && animationStep.literalIndex === literalIndex
                      )}
                    >
                      {literal.negated && '¬'}
                      {literal.variable}
                      {literalIndex < clause.length - 1 && ' ∨ '}
                    </Typography>
                  ))}
                  <Typography variant="h6" component="span" sx={{color: 'inherit'}}> )</Typography>
                </Paper>
              </Grow>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                C{clauseIndex + 1}
              </Typography>
            </Box>

            {clauseIndex < formula.length - 1 && (
              <Typography variant="h5" sx={{ mx: 1, mt: 3, color: animationStep.phase === 'interClause' && animationStep.clauseIndex === clauseIndex ? 'primary.main' : 'inherit' }}>
                ∧
              </Typography>
            )}
          </React.Fragment>
        ))}
      </Box>
    </Paper>
  );
};

export default Visualization;