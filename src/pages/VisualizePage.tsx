// src/pages/VisualizePage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { CNFFormula, VariableAssignment, Literal } from '../types';
import CNFInput from '../components/CNFInput.tsx';
import Visualization from '../components/Visualization.tsx';
import AnimationControls from '../components/AnimationControls.tsx';
import ComparisonResults from '../components/ComparisonResults.tsx';
import PseudoCodeVisualizer from '../components/PseudoCodeVisualizer.tsx';
import TruthTableVisualizer from '../components/TruthTableVisualizer.tsx';
import {
  Typography, Box, Paper,
  Switch, FormControlLabel, Alert, Divider, Chip, ToggleButtonGroup, ToggleButton,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type TableHistoryRow = {
  assignment: VariableAssignment;
  clauseResults: (boolean | null)[];
  isSatisfied: boolean | null;
}

type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';

type AnimationFrame = {
  step: {
    clauseIndex: number; literalIndex: number; phase: AnimationPhase;
    evalPseudoCodeLine: number;
  };
  message: string;
  literalResults: (boolean | null)[][];
  clauseResults: (boolean | null)[];
  finalResult: boolean | null;
  currentAssignment: VariableAssignment;
  tableHistory: TableHistoryRow[];
};
type HistoryResult = {
    history: AnimationFrame[];
    evaluations: number;
};

const formatAssignment = (assignment: VariableAssignment): string => {
  if (Object.keys(assignment).length === 0) return '';
  return `(${Object.entries(assignment).map(([v, val]) => `${v}=${val ? 'T' : 'F'}`).join(', ')})`;
};

const isFormulaSatisfied = (formula: CNFFormula, assignment: VariableAssignment): boolean => {
    return formula.every(clause => clause.some(literal => {
        const value = assignment[literal.variable];
        return literal.negated ? !value : value;
    }));
};

const VisualizePage: React.FC = () => {
  const [evaluationMode, setEvaluationMode] = useState<'manual' | 'auto'>('manual');
  const [numVariables, setNumVariables] = useState(3);
  const [formula, setFormula] = useState<CNFFormula | null>(null);
  const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
  const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});
  const [satisfyingAssignments, setSatisfyingAssignments] = useState<VariableAssignment[]>([]);
  const [animationHistory, setAnimationHistory] = useState<{ scFrame: AnimationFrame, bfFrame: AnimationFrame }[]>([]);
  const [scTotalEvals, setScTotalEvals] = useState(0);
  const [bfTotalEvals, setBfTotalEvals] = useState(0);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);
  const literalEval = (lit: Literal, ass: VariableAssignment): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);

  useEffect(() => {
    if (!isAnimating || isPaused) return;
    if (historyIndex >= animationHistory.length - 1) {
      setIsAnimating(false); setIsFinished(true); return;
    }
    const timer = setTimeout(() => { setHistoryIndex(prev => prev + 1); }, 1100);
    return () => clearTimeout(timer);
  }, [isAnimating, isPaused, historyIndex, animationHistory]);

  const generateShortCircuitHistory = useCallback((form: CNFFormula, ass: VariableAssignment, tableHistory: TableHistoryRow[]): HistoryResult => {
    const history: any[] = []; let evaluations = 0; let literalResults = form.map(cl => Array(cl.length).fill(null)); let clauseResults = Array(form.length).fill(null);
    const snapshot = (phase: any, cIdx: any, lIdx: any, msg: any, line: any, final: any = null) => { history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, evalPseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final, tableHistory }); };
    for (let i = 0; i < form.length; i++) {
        snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 2, null); let clauseIsTrue = false;
        for (let j = 0; j < form[i].length; j++) {
            evaluations++; const result = literalEval(form[i][j], ass); literalResults[i][j] = result;
            snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result ? 'TRUE' : 'FALSE'}.`, 5);
            if (result) {
              clauseIsTrue = true; snapshot('clause', i, 0, `C${i+1} is TRUE (short-circuited).`, 8); break;
            }
        }
        clauseResults[i] = clauseIsTrue;
        if (!clauseIsTrue) snapshot('clause', i, 0, `C${i+1} is FALSE.`, 11);
        if (!clauseIsTrue) {
          snapshot('final', i, 0, `Formula UNSATISFIABLE.`, 12, false); return { history, evaluations };
        }
    }
    snapshot('final', form.length - 1, 0, 'Formula SATISFIABLE.', 15, true); return { history, evaluations };
  }, [literalEval]);

  const generateBruteForceHistory = useCallback((form: CNFFormula, ass: VariableAssignment, tableHistory: TableHistoryRow[]): HistoryResult => {
    const history: any[] = []; let evaluations = 0; let literalResults = form.map(cl => Array(cl.length).fill(null)); let clauseResults = Array(form.length).fill(null);
    const snapshot = (phase: any, cIdx: any, lIdx: any, msg: any, line: any, final: any = null) => { history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, evalPseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final, tableHistory }); };
    let formulaResult = true;
    for (let i = 0; i < form.length; i++) {
        snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 3, null); let clauseIsTrue = false;
        for (let j = 0; j < form[i].length; j++) {
            evaluations++; const result = literalEval(form[i][j], ass); literalResults[i][j] = result; clauseIsTrue = clauseIsTrue || result;
            snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result ? 'TRUE' : 'FALSE'}.`, 6);
        }
        clauseResults[i] = clauseIsTrue; formulaResult = formulaResult && clauseIsTrue;
        const clauseMsg = clauseIsTrue ? `C${i+1} is TRUE.` : `C${i+1} is FALSE.`;
        snapshot('clause', i, 0, clauseMsg, 9);
    }
    const finalMsg = `Formula is ${formulaResult ? 'SATISFIABLE' : 'UNSATISFIABLE'}.`;
    const finalLine = formulaResult ? 12 : 14; snapshot('final', form.length-1, 0, finalMsg, finalLine, formulaResult); return { history, evaluations };
  }, [literalEval]);

  const generateMasterHistory = useCallback((form: CNFFormula, vars: string[]) => {
      let masterScHistory: AnimationFrame[] = [];
      let masterBfHistory: AnimationFrame[] = [];
      let totalScEvals = 0;
      let totalBfEvals = 0;
      const foundSolutions: VariableAssignment[] = [];
      let scTableHistory: TableHistoryRow[] = [];
      let bfTableHistory: TableHistoryRow[] = [];
      const totalCombinations = 1 << vars.length;

      for (let i = 0; i < totalCombinations; i++) {
          const currentAssignment: VariableAssignment = {};
          vars.forEach((variable, index) => { currentAssignment[variable] = ((i >> index) & 1) === 1; });
          const message = `Testing Assignment ${i+1}/${totalCombinations}: ${formatAssignment(currentAssignment)}`;
          
          const scNextStepFrame = { step: { clauseIndex: -1, literalIndex: -1, phase: 'initial' as const, evalPseudoCodeLine: 0 }, message, literalResults: form.map(cl => Array(cl.length).fill(null)), clauseResults: Array(form.length).fill(null), finalResult: null, currentAssignment, tableHistory: [...scTableHistory] };
          masterScHistory.push(scNextStepFrame);
          
          const bfNextStepFrame = { step: { clauseIndex: -1, literalIndex: -1, phase: 'initial' as const, evalPseudoCodeLine: 0 }, message, literalResults: form.map(cl => Array(cl.length).fill(null)), clauseResults: Array(form.length).fill(null), finalResult: null, currentAssignment, tableHistory: [...bfTableHistory] };
          masterBfHistory.push(bfNextStepFrame);

          const scResult = generateShortCircuitHistory(form, currentAssignment, [...scTableHistory]);
          totalScEvals += scResult.evaluations;
          scResult.history.forEach((frame: any) => masterScHistory.push({ ...frame, currentAssignment }));
          
          const finalScFrame = scResult.history.length > 0 ? scResult.history[scResult.history.length - 1] : null;
          const isScSatisfied = finalScFrame ? finalScFrame.finalResult : false;
          const finalScClauseResults = finalScFrame ? finalScFrame.clauseResults : [];
          if (isScSatisfied) { foundSolutions.push(currentAssignment); }
          scTableHistory.push({ assignment: currentAssignment, clauseResults: finalScClauseResults, isSatisfied: isScSatisfied });

          // --- THIS IS THE FIX ---
          const bfResult = generateBruteForceHistory(form, currentAssignment, [...bfTableHistory]);
          totalBfEvals += bfResult.evaluations;
          bfResult.history.forEach((frame: any) => masterBfHistory.push({ ...frame, currentAssignment }));
          
          const finalBfFrame = bfResult.history.length > 0 ? bfResult.history[bfResult.history.length - 1] : null;
          const isBfSatisfied = finalBfFrame ? finalBfFrame.finalResult : false;
          const finalBfClauseResults = finalBfFrame ? finalBfFrame.clauseResults : [];
          bfTableHistory.push({ assignment: currentAssignment, clauseResults: finalBfClauseResults, isSatisfied: isBfSatisfied });
      }
      if (masterScHistory.length > 0) {
        const finalStepFrame = { ...masterScHistory[masterScHistory.length - 1], message: "Search complete." };
        masterScHistory.push(finalStepFrame); masterBfHistory.push(finalStepFrame);
      }
      const combinedLength = Math.max(masterScHistory.length, masterBfHistory.length);
      const finalHistory = [];
      for (let i = 0; i < combinedLength; i++) {
          finalHistory.push({ scFrame: masterScHistory[i] || masterScHistory[masterScHistory.length - 1], bfFrame: masterBfHistory[i] || masterBfHistory[masterBfHistory.length - 1] });
      }
      setAnimationHistory(finalHistory);
      setScTotalEvals(totalScEvals);
      setBfTotalEvals(totalBfEvals);
      setSatisfyingAssignments(foundSolutions);
  }, [generateShortCircuitHistory, generateBruteForceHistory]);
  
  const regenerateAnimation = useCallback((
    currentFormula: CNFFormula,
    currentMode: 'manual' | 'auto',
    currentManualAssignments: VariableAssignment,
    currentDistinctVars: string[]
  ) => {
    setIsFinished(false);
    setHistoryIndex(0);
    setIsAnimating(true);
    setIsPaused(true);

    if (currentMode === 'manual') {
        const scResult = generateShortCircuitHistory(currentFormula, currentManualAssignments, []);
        const bfResult = generateBruteForceHistory(currentFormula, currentManualAssignments, []);
        const combinedLength = Math.max(scResult.history.length, bfResult.history.length);
        const finalHistory: { scFrame: AnimationFrame, bfFrame: AnimationFrame }[] = [];
        for (let i = 0; i < combinedLength; i++) {
          finalHistory.push({ 
            scFrame: { ...(scResult.history[i] || scResult.history[scResult.history.length - 1]), currentAssignment: currentManualAssignments }, 
            bfFrame: { ...(bfResult.history[i] || bfResult.history[bfResult.history.length - 1]), currentAssignment: currentManualAssignments }
          });
        }
        setAnimationHistory(finalHistory);
        setScTotalEvals(scResult.evaluations);
        setBfTotalEvals(bfResult.evaluations);
        setSatisfyingAssignments(isFormulaSatisfied(currentFormula, currentManualAssignments) ? [currentManualAssignments] : []);
    } else {
        generateMasterHistory(currentFormula, currentDistinctVars);
    }
  }, [generateShortCircuitHistory, generateBruteForceHistory, generateMasterHistory]);

  const handleSetFormula = (newFormula: CNFFormula) => {
    const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
    const newAssignments: VariableAssignment = {};
    uniqueVars.forEach(v => { newAssignments[v] = manualAssignments[v] || false; });
    setFormula(newFormula);
    setDistinctVariables(uniqueVars);
    setManualAssignments(newAssignments);
    regenerateAnimation(newFormula, evaluationMode, newAssignments, uniqueVars);
  };

  useEffect(() => {
    if (formula) {
        regenerateAnimation(formula, evaluationMode, manualAssignments, distinctVariables);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [manualAssignments, evaluationMode]);
  
  const handlePlayResume = () => { setIsAnimating(true); setIsPaused(false); };
  const handlePause = () => setIsPaused(true);
  const handleRestart = () => { if (formula) regenerateAnimation(formula, evaluationMode, manualAssignments, distinctVariables) };
  const handleNextStep = () => { setIsPaused(true); setHistoryIndex(p => Math.min(p + 1, animationHistory.length - 1)); };
  const handlePreviousStep = () => { setIsPaused(true); setHistoryIndex(p => Math.max(0, p - 1)); };

  const currentFrame = animationHistory[historyIndex];
  const currentScFrame = currentFrame?.scFrame;
  const currentBfFrame = currentFrame?.bfFrame;

  return (
    <Box sx={{ px: { xs: 1, sm: 2, md: 4 }, my: 2 }}>
      <Typography variant="h3" align="center" gutterBottom>CNF Formula Visualizer</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}>
        <CNFInput 
          setFormula={handleSetFormula} 
          availableVariables={availableVariables}
          numVariables={numVariables}
          setNumVariables={setNumVariables}
        />
      </Paper>
      
      {formula && (
        <>
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Typography variant="h5" gutterBottom>Step 3: Choose Evaluation Mode</Typography>
            <ToggleButtonGroup value={evaluationMode} exclusive onChange={(_, newMode) => { if (newMode) setEvaluationMode(newMode); }} fullWidth>
              <ToggleButton value="manual">Manual Assignment</ToggleButton>
              <ToggleButton value="auto">Automatic Search (Find all Solutions)</ToggleButton>
            </ToggleButtonGroup>
            
            {evaluationMode === 'manual' ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mt: 2 }}>
                  {distinctVariables.map(v => (<FormControlLabel key={v} control={<Switch checked={!!manualAssignments[v]} onChange={(e) => setManualAssignments(p => ({ ...p, [v]: e.target.checked }))}/>} label={`${v}: ${manualAssignments[v] ? 'True' : 'False'}`}/>))}
              </Box>
            ) : ( <Alert severity="warning" sx={{mt: 2}}>Automatic Search will test all <strong>{1 << distinctVariables.length}</strong> possible assignments.</Alert> )}
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 4: Visualize</Typography>
                <AnimationControls isAnimating={isAnimating} isPaused={isPaused} canStepForward={historyIndex < animationHistory.length -1 } canStepBackward={historyIndex > 0} onPlay={handlePlayResume} onPause={handlePause} onRestart={handleRestart} onNext={handleNextStep} onPrevious={handlePreviousStep}/>
            </Box>
            <Divider sx={{mb: 2}}/>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" align="center" color="primary.light">Short-Circuit (Optimized)</Typography>
                    {currentScFrame && (
                        <>
                          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 2, alignItems: 'center' }}>
                            <Box sx={{ width: { xs: '100%', xl: '50%' } }}><Visualization formula={formula} assignment={currentScFrame.currentAssignment} literalResults={currentScFrame.literalResults} clauseResults={currentScFrame.clauseResults} animationStep={currentScFrame.step} animationMessage={isPaused ? `Paused. (${currentScFrame.message})` : currentScFrame.message} /></Box>
                            <Box sx={{ width: { xs: '100%', xl: '50%' } }}><TruthTableVisualizer formula={formula} currentAssignment={currentScFrame.currentAssignment} currentClauseResults={currentScFrame.clauseResults} animationStep={currentScFrame.step} history={currentScFrame.tableHistory} isCurrentSatisfied={currentScFrame.finalResult}/></Box>
                          </Box>
                          <PseudoCodeVisualizer highlightedLine={currentScFrame.step.evalPseudoCodeLine} algorithmType="short-circuit" />
                        </>
                    )}
                </Box>
                <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" align="center" color="#ff79c6">Naive Brute-Force</Typography>
                    {currentBfFrame && (
                        <>
                           <Box sx={{ display: 'flex', flexDirection: { xs: 'column', xl: 'row' }, gap: 2, alignItems: 'center' }}>
                              <Box sx={{ width: { xs: '100%', xl: '50%' } }}><Visualization formula={formula} assignment={currentBfFrame.currentAssignment} literalResults={currentBfFrame.literalResults} clauseResults={currentBfFrame.clauseResults} animationStep={currentBfFrame.step} animationMessage={isPaused ? `Paused. (${currentBfFrame.message})` : currentBfFrame.message} /></Box>
                              <Box sx={{ width: { xs: '100%', xl: '50%' } }}><TruthTableVisualizer formula={formula} currentAssignment={currentBfFrame.currentAssignment} currentClauseResults={currentBfFrame.clauseResults} animationStep={currentBfFrame.step} history={currentBfFrame.tableHistory} isCurrentSatisfied={currentBfFrame.finalResult} /></Box>
                            </Box>
                            <PseudoCodeVisualizer highlightedLine={currentBfFrame.step.evalPseudoCodeLine} algorithmType="brute-force" />
                        </>
                    )}
                </Box>
            </Box>
          </Paper>

          {isFinished && (
              <Paper elevation={3} sx={{p: 3, my: 2}}>
                <Typography variant="h5" gutterBottom>Step 5: Summary</Typography>
                <Divider sx={{mb: 2}} />
                <Typography variant="h6">Found {satisfyingAssignments.length} satisfying assignment(s):</Typography>
                {satisfyingAssignments.length > 0 ? (
                    <List dense>{satisfyingAssignments.map((solution, index) => (<ListItem key={index}><ListItemIcon><CheckCircleIcon color="success" /></ListItemIcon><ListItemText primary={<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{Object.entries(solution).map(([variable, value]) => (<Chip key={variable} label={`${variable}: ${value ? 'T' : 'F'}`} color={value ? 'success' : 'error'} variant="outlined" size="small"/>))}</Box>} /></ListItem>))}</List>
                ) : <Alert severity="info">The formula is UNSATISFIABLE.</Alert>}
                <Box sx={{mt: 2}}><ComparisonResults shortCircuitEvals={scTotalEvals} bruteForceEvals={bfTotalEvals}/></Box>
              </Paper>
          )}
        </>
      )}
    </Box>
  );
};

export default VisualizePage;