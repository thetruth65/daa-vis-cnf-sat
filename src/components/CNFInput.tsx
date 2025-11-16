// src/components/CNFInput.tsx

import React, { useState, useEffect } from 'react';
import {
  Button, IconButton, Box, Typography, Select, MenuItem, FormControl,
  InputLabel, Tooltip, Alert, Divider
} from '@mui/material';
// --- FIXED: Added 'type' keyword for the event import ---
import type { SelectChangeEvent } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { CNFFormula, Clause, Literal } from '../types';

interface CNFInputProps {
  setFormula: (formula: CNFFormula) => void;
  availableVariables: string[];
  numVariables: number;
  setNumVariables: (value: number) => void;
}

const CNFInput: React.FC<CNFInputProps> = ({ setFormula, availableVariables, numVariables, setNumVariables }) => {
  const defaultVariable = availableVariables[0] || 'x1';
  const [clauses, setClauses] = useState<Clause[]>([[{ variable: defaultVariable, negated: false }]]);

  useEffect(() => {
    const newDefault = availableVariables[0] || 'x1';
    setClauses([[{ variable: newDefault, negated: false }]]);
  }, [availableVariables]);

  const handleLiteralChange = (clauseIndex: number, literalIndex: number, field: keyof Literal, value: any) => {
    const newClauses = [...clauses];
    const newLiteral = { ...newClauses[clauseIndex][literalIndex], [field]: value };
    newClauses[clauseIndex][literalIndex] = newLiteral;
    setClauses(newClauses);
  };
  
  const handleAddClause = () => { setClauses([...clauses, [{ variable: defaultVariable, negated: false }]]); };
  const handleRemoveClause = (clauseIndex: number) => { if (clauses.length > 1) { const newClauses = clauses.filter((_, i) => i !== clauseIndex); setClauses(newClauses); } };
  const handleAddLiteral = (clauseIndex: number) => { const newClauses = [...clauses]; newClauses[clauseIndex].push({ variable: defaultVariable, negated: false }); setClauses(newClauses); };
  const handleRemoveLiteral = (clauseIndex: number, literalIndex: number) => { const newClauses = [...clauses]; if (newClauses[clauseIndex].length > 1) { newClauses[clauseIndex] = newClauses[clauseIndex].filter((_, i) => i !== literalIndex); setClauses(newClauses); } };
  const handleSubmit = () => { setFormula(clauses); };

  return (
    <>
      <Typography variant="h5" gutterBottom>Step 1: Declare Variables</Typography>
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Number of Variables</InputLabel>
        <Select 
          value={String(numVariables)} 
          label="Number of Variables" 
          onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}
        >
          {[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}
        </Select>
      </FormControl>
      
      <Divider sx={{ mb: 3 }} />

      <Typography variant="h5" gutterBottom>Step 2: Create Formula</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        A formula is a series of **Clauses (C)** joined by ANDs (∧). Each clause is a series of **Literals (x)** joined by ORs (∨).
      </Alert>
      {clauses.map((clause, clauseIndex) => (
        <Box key={clauseIndex} sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 1, whiteSpace: 'nowrap' }}>( </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            {clause.map((literal, literalIndex) => (
              <Box key={literalIndex} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                <Tooltip title="Toggle Negation (¬)">
                  <Button variant="outlined" size="small" onClick={() => handleLiteralChange(clauseIndex, literalIndex, 'negated', !literal.negated)} sx={{ mr: 1, minWidth: '40px', fontFamily: 'monospace', fontSize: '1.2rem', borderColor: 'rgba(255, 255, 255, 0.23)', color: 'text.secondary' }}>
                    {literal.negated ? '¬' : <>&nbsp;</>}
                  </Button>
                </Tooltip>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Var</InputLabel>
                  <Select value={literal.variable} label="Var" onChange={(e) => handleLiteralChange(clauseIndex, literalIndex, 'variable', e.target.value)}>
                    {availableVariables.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
                <Tooltip title="Remove Literal">
                  <IconButton onClick={() => handleRemoveLiteral(clauseIndex, literalIndex)} size="small"><RemoveCircleOutlineIcon /></IconButton>
                </Tooltip>
                {literalIndex < clause.length - 1 && <Typography sx={{ mx: 1 }}>∨</Typography>}
              </Box>
            ))}
          </Box>
          <Tooltip title="Add Literal to Clause">
            <IconButton onClick={() => handleAddLiteral(clauseIndex)} color="primary"><AddCircleOutlineIcon /></IconButton>
          </Tooltip>
          <Typography variant="h6" sx={{ ml: 1, whiteSpace: 'nowrap' }}> )</Typography>
          {clauseIndex < clauses.length - 1 && <Typography variant="h6" sx={{ mx: 1 }}>∧</Typography>}
          <Tooltip title="Remove Clause">
            <IconButton onClick={() => handleRemoveClause(clauseIndex)} color="secondary"><RemoveCircleOutlineIcon /></IconButton>
          </Tooltip>
        </Box>
      ))}
      <Tooltip title="Add a new Clause to the formula">
        <Button onClick={handleAddClause} variant="outlined" color="secondary" sx={{ mr: 2, mt: 2 }}>
          Add Clause
        </Button>
      </Tooltip>
      <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>Set Formula & Visualize</Button>
    </>
  );
};

export default CNFInput;