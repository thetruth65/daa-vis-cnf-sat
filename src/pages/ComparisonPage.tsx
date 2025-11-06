// src/pages/ComparisonPage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import type { CNFFormula, VariableAssignment, Literal } from '../types';
import CNFInput from '../components/CNFInput.tsx';
import Visualization from '../components/Visualization.tsx';
import AnimationControls from '../components/AnimationControls.tsx';
import ComparisonResults from '../components/ComparisonResults.tsx';
// --- 'Grid' is no longer imported ---
import { Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Divider } from '@mui/material';

// --- (The types and helper functions from your code remain unchanged) ---
type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';
type AnimationFrame = {
  step: { clauseIndex: number; literalIndex: number; phase: AnimationPhase };
  message: string;
  literalResults: (boolean | null)[][];
  clauseResults: (boolean | null)[];
  finalResult: boolean | null;
};
type HistoryResult = {
    history: AnimationFrame[];
    evaluations: number;
};


const ComparisonPage: React.FC = () => {
  // --- (All state and logic hooks from your code remain unchanged) ---
  const [numVariables, setNumVariables] = useState(3);
  const [formula, setFormula] = useState<CNFFormula | null>(null);
  const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
  const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});
  const [scHistory, setScHistory] = useState<AnimationFrame[]>([]);
  const [bfHistory, setBfHistory] = useState<AnimationFrame[]>([]);
  const [scEvaluations, setScEvaluations] = useState(0);
  const [bfEvaluations, setBfEvaluations] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);

  useEffect(() => {
    if (!isAnimating || isPaused) return;
    const maxHistoryLength = Math.max(scHistory.length, bfHistory.length);
    if (historyIndex >= maxHistoryLength - 1) {
      setIsAnimating(false);
      setIsFinished(true);
      return;
    }
    const timer = setTimeout(() => {
      setHistoryIndex(prev => prev + 1);
    }, 1200);
    return () => clearTimeout(timer);
  }, [isAnimating, isPaused, historyIndex, scHistory, bfHistory]);

  const literalEval = (lit: Literal, ass: VariableAssignment): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);

  const generateShortCircuitHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
    const history: AnimationFrame[] = [];
    let evaluations = 0;
    let literalResults = form.map(cl => Array(cl.length).fill(null));
    let clauseResults = Array(form.length).fill(null);
    const snapshot = (phase: AnimationPhase, cIdx: number, lIdx: number, msg: string, final: boolean | null = null) => {
        history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final });
    };

    snapshot('initial', -1, -1, "Initializing evaluation...");
    for (let i = 0; i < form.length; i++) {
        let clauseIsTrue = false;
        for (let j = 0; j < form[i].length; j++) {
            evaluations++;
            const result = literalEval(form[i][j], ass);
            literalResults[i][j] = result;
            snapshot('literal', i, j, `Literal ${form[i][j].variable} is ${result}.`);
            if (result) {
                clauseIsTrue = true;
                snapshot('clause', i, 0, `Clause C${i + 1} is TRUE (short-circuited).`);
                break;
            }
        }
        clauseResults[i] = clauseIsTrue;
        if (!clauseIsTrue) snapshot('clause', i, 0, `Clause C${i + 1} is FALSE.`);
        if (!clauseIsTrue) {
            snapshot('final', i, 0, `Formula is UNSATISFIABLE.`, false);
            return { history, evaluations };
        }
    }
    snapshot('final', form.length - 1, 0, 'Formula is SATISFIABLE!', true);
    return { history, evaluations };
  }, []);

  const generateBruteForceHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
    const history: AnimationFrame[] = [];
    let evaluations = 0;
    let literalResults = form.map(cl => Array(cl.length).fill(null));
    let clauseResults = Array(form.length).fill(null);
    const snapshot = (phase: AnimationPhase, cIdx: number, lIdx: number, msg: string, final: boolean | null = null) => {
        history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final });
    };

    snapshot('initial', -1, -1, "Initializing evaluation...");
    let formulaResult = true;
    for (let i = 0; i < form.length; i++) {
        let clauseIsTrue = false;
        for (let j = 0; j < form[i].length; j++) {
            evaluations++;
            const result = literalEval(form[i][j], ass);
            literalResults[i][j] = result;
            clauseIsTrue = clauseIsTrue || result;
            snapshot('literal', i, j, `Literal ${form[i][j].variable} is ${result}.`);
        }
        clauseResults[i] = clauseIsTrue;
        formulaResult = formulaResult && clauseIsTrue;
        snapshot('clause', i, 0, `Clause C${i + 1} is ${clauseIsTrue}.`);
    }
    snapshot('final', form.length - 1, 0, `Formula is ${formulaResult ? 'SATISFIABLE' : 'UNSATISFIABLE'}!`, formulaResult);
    return { history, evaluations };
  }, []);

  const handleSetFormula = (newFormula: CNFFormula) => {
    setFormula(newFormula);
    const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
    setDistinctVariables(uniqueVars);
    const newAssignments = { ...manualAssignments };
    uniqueVars.forEach(v => { if(newAssignments[v] === undefined) newAssignments[v] = false; });
    setManualAssignments(newAssignments);
    const scResult = generateShortCircuitHistory(newFormula, newAssignments);
    const bfResult = generateBruteForceHistory(newFormula, newAssignments);
    setScHistory(scResult.history);
    setBfHistory(bfResult.history);
    setScEvaluations(scResult.evaluations);
    setBfEvaluations(bfResult.evaluations);
    setHistoryIndex(0);
    setIsAnimating(true);
    setIsPaused(true);
    setIsFinished(false);
  };

  const regenerateVisualizations = () => {
      if (!formula) return;
      const scResult = generateShortCircuitHistory(formula, manualAssignments);
      const bfResult = generateBruteForceHistory(formula, manualAssignments);
      setScHistory(scResult.history);
      setBfHistory(bfResult.history);
      setScEvaluations(scResult.evaluations);
      setBfEvaluations(bfResult.evaluations);
      setHistoryIndex(0);
      setIsAnimating(true);
      setIsPaused(true);
      setIsFinished(false);
  }

  useEffect(() => {
    if (formula) regenerateVisualizations();
  }, [manualAssignments]);

  const handlePlayResume = () => { setIsAnimating(true); setIsPaused(false); };
  const handlePause = () => { setIsPaused(true); };
  const handleRestart = () => { regenerateVisualizations(); };
  const handleNextStep = () => {
    const maxHistoryLength = Math.max(scHistory.length, bfHistory.length);
    setIsPaused(true);
    setHistoryIndex(prev => Math.min(prev + 1, maxHistoryLength - 1));
  };
  const handlePreviousStep = () => {
    setIsPaused(true);
    setHistoryIndex(prev => Math.max(0, prev - 1));
  };
  
  const currentScFrame = scHistory[Math.min(historyIndex, scHistory.length - 1)];
  const currentBfFrame = bfHistory[Math.min(historyIndex, bfHistory.length - 1)];


  return (
    <Container maxWidth="xl" sx={{ my: 2 }}>
      <Typography variant="h3" align="center" gutterBottom>Algorithm Comparison</Typography>
      <Typography variant="h6" align="center" color="text.secondary" sx={{ mb: 2 }}>Short-Circuit (Optimized) vs. Naive Brute-Force</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <Typography variant="h5" gutterBottom>Step 1: Define Formula & Assignments</Typography>
        
        {/* --- REPLACED GRID WITH BOX (for inputs) --- */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, mb: 2 }}>
          <Box sx={{ width: { xs: '100%', md: '50%' } }}>
            <FormControl fullWidth>
              <InputLabel>Number of Variables</InputLabel>
              <Select value={String(numVariables)} label="Number of Variables" onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}>
                {[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ width: { xs: '100%', md: '50%' }, display: 'flex', alignItems: 'center' }}>
            {distinctVariables.length > 0 && 
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center', height: '100%' }}>
                {distinctVariables.map(v => (
                  <FormControlLabel key={v} control={<Switch checked={!!manualAssignments[v]} onChange={(e) => setManualAssignments(p => ({ ...p, [v]: e.target.checked }))}/>} label={v}/>
                ))}
              </Box>
            }
          </Box>
        </Box>

        <CNFInput setFormula={handleSetFormula} availableVariables={availableVariables} />
      </Paper>
      
      {formula && (
        <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 2: Visualize</Typography>
                <AnimationControls onPlay={handlePlayResume} onPause={handlePause} onRestart={handleRestart} onNext={handleNextStep} onPrevious={handlePreviousStep} isAnimating={isAnimating} isPaused={isPaused} canStepForward={historyIndex < Math.max(scHistory.length, bfHistory.length) -1 } canStepBackward={historyIndex > 0}/>
            </Box>
            <Divider sx={{mb: 2}}/>

            {/* --- REPLACED GRID WITH BOX (for visualizations) --- */}
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
                <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
                    <Typography variant="h6" align="center">Short-Circuit (Optimized)</Typography>
                    {currentScFrame && <Visualization formula={formula} assignment={manualAssignments} literalResults={currentScFrame.literalResults} clauseResults={currentScFrame.clauseResults} animationStep={currentScFrame.step} animationMessage={currentScFrame.message} />}
                </Box>
                <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
                    <Typography variant="h6" align="center">Naive Brute-Force</Typography>
                    {currentBfFrame && <Visualization formula={formula} assignment={manualAssignments} literalResults={currentBfFrame.literalResults} clauseResults={currentBfFrame.clauseResults} animationStep={currentBfFrame.step} animationMessage={currentBfFrame.message} />}
                </Box>
            </Box>
        </Paper>
      )}

      {isFinished && (
        <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Typography variant="h5" gutterBottom align="center">Step 3: Results</Typography>
            <ComparisonResults 
                shortCircuitEvals={scEvaluations}
                bruteForceEvals={bfEvaluations}
            />
        </Paper>
      )}
    </Container>
  );
};

export default ComparisonPage;