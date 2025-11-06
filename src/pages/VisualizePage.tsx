// // src/pages/VisualizePage.tsx

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import type { SelectChangeEvent } from '@mui/material';
// import type { CNFFormula, VariableAssignment, Literal } from '../types';
// import CNFInput from '../components/CNFInput.tsx';
// import Visualization from '../components/Visualization.tsx';
// import AnimationControls from '../components/AnimationControls.tsx';
// import ComparisonResults from '../components/ComparisonResults.tsx';
// import PseudoCodeVisualizer from '../components/PseudoCodeVisualizer.tsx';
// import {
//   Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem,
//   Switch, FormControlLabel, Alert, Divider, Chip, Button, List, ListItem, ListItemIcon, ListItemText
// } from '@mui/material';
// import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import CancelIcon from '@mui/icons-material/Cancel';

// // --- (No changes to types, helpers, or logic hooks are needed) ---
// type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';
// type AnimationFrame = {
//   step: {
//     clauseIndex: number;
//     literalIndex: number;
//     phase: AnimationPhase;
//     pseudoCodeLine: number;
//   };
//   message: string;
//   literalResults: (boolean | null)[][];
//   clauseResults: (boolean | null)[];
//   finalResult: boolean | null;
// };
// type HistoryResult = {
//     history: AnimationFrame[];
//     evaluations: number;
// };

// const isFormulaSatisfied = (formula: CNFFormula, assignment: VariableAssignment): boolean => {
//   return formula.every(clause => clause.some(literal => {
//     const value = assignment[literal.variable];
//     return literal.negated ? !value : value;
//   }));
// };

// const VisualizePage: React.FC = () => {
//   const [numVariables, setNumVariables] = useState(3);
//   const [formula, setFormula] = useState<CNFFormula | null>(null);
//   const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
//   const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});
//   const [satisfyingAssignments, setSatisfyingAssignments] = useState<VariableAssignment[]>([]);
//   const [scHistory, setScHistory] = useState<AnimationFrame[]>([]);
//   const [bfHistory, setBfHistory] = useState<AnimationFrame[]>([]);
//   const [scEvaluations, setScEvaluations] = useState(0);
//   const [bfEvaluations, setBfEvaluations] = useState(0);
//   const [historyIndex, setHistoryIndex] = useState(-1);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isFinished, setIsFinished] = useState(false);

//   const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);
//   const literalEval = (lit: Literal, ass: VariableAssignment): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);

//   useEffect(() => {
//     if (!isAnimating || isPaused) return;
//     const maxHistoryLength = Math.max(scHistory.length, bfHistory.length);
//     if (historyIndex >= maxHistoryLength - 1) {
//       setIsAnimating(false);
//       setIsFinished(true);
//       return;
//     }
//     const timer = setTimeout(() => { setHistoryIndex(prev => prev + 1); }, 1400);
//     return () => clearTimeout(timer);
//   }, [isAnimating, isPaused, historyIndex, scHistory, bfHistory]);

//   const findAllSatisfyingAssignments = (form: CNFFormula, vars: string[]) => {
//       const solutions: VariableAssignment[] = [];
//       const totalCombinations = 1 << vars.length;
//       for (let i = 0; i < totalCombinations; i++) {
//           const currentAssignment: VariableAssignment = {};
//           vars.forEach((variable, index) => { currentAssignment[variable] = ((i >> index) & 1) === 1; });
//           if (isFormulaSatisfied(form, currentAssignment)) { solutions.push(currentAssignment); }
//       }
//       setSatisfyingAssignments(solutions);
//   };
//     const generateShortCircuitHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
//     const history: AnimationFrame[] = [];
//     let evaluations = 0;
//     let literalResults = form.map(cl => Array(cl.length).fill(null));
//     let clauseResults = Array(form.length).fill(null);
//     const snapshot = (phase: AnimationPhase, cIdx: number, lIdx: number, msg: string, line: number, final: boolean | null = null) => {
//         history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, pseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final });
//     };
//     snapshot('initial', -1, -1, "Initializing evaluation...", 1);
//     for (let i = 0; i < form.length; i++) {
//         snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 2, null);
//         let clauseIsTrue = false;
//         for (let j = 0; j < form[i].length; j++) {
//             evaluations++;
//             const result = literalEval(form[i][j], ass);
//             literalResults[i][j] = result;
//             snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result}.`, 5);
//             if (result) {
//                 clauseIsTrue = true;
//                 snapshot('clause', i, 0, `Clause C${i + 1} is TRUE (short-circuited).`, 8);
//                 break;
//             }
//         }
//         clauseResults[i] = clauseIsTrue;
//         if (!clauseIsTrue) snapshot('clause', i, 0, `Clause C${i + 1} is FALSE.`, 11);
//         if (!clauseIsTrue) {
//             snapshot('final', i, 0, `UNSATISFIABLE for this assignment.`, 12, false);
//             return { history, evaluations };
//         }
//     }
//     snapshot('final', form.length - 1, 0, 'SATISFIABLE for this assignment!', 15, true);
//     return { history, evaluations };
//   }, []);
//     const generateBruteForceHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
//     const history: AnimationFrame[] = [];
//     let evaluations = 0;
//     let literalResults = form.map(cl => Array(cl.length).fill(null));
//     let clauseResults = Array(form.length).fill(null);
//     const snapshot = (phase: AnimationPhase, cIdx: number, lIdx: number, msg: string, line: number, final: boolean | null = null) => {
//         history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, pseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final });
//     };
//     snapshot('initial', -1, -1, "Initializing evaluation...", 1);
//     let formulaResult = true;
//     for (let i = 0; i < form.length; i++) {
//         snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 3, null);
//         let clauseIsTrue = false;
//         for (let j = 0; j < form[i].length; j++) {
//             evaluations++;
//             const result = literalEval(form[i][j], ass);
//             literalResults[i][j] = result;
//             clauseIsTrue = clauseIsTrue || result;
//             snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result}.`, 6);
//         }
//         clauseResults[i] = clauseIsTrue;
//         formulaResult = formulaResult && clauseIsTrue;
//         snapshot('clause', i, 0, `Clause C${i + 1} is ${clauseIsTrue}.`, 9);
//     }
//     const msg = `Final Result: ${formulaResult ? 'SATISFIABLE' : 'UNSATISFIABLE'}`;
//     const finalLine = formulaResult ? 12 : 14;
//     snapshot('final', form.length - 1, 0, msg, finalLine, formulaResult);
//     return { history, evaluations };
//   }, []);

//   const regenerateAll = (currentFormula: CNFFormula, currentAssignments: VariableAssignment) => {
//     const scResult = generateShortCircuitHistory(currentFormula, currentAssignments);
//     const bfResult = generateBruteForceHistory(currentFormula, currentAssignments);
//     setScHistory(scResult.history);
//     setBfHistory(bfResult.history);
//     setScEvaluations(scResult.evaluations);
//     setBfEvaluations(bfResult.evaluations);
//     setHistoryIndex(0);
//     setIsAnimating(true);
//     setIsPaused(true);
//     setIsFinished(false);
//   };
//     const handleSetFormula = (newFormula: CNFFormula) => {
//     setFormula(newFormula);
//     const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
//     setDistinctVariables(uniqueVars);
//     const newAssignments: VariableAssignment = {};
//     uniqueVars.forEach(v => { newAssignments[v] = manualAssignments[v] || false; });
//     setManualAssignments(newAssignments);
//     findAllSatisfyingAssignments(newFormula, uniqueVars);
//     regenerateAll(newFormula, newAssignments);
//   };
//     useEffect(() => {
//     if (formula) {
//       regenerateAll(formula, manualAssignments);
//     }
//   }, [manualAssignments]);
//     const handlePlayResume = () => { setIsAnimating(true); setIsPaused(false); };
//   const handlePause = () => { setIsPaused(true); };
//   const handleRestart = () => { if(formula) regenerateAll(formula, manualAssignments); };
//   const handleNextStep = () => {
//     const maxHistoryLength = Math.max(scHistory.length, bfHistory.length);
//     setIsPaused(true);
//     setHistoryIndex(prev => Math.min(prev + 1, maxHistoryLength - 1));
//   };
//   const handlePreviousStep = () => {
//     setIsPaused(true);
//     setHistoryIndex(prev => Math.max(0, prev - 1));
//   };
  
//   const currentScFrame = scHistory[Math.min(historyIndex, scHistory.length - 1)];
//   const currentBfFrame = bfHistory[Math.min(historyIndex, bfHistory.length - 1)];

//   return (
//     <Container sx={{ my: 2 }}>
//       <Typography variant="h3" align="center" gutterBottom>CNF Formula Visualizer</Typography>
      
//       {/* --- Steps 1-3.5 (No change) --- */}
//       <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 1: Declare Variables</Typography><FormControl fullWidth><InputLabel>Number of Variables</InputLabel><Select value={String(numVariables)} label="Number of Variables" onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}>{[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}</Select></FormControl></Paper>
//       <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 2: Create Formula</Typography><CNFInput setFormula={handleSetFormula} availableVariables={availableVariables} /></Paper>
//       {formula && (
//         <>
//           <Paper elevation={3} sx={{ p: 3, my: 2 }}><Typography variant="h5" gutterBottom>Step 3: Assign Values</Typography><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>{distinctVariables.map(v => (<FormControlLabel key={v} control={<Switch checked={!!manualAssignments[v]} onChange={(e) => setManualAssignments(p => ({ ...p, [v]: e.target.checked }))}/>} label={`${v}: ${manualAssignments[v] ? 'True' : 'False'}`}/>))}</Box></Paper>
//           <Paper elevation={3} sx={{ p: 3, my: 2 }}><Typography variant="h5" gutterBottom>Step 3.5: Satisfying Assignments (Hints)</Typography><Divider sx={{ mb: 2 }} />{satisfyingAssignments.length > 0 ? (<List dense>{satisfyingAssignments.map((solution, index) => (<ListItem key={index} secondaryAction={<Button variant="outlined" size="small" onClick={() => setManualAssignments(solution)}>Apply</Button>} sx={{mb: 1, bgcolor: 'action.hover', borderRadius: 1}}><ListItemIcon><LightbulbOutlinedIcon color="primary" /></ListItemIcon><ListItemText primary={<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>{Object.entries(solution).map(([variable, value]) => (<Chip key={variable} icon={value ? <CheckCircleIcon /> : <CancelIcon />} label={`${variable}: ${value ? 'T' : 'F'}`} color={value ? 'success' : 'error'} variant="outlined" size="small"/>))}</Box>} /></ListItem>))}</List>) : (<Alert severity="warning">No satisfying assignments were found for this formula. It is unsatisfiable.</Alert>)}</Paper>
          
//           {/* --- THE NEW DASHBOARD LAYOUT FOR STEP 4 --- */}
//           <Paper elevation={3} sx={{ p: 3, my: 2 }}>
//             {/* Header: Title and Controls */}
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                 <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 4: Visualize & Compare</Typography>
//                 <AnimationControls onPlay={handlePlayResume} onPause={handlePause} onRestart={handleRestart} onNext={handleNextStep} onPrevious={handlePreviousStep} isAnimating={isAnimating} isPaused={isPaused} canStepForward={historyIndex < Math.max(scHistory.length, bfHistory.length) -1 } canStepBackward={historyIndex > 0}/>
//             </Box>
//             <Divider sx={{mb: 2}}/>
            
//             {/* Main Content Area: Two Columns */}
//             <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>

//                 {/* Left Column */}
//                 <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
//                     <Typography variant="h6" align="center" color="primary.light">Short-Circuit (Optimized)</Typography>
//                     {currentScFrame && (
//                         <>
//                             <Visualization formula={formula} assignment={manualAssignments} literalResults={currentScFrame.literalResults} clauseResults={currentScFrame.clauseResults} animationStep={currentScFrame.step} animationMessage={isPaused ? `Paused. (${currentScFrame.message})` : currentScFrame.message} />
//                             <PseudoCodeVisualizer highlightedLine={currentScFrame.step.pseudoCodeLine} algorithmType="short-circuit" />
//                         </>
//                     )}
//                 </Box>

//                 {/* Right Column */}
//                 <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
//                     <Typography variant="h6" align="center" color="#ff79c6">Naive Brute-Force</Typography>
//                     {currentBfFrame && (
//                         <>
//                             <Visualization formula={formula} assignment={manualAssignments} literalResults={currentBfFrame.literalResults} clauseResults={currentBfFrame.clauseResults} animationStep={currentBfFrame.step} animationMessage={isPaused ? `Paused. (${currentBfFrame.message})` : currentBfFrame.message} />
//                             <PseudoCodeVisualizer highlightedLine={currentBfFrame.step.pseudoCodeLine} algorithmType="brute-force" />
//                         </>
//                     )}
//                 </Box>

//             </Box>

//             {/* Final Results Graph (appears at the bottom) */}
//             {isFinished && (
//               <Box sx={{mt: 4}}>
//                 <Divider sx={{mb: 2}}><Chip label="Comparison Results" /></Divider>
//                 <ComparisonResults shortCircuitEvals={scEvaluations} bruteForceEvals={bfEvaluations}/>
//               </Box>
//             )}
//           </Paper>
//         </>
//       )}
//     </Container>
//   );
// };

// export default VisualizePage;

// src/pages/VisualizePage.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { SelectChangeEvent } from '@mui/material';
import type { CNFFormula, VariableAssignment, Literal } from '../types';
import CNFInput from '../components/CNFInput.tsx';
import Visualization from '../components/Visualization.tsx';
import AnimationControls from '../components/AnimationControls.tsx';
import ComparisonResults from '../components/ComparisonResults.tsx';
import PseudoCodeVisualizer from '../components/PseudoCodeVisualizer.tsx';
import {
  Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Alert, Divider, Chip, ToggleButtonGroup, ToggleButton,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';

// --- MODIFIED: Removed searchPseudoCodeLine ---
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

    const generateShortCircuitHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
      const history: any[] = []; let evaluations = 0; let literalResults = form.map(cl => Array(cl.length).fill(null)); let clauseResults = Array(form.length).fill(null);
      const snapshot = (phase: any, cIdx: any, lIdx: any, msg: any, line: any, final: any = null) => { history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, evalPseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final }); };
      
      for (let i = 0; i < form.length; i++) {
          snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 2, null); let clauseIsTrue = false;
          for (let j = 0; j < form[i].length; j++) {
              evaluations++; const result = literalEval(form[i][j], ass); literalResults[i][j] = result;
              snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result ? 'TRUE' : 'FALSE'}.`, 5);
              if (result) {
                clauseIsTrue = true;
                snapshot('clause', i, 0, `C${i+1} is TRUE because a true literal was found (short-circuited).`, 8);
                break;
              }
          }
          clauseResults[i] = clauseIsTrue;
          if (!clauseIsTrue) snapshot('clause', i, 0, `C${i+1} is FALSE because all its literals were false.`, 11);
          if (!clauseIsTrue) {
            snapshot('final', i, 0, `Formula UNSATISFIABLE because C${i+1} is FALSE.`, 12, false);
            return { history, evaluations };
          }
      }
      snapshot('final', form.length - 1, 0, 'Formula SATISFIABLE because all clauses were true.', 15, true); return { history, evaluations };
  }, []);
    const generateBruteForceHistory = useCallback((form: CNFFormula, ass: VariableAssignment): HistoryResult => {
      const history: any[] = []; let evaluations = 0; let literalResults = form.map(cl => Array(cl.length).fill(null)); let clauseResults = Array(form.length).fill(null);
      const snapshot = (phase: any, cIdx: any, lIdx: any, msg: any, line: any, final: any = null) => { history.push({ step: { clauseIndex: cIdx, literalIndex: lIdx, phase, evalPseudoCodeLine: line }, message: msg, literalResults: JSON.parse(JSON.stringify(literalResults)), clauseResults: [...clauseResults], finalResult: final }); };
      
      let formulaResult = true;
      for (let i = 0; i < form.length; i++) {
          snapshot('clause', i, -1, `Evaluating Clause C${i+1}...`, 3, null); let clauseIsTrue = false;
          for (let j = 0; j < form[i].length; j++) {
              evaluations++; const result = literalEval(form[i][j], ass); literalResults[i][j] = result; clauseIsTrue = clauseIsTrue || result;
              snapshot('literal', i, j, `Literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} is ${result ? 'TRUE' : 'FALSE'}.`, 6);
          }
          clauseResults[i] = clauseIsTrue; formulaResult = formulaResult && clauseIsTrue;
          const clauseMsg = clauseIsTrue ? `C${i+1} is TRUE because at least one literal was true.` : `C${i+1} is FALSE because all literals were false.`;
          snapshot('clause', i, 0, clauseMsg, 9);
      }
      const finalMsg = `Formula is ${formulaResult ? 'SATISFIABLE' : 'UNSATISFIABLE'}.`;
      const finalLine = formulaResult ? 12 : 14; snapshot('final', form.length-1, 0, finalMsg, finalLine, formulaResult); return { history, evaluations };
  }, []);
  
  // --- MODIFIED: generateMasterHistory is simplified ---
    const generateMasterHistory = (form: CNFFormula, vars: string[]) => {
      let masterScHistory: AnimationFrame[] = [];
      let masterBfHistory: AnimationFrame[] = [];
      let totalScEvals = 0;
      let totalBfEvals = 0;
      const foundSolutions: VariableAssignment[] = [];
      const totalCombinations = 1 << vars.length;

      const emptyFrameStep = { clauseIndex: -1, literalIndex: -1, phase: 'initial' as const, evalPseudoCodeLine: 0 };
      
      for (let i = 0; i < totalCombinations; i++) {
          const currentAssignment: VariableAssignment = {};
          vars.forEach((variable, index) => { currentAssignment[variable] = ((i >> index) & 1) === 1; });
          
          const message = `Testing Assignment ${i+1}/${totalCombinations}: ${formatAssignment(currentAssignment)}`;
          const nextStepFrame = { step: emptyFrameStep, message, literalResults: form.map(cl => Array(cl.length).fill(null)), clauseResults: Array(form.length).fill(null), finalResult: null, currentAssignment };
          masterScHistory.push(nextStepFrame);
          masterBfHistory.push(nextStepFrame);

          const scResult = generateShortCircuitHistory(form, currentAssignment);
          totalScEvals += scResult.evaluations;
          scResult.history.forEach((frame: any) => masterScHistory.push({ ...frame, currentAssignment }));
          
          if (scResult.history.length > 0 && scResult.history[scResult.history.length - 1].finalResult) {
            foundSolutions.push(currentAssignment);
          }

          const bfResult = generateBruteForceHistory(form, currentAssignment);
          totalBfEvals += bfResult.evaluations;
          bfResult.history.forEach((frame: any) => masterBfHistory.push({ ...frame, currentAssignment }));
      }
      
      const finalStepFrame = { ...masterScHistory[masterScHistory.length-1], message: "Search complete." };
      masterScHistory.push(finalStepFrame);
      masterBfHistory.push(finalStepFrame);

      const combinedLength = Math.max(masterScHistory.length, masterBfHistory.length);
      const finalHistory = [];
      for (let i = 0; i < combinedLength; i++) {
          const scFrame = masterScHistory[i] || masterScHistory[masterScHistory.length - 1];
          const bfFrame = masterBfHistory[i] || masterBfHistory[masterBfHistory.length - 1];
          finalHistory.push({ scFrame, bfFrame });
      }

      setAnimationHistory(finalHistory);
      setScTotalEvals(totalScEvals);
      setBfTotalEvals(totalBfEvals);
      setSatisfyingAssignments(foundSolutions);
  };
  
  const regenerateAnimation = useCallback(() => {
    if (!formula) return;

    setIsFinished(false);
    setHistoryIndex(0);
    setIsAnimating(true);
    setIsPaused(true);

    if (evaluationMode === 'manual') {
        const scResult = generateShortCircuitHistory(formula, manualAssignments);
        const bfResult = generateBruteForceHistory(formula, manualAssignments);
        const combinedLength = Math.max(scResult.history.length, bfResult.history.length);
        const finalHistory: { scFrame: AnimationFrame, bfFrame: AnimationFrame }[] = [];
        for (let i = 0; i < combinedLength; i++) {
          const scFrame = scResult.history[i] || scResult.history[scResult.history.length - 1];
          const bfFrame = bfResult.history[i] || bfResult.history[bfResult.history.length - 1];
          
          const correctedScFrame = { ...scFrame, currentAssignment: manualAssignments };
          const correctedBfFrame = { ...bfFrame, currentAssignment: manualAssignments };
          
          finalHistory.push({ scFrame: correctedScFrame, bfFrame: correctedBfFrame });
        }
        setAnimationHistory(finalHistory);
        setScTotalEvals(scResult.evaluations);
        setBfTotalEvals(bfResult.evaluations);
        setSatisfyingAssignments(isFormulaSatisfied(formula, manualAssignments) ? [manualAssignments] : []);
    } else {
        generateMasterHistory(formula, distinctVariables);
    }
  }, [formula, evaluationMode, manualAssignments, distinctVariables, generateShortCircuitHistory, generateBruteForceHistory]);

  const handleSetFormula = (newFormula: CNFFormula) => {
    setFormula(newFormula);
    const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
    setDistinctVariables(uniqueVars);
    const newAssignments: VariableAssignment = {};
    uniqueVars.forEach(v => { newAssignments[v] = manualAssignments[v] || false; });
    setManualAssignments(newAssignments);
  };

  useEffect(() => {
    if (formula) {
        regenerateAnimation();
    }
  }, [manualAssignments, evaluationMode, formula, regenerateAnimation]);
  
  const handlePlayResume = () => { setIsAnimating(true); setIsPaused(false); };
  const handlePause = () => setIsPaused(true);
  const handleRestart = () => regenerateAnimation();
  const handleNextStep = () => {
    setIsPaused(true);
    setHistoryIndex(p => Math.min(p + 1, animationHistory.length - 1));
  };
  const handlePreviousStep = () => {
    setIsPaused(true);
    setHistoryIndex(p => Math.max(0, p - 1));
  };

  const currentFrame = animationHistory[historyIndex];
  const currentScFrame = currentFrame?.scFrame;
  const currentBfFrame = currentFrame?.bfFrame;

  return (
    <Container sx={{ my: 2 }}>
      <Typography variant="h3" align="center" gutterBottom>CNF Formula Visualizer</Typography>
      
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 1: Declare Variables</Typography><FormControl fullWidth><InputLabel>Number of Variables</InputLabel><Select value={String(numVariables)} label="Number of Variables" onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}>{[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}</Select></FormControl></Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 2: Create Formula</Typography><CNFInput setFormula={handleSetFormula} availableVariables={availableVariables} /></Paper>
      
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
            ) : (
              <Alert severity="warning" sx={{mt: 2}}>
                Automatic Search will test all <strong>{1 << distinctVariables.length}</strong> possible assignments.
              </Alert>
            )}
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 4: Visualize</Typography>
                <AnimationControls isAnimating={isAnimating} isPaused={isPaused} canStepForward={historyIndex < animationHistory.length -1 } canStepBackward={historyIndex > 0} onPlay={handlePlayResume} onPause={handlePause} onRestart={handleRestart} onNext={handleNextStep} onPrevious={handlePreviousStep}/>
            </Box>
            <Divider sx={{mb: 2}}/>
            
            {/* --- THIS BLOCK IS NOW REMOVED --- */}

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3 }}>
                <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" align="center" color="primary.light">Short-Circuit (Optimized)</Typography>
                    {currentScFrame && (
                        <>
                            <Visualization formula={formula} assignment={currentScFrame.currentAssignment} literalResults={currentScFrame.literalResults} clauseResults={currentScFrame.clauseResults} animationStep={currentScFrame.step} animationMessage={isPaused ? `Paused. (${currentScFrame.message})` : currentScFrame.message} />
                            <PseudoCodeVisualizer highlightedLine={currentScFrame.step.evalPseudoCodeLine} algorithmType="short-circuit" />
                        </>
                    )}
                </Box>
                <Box sx={{ width: { xs: '100%', lg: '50%' }, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="h6" align="center" color="#ff79c6">Naive Brute-Force</Typography>
                    {currentBfFrame && (
                        <>
                            <Visualization formula={formula} assignment={currentBfFrame.currentAssignment} literalResults={currentBfFrame.literalResults} clauseResults={currentBfFrame.clauseResults} animationStep={currentBfFrame.step} animationMessage={isPaused ? `Paused. (${currentBfFrame.message})` : currentBfFrame.message} />
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
                <Box sx={{mt: 2}}>
                    <ComparisonResults shortCircuitEvals={scTotalEvals} bruteForceEvals={bfTotalEvals}/>
                </Box>
              </Paper>
          )}
        </>
      )}
    </Container>
  );
};

export default VisualizePage;