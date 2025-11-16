// src/components/TruthTableVisualizer.tsx

import React, { useMemo } from 'react';
import {
  Paper, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Box, useTheme, Chip,
} from '@mui/material';
import type { CNFFormula, VariableAssignment } from '../types';

type HistoryRow = {
  assignment: VariableAssignment;
  // --- UPDATED: Now stores an array of clause results ---
  clauseResults: (boolean | null)[]; 
  isSatisfied: boolean | null;
}

interface TruthTableVisualizerProps {
  formula: CNFFormula;
  currentAssignment: VariableAssignment;
  currentClauseResults: (boolean | null)[];
  animationStep: { clauseIndex: number; phase: string };
  history: HistoryRow[];
  isCurrentSatisfied: boolean | null;
}

const TruthTableVisualizer: React.FC<TruthTableVisualizerProps> = ({
  formula, currentAssignment, currentClauseResults, animationStep, history, isCurrentSatisfied
}) => {
  const theme = useTheme();

  const uniqueVariables = useMemo(() =>
    [...new Set(formula.flatMap(clause => clause.map(lit => lit.variable)))].sort(),
  [formula]);

  const getCellStyle = (value: boolean | null, isHighlighted: boolean) => {
    let backgroundColor = 'transparent';
    let color = theme.palette.text.primary;
    let fontWeight = 'normal';

    if (value === true) {
      backgroundColor = theme.palette.success.dark;
      fontWeight = 'bold';
    } else if (value === false) {
      backgroundColor = theme.palette.error.dark;
      fontWeight = 'bold';
    }

    return {
      textAlign: 'center',
      fontWeight,
      color,
      backgroundColor,
      border: isHighlighted ? `2px solid ${theme.palette.primary.light}` : `2px solid ${theme.palette.divider}`,
      transition: 'all 0.3s ease-in-out',
      minWidth: '60px',
    };
  };
  
  const getSatisfiedCellStyle = (value: boolean | null) => {
    let backgroundColor = 'transparent';
    if (value === true) backgroundColor = theme.palette.success.dark;
    if (value === false) backgroundColor = theme.palette.error.dark;
    return { backgroundColor, textAlign: 'center' };
  };

  return (
    <Box>
      <TableContainer component={Paper} elevation={4} sx={{ maxHeight: 300 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {uniqueVariables.map(v => (
                <TableCell key={v} sx={{ fontWeight: 'bold', textAlign: 'center' }}>{v}</TableCell>
              ))}
              {formula.map((_, i) => (
                <TableCell key={`c${i}`} sx={{ fontWeight: 'bold', textAlign: 'center' }}>C{i + 1}</TableCell>
              ))}
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', minWidth: '100px' }}>Satisfied?</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {history.map((row, rowIndex) => (
              <TableRow key={rowIndex} sx={{ opacity: 0.6 }}>
                {uniqueVariables.map(v => (
                  <TableCell key={v} sx={getCellStyle(row.assignment[v], false)}>
                    {row.assignment[v] ? 'T' : 'F'}
                  </TableCell>
                ))}
                {/* --- UPDATED: Render the historical clause results --- */}
                {row.clauseResults.map((result, i) => (
                    <TableCell key={`hist-c-${i}`} sx={getCellStyle(result, false)}>
                        {result === true ? 'T' : result === false ? 'F' : '-'}
                    </TableCell>
                ))}
                <TableCell sx={getSatisfiedCellStyle(row.isSatisfied)}>
                    <Chip size="small" label={row.isSatisfied ? 'SAT' : 'UNSAT'} color={row.isSatisfied ? 'success' : 'error'}/>
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              {uniqueVariables.map(v => (
                <TableCell key={v} sx={getCellStyle(currentAssignment[v], false)}>
                  {currentAssignment[v] === true ? 'T' : currentAssignment[v] === false ? 'F' : '-'}
                </TableCell>
              ))}
              {currentClauseResults.map((result, i) => (
                <TableCell key={`c${i}`} sx={getCellStyle(result, animationStep.clauseIndex === i)}>
                  {result === true ? 'T' : result === false ? 'F' : '?'}
                </TableCell>
              ))}
              <TableCell sx={getSatisfiedCellStyle(isCurrentSatisfied)}>
                {isCurrentSatisfied !== null && <Chip size="small" label={isCurrentSatisfied ? 'SAT' : 'UNSAT'} color={isCurrentSatisfied ? 'success' : 'error'}/>}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default TruthTableVisualizer;