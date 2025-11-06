// src/components/PseudoCodeVisualizer.tsx

import React from 'react';
import { Paper, Typography } from '@mui/material';

interface PseudoCodeVisualizerProps {
  highlightedLine: number;
  algorithmType: 'short-circuit' | 'brute-force';
}

// --- UPDATED: Added comments and consistent return values ---
const shortCircuitCode = [
  /* 1*/ 'function solve_SC(formula, assignments) {',
  /* 2*/ '  for each clause in formula {        // Loop through (C1 AND C2 AND ...)',
  /* 3*/ '    clauseIsTrue = false;',
  /* 4*/ '    for each literal in clause {      // Loop through (L1 OR L2 OR ...)',
  /* 5*/ '      result = evaluateLiteral(literal);',
  /* 6*/ '      if (result === true) {            // Found one TRUE literal',
  /* 7*/ '        clauseIsTrue = true;',
  /* 8*/ '        break;                        // EXIT clause loop early',
  /* 9*/ '      }',
  /*10*/ '    }',
  /*11*/ '    if (clauseIsTrue === false) {     // If one clause is FALSE...',
  /*12*/ '      return "UNSATISFIABLE";       // ...the whole formula is FALSE',
  /*13*/ '    }',
  /*14*/ '  }',
  /*15*/ '  return "SATISFIABLE";           // All clauses were TRUE',
  /*16*/ '}',
];

const bruteForceCode = [
  /* 1*/ 'function solve_BF(formula, assignments) {',
  /* 2*/ '  formulaResult = true;',
  /* 3*/ '  for each clause in formula {        // Loop through (C1 AND C2 AND ...)',
  /* 4*/ '    clauseIsTrue = false;',
  /* 5*/ '    for each literal in clause {      // Loop through (L1 OR L2 OR ...)',
  /* 6*/ '      result = evaluateLiteral(literal);',
  /* 7*/ '      clauseIsTrue = clauseIsTrue || result; // ALWAYS check every literal',
  /* 8*/ '    }',
  /* 9*/ '    formulaResult = formulaResult && clauseIsTrue; // ALWAYS check every clause',
  /*10*/ '  }',
  /*11*/ '  if (formulaResult === true) {',
  /*12*/ '    return "SATISFIABLE";',
  /*13*/ '  } else {',
  /*14*/ '    return "UNSATISFIABLE";',
  /*15*/ '  }',
  /*16*/ '}',
];


const PseudoCodeVisualizer: React.FC<PseudoCodeVisualizerProps> = ({ highlightedLine, algorithmType }) => {
  const codeLines = algorithmType === 'short-circuit' ? shortCircuitCode : bruteForceCode;

  const codeStyle = {
    backgroundColor: '#2d2d2d',
    color: '#f8f8f2',
    padding: '16px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '0.9rem',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.7',
  };

  const lineStyle = {
    display: 'block',
    padding: '0 8px',
    borderRadius: '4px',
    transition: 'background-color 0.3s ease-in-out',
  };

  const highlightedStyle = {
    ...lineStyle,
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
  };

  return (
    <Paper elevation={2} sx={codeStyle}>
      {codeLines.map((line, index) => (
        <Typography 
          key={index} 
          component="span" 
          sx={highlightedLine === (index + 1) ? highlightedStyle : lineStyle}
        >
          {line}
        </Typography>
      ))}
    </Paper>
  );
};

export default PseudoCodeVisualizer;