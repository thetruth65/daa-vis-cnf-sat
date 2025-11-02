// src/components/CNFInput.tsx

import React, { useState, useEffect } from 'react';
import { Button, IconButton, Box, Typography, Paper, Select, MenuItem, FormControl, InputLabel, Tooltip } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import type { CNFFormula, Clause, Literal } from '../types';

interface CNFInputProps {
  setFormula: (formula: CNFFormula) => void;
  availableVariables: string[];
}

const CNFInput: React.FC<CNFInputProps> = ({ setFormula, availableVariables }) => {
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
    <Paper elevation={3} sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Create your CNF Formula
      </Typography>
      {clauses.map((clause, clauseIndex) => (
        <Box key={clauseIndex} sx={{ display: 'flex', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ mr: 1, whiteSpace: 'nowrap' }}>( </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
            {clause.map((literal, literalIndex) => (
              <Box key={literalIndex} sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                <Tooltip title="Toggle Negation (¬)">
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleLiteralChange(clauseIndex, literalIndex, 'negated', !literal.negated)}
                    // --- UPDATED STYLING FOR NEGATION BUTTON ---
                    sx={{
                      mr: 1, minWidth: '40px', fontFamily: 'monospace', fontSize: '1.2rem',
                      borderColor: 'rgba(255, 255, 255, 0.23)', // Lighter border
                      color: 'text.secondary'
                    }}
                  >
                    {literal.negated ? '¬' : <>&nbsp;</>}
                  </Button>
                </Tooltip>
                <FormControl size="small" sx={{ minWidth: 80 }}>
                  <InputLabel>Var</InputLabel>
                  <Select value={literal.variable} label="Var" onChange={(e) => handleLiteralChange(clauseIndex, literalIndex, 'variable', e.target.value)}>
                    {availableVariables.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                  </Select>
                </FormControl>
                <IconButton onClick={() => handleRemoveLiteral(clauseIndex, literalIndex)} size="small"><RemoveCircleOutlineIcon /></IconButton>
                {literalIndex < clause.length - 1 && <Typography sx={{ mx: 1 }}>∨</Typography>}
              </Box>
            ))}
          </Box>
          <IconButton onClick={() => handleAddLiteral(clauseIndex)} color="primary"><AddCircleOutlineIcon /></IconButton>
          <Typography variant="h6" sx={{ ml: 1, whiteSpace: 'nowrap' }}> )</Typography>
          {clauseIndex < clauses.length - 1 && <Typography variant="h6" sx={{ mx: 1 }}>∧</Typography>}
          <IconButton onClick={() => handleRemoveClause(clauseIndex)} color="secondary"><RemoveCircleOutlineIcon /></IconButton>
        </Box>
      ))}
      {/* --- UPDATED STYLING FOR ADD CLAUSE BUTTON --- */}
      <Button onClick={handleAddClause} variant="outlined" color="secondary" sx={{ mr: 2, mt: 2 }}>
        Add Clause
      </Button>
      <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2 }}>Set Formula</Button>
    </Paper>
  );
};

export default CNFInput;