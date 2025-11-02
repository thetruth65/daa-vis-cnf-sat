// // src/pages/VisualizePage.tsx

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import type { SelectChangeEvent } from '@mui/material';
// import type { CNFFormula, VariableAssignment, Clause, Literal } from '../types';
// import CNFInput from '../components/CNFInput.tsx';
// import Visualization from '../components/Visualization.tsx';
// import AnimationControls from '../components/AnimationControls.tsx';
// import { Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, Divider } from '@mui/material';

// type AnimationPhase = 'initial' | 'literal' | 'clause' | 'interClause' | 'final' | 'done';
// type AnimationFrame = {
//   step: { clauseIndex: number; literalIndex: number; phase: AnimationPhase };
//   message: string;
//   literalResults: (boolean | null)[][];
//   clauseResults: (boolean | null)[];
//   finalResult: boolean | null;
// };

// const VisualizePage: React.FC = () => {
//   // --- Core State (unchanged) ---
//   const [numVariables, setNumVariables] = useState(3);
//   const [formula, setFormula] = useState<CNFFormula | null>(null);
//   const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
//   const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});

//   // --- Animation State ---
//   const [animationHistory, setAnimationHistory] = useState<AnimationFrame[]>([]);
//   const [historyIndex, setHistoryIndex] = useState(-1);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);

//   const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);

//   // --- Animation Playback Hook ---
//   useEffect(() => {
//     if (!isAnimating || isPaused) return;
//     if (historyIndex >= animationHistory.length - 1) {
//       setIsAnimating(false);
//       return;
//     }
//     const timer = setTimeout(() => {
//       setHistoryIndex(prev => prev + 1);
//     }, 1800);
//     return () => clearTimeout(timer);
//   }, [isAnimating, isPaused, historyIndex, animationHistory]);

//   // --- Function to pre-calculate all animation frames ---
//   const generateAnimationHistory = useCallback((form: CNFFormula, ass: VariableAssignment): AnimationFrame[] => {
//     const history: AnimationFrame[] = [];
//     const literalEval = (lit: Literal): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);
//     const clauseEval = (cl: Clause): boolean => cl.some(lit => literalEval(lit));

//     let literalResults = form.map(cl => Array(cl.length).fill(null));
//     let clauseResults = Array(form.length).fill(null);

//     const snapshot = (phase: AnimationPhase, clauseIdx: number, literalIdx: number, msg: string, final: boolean | null = null): void => {
//       history.push({
//         step: { clauseIndex: clauseIdx, literalIndex: literalIdx, phase },
//         message: msg,
//         literalResults: JSON.parse(JSON.stringify(literalResults)),
//         clauseResults: [...clauseResults],
//         finalResult: final
//       });
//     };

//     // --- THIS IS THE NEW INITIAL STEP ---
//     snapshot('initial', -1, -1, "Initializing evaluation with the provided variable assignments.");

//     // Phase 1: Literals and Clauses
//     for (let i = 0; i < form.length; i++) {
//       for (let j = 0; j < form[i].length; j++) {
//         const result = literalEval(form[i][j]);
//         literalResults[i][j] = result;
//         snapshot('literal', i, j, `Evaluating literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} in C${i + 1}... It is ${result ? 'TRUE' : 'FALSE'}.`);
//         if (result) break;
//       }
//       const clauseResult = clauseEval(form[i]);
//       clauseResults[i] = clauseResult;
//       const msg = clauseResult ? `C${i + 1} is TRUE because at least one literal was true.` : `C${i + 1} is FALSE because all its literals were false.`;
//       snapshot('clause', i, 0, msg);
//     }
//     // Phase 2: Inter-clause
//     let runningResult = true;
//     for (let i = 0; i < clauseResults.length; i++) {
//       const currentClauseResult = clauseResults[i] as boolean; // We know it's evaluated by now
//       if (i === 0) { snapshot('interClause', i, 0, `Now combining results. C1 is ${currentClauseResult ? 'TRUE' : 'FALSE'}.`); }
//       else {
//         const prevResult = runningResult;
//         runningResult = runningResult && currentClauseResult;
//         snapshot('interClause', i - 1, 0, `Result so far is ${prevResult ? 'TRUE' : 'FALSE'}. Combining with C${i + 1} (${currentClauseResult ? 'TRUE' : 'FALSE'})... New result is ${runningResult ? 'TRUE' : 'FALSE'}.`);
//       }
//       if (!runningResult) {
//         snapshot('final', i, 0, `Formula is UNSATISFIABLE because C${i + 1} is FALSE, making the whole conjunction false.`, false);
//         return history;
//       }
//     }
//     snapshot('final', form.length - 1, 0, 'All clauses evaluated to TRUE. The formula is SATISFIABLE!', true);
//     return history;
//   }, []);
  
//   // --- Handlers (no changes needed, they work with the updated history) ---
//   const handleSetFormula = (newFormula: CNFFormula) => {
//     setFormula(newFormula);
//     const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
//     setDistinctVariables(uniqueVars);
//     const newAssignments: VariableAssignment = {};
//     uniqueVars.forEach(v => { newAssignments[v] = manualAssignments[v] || false; });
//     setManualAssignments(newAssignments);
    
//     const history = generateAnimationHistory(newFormula, newAssignments);
//     setAnimationHistory(history);
//     setHistoryIndex(0);
//     setIsAnimating(true);
//     setIsPaused(true);
//   };
  
//   const regenerateVisualization = () => {
//       if (!formula) return;
//       const history = generateAnimationHistory(formula, manualAssignments);
//       setAnimationHistory(history);
//       setHistoryIndex(0);
//       setIsAnimating(true);
//       setIsPaused(true);
//   };

//   useEffect(() => {
//     if(formula) {
//         regenerateVisualization();
//     }
//   }, [manualAssignments, formula]); // Added formula dependency

//   const handlePlayResume = () => {
//     if (historyIndex >= animationHistory.length - 1) {
//       regenerateVisualization();
//       setIsAnimating(true);
//       setIsPaused(false);
//       return;
//     }
//     setIsAnimating(true);
//     setIsPaused(false);
//   };

//   const handlePause = () => { setIsPaused(true); };
//   const handleNextStep = () => { setIsPaused(true); setHistoryIndex(prev => Math.min(prev + 1, animationHistory.length - 1)); };
//   const handlePreviousStep = () => { setIsPaused(true); setHistoryIndex(prev => Math.max(0, prev - 1)); };
//   const handleRestart = () => { regenerateVisualization(); };

//   const currentFrame = historyIndex > -1 ? animationHistory[historyIndex] : null;

//   return (
//     <Container sx={{ my: 2 }}>
//       <Typography variant="h3" align="center" gutterBottom>CNF Formula Visualizer</Typography>
//       <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 1: Declare Variables</Typography><FormControl fullWidth><InputLabel>Number of Variables</InputLabel><Select value={String(numVariables)} label="Number of Variables" onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}>{[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}</Select></FormControl></Paper>
//       <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 2: Create Formula</Typography><CNFInput setFormula={handleSetFormula} availableVariables={availableVariables} /></Paper>
      
//       {formula && (
//         <>
//           <Paper elevation={3} sx={{ p: 3, my: 2 }}>
//             <Typography variant="h5" gutterBottom>Step 3: Assign Values Manually</Typography>
//             <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
//                 {distinctVariables.map(v => (<FormControlLabel key={v} control={<Switch checked={!!manualAssignments[v]} onChange={(e) => setManualAssignments(p => ({ ...p, [v]: e.target.checked }))}/>} label={`${v}: ${manualAssignments[v] ? 'True' : 'False'}`}/>))}
//             </Box>
//           </Paper>
          
//           <Paper elevation={3} sx={{ p: 3, my: 2 }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
//                 <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 4: Visualize</Typography>
//                 {animationHistory.length > 0 && (
//                     <AnimationControls
//                         onPlay={handlePlayResume}
//                         onPause={handlePause}
//                         onRestart={handleRestart}
//                         onNext={handleNextStep}
//                         onPrevious={handlePreviousStep}
//                         isAnimating={isAnimating}
//                         isPaused={isPaused}
//                         canStepForward={historyIndex < animationHistory.length - 1}
//                         canStepBackward={historyIndex > 0}
//                     />
//                 )}
//             </Box>
//             <Divider />
            
//             {currentFrame ? (
//                 <>
//                 <Visualization
//                     formula={formula}
//                     assignment={manualAssignments}
//                     literalResults={currentFrame.literalResults}
//                     clauseResults={currentFrame.clauseResults}
//                     animationStep={currentFrame.step}
//                     animationMessage={isPaused ? `Paused. (Step: ${currentFrame.message})` : currentFrame.message}
//                 />
//                 {currentFrame.finalResult !== null && (
//                     <Alert severity={currentFrame.finalResult ? 'success' : 'error'} sx={{ mt: 2 }}>
//                     <Typography variant="h6">Final Result: The formula is {currentFrame.finalResult ? 'SATISFIABLE' : 'UNSATISFIABLE'} for this assignment.</Typography>
//                     </Alert>
//                 )}
//                 </>
//             ) : (
//                 <Typography sx={{mt: 2, color: 'text.secondary'}}>Visualization will appear here after setting the formula.</Typography>
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
import { Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, Divider } from '@mui/material';

type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';
type AnimationFrame = {
  step: { clauseIndex: number; literalIndex: number; phase: AnimationPhase };
  message: string;
  literalResults: (boolean | null)[][];
  clauseResults: (boolean | null)[];
  finalResult: boolean | null;
};

const VisualizePage: React.FC = () => {
  const [numVariables, setNumVariables] = useState(3);
  const [formula, setFormula] = useState<CNFFormula | null>(null);
  const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
  const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});
  const [animationHistory, setAnimationHistory] = useState<AnimationFrame[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);

  useEffect(() => {
    if (!isAnimating || isPaused) return;
    if (historyIndex >= animationHistory.length - 1) {
      setIsAnimating(false);
      return;
    }
    const timer = setTimeout(() => {
      setHistoryIndex(prev => prev + 1);
    }, 1800);
    return () => clearTimeout(timer);
  }, [isAnimating, isPaused, historyIndex, animationHistory]);

  const generateAnimationHistory = useCallback((form: CNFFormula, ass: VariableAssignment): AnimationFrame[] => {
    const history: AnimationFrame[] = [];
    const literalEval = (lit: Literal): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);
    
    // --- THIS IS THE FIX: The 'clauseEval' from the previous version was here and is now removed. ---
    
    let literalResults = form.map(cl => Array(cl.length).fill(null));
    let clauseResults = Array(form.length).fill(null);

    const snapshot = (phase: AnimationPhase, clauseIdx: number, literalIdx: number, msg: string, final: boolean | null = null): void => {
      history.push({
        step: { clauseIndex: clauseIdx, literalIndex: literalIdx, phase },
        message: msg,
        literalResults: JSON.parse(JSON.stringify(literalResults)),
        clauseResults: [...clauseResults],
        finalResult: final
      });
    };

    snapshot('initial', -1, -1, "Initializing evaluation with the provided variable assignments.");

    for (let i = 0; i < form.length; i++) {
      let clauseIsTrue = false;
      for (let j = 0; j < form[i].length; j++) {
        const result = literalEval(form[i][j]);
        literalResults[i][j] = result;
        snapshot('literal', i, j, `Evaluating literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} in C${i + 1}... It is ${result ? 'TRUE' : 'FALSE'}.`);
        if (result) {
          clauseIsTrue = true;
          break;
        }
      }
      
      clauseResults[i] = clauseIsTrue;
      const msg = clauseIsTrue ? `C${i + 1} is TRUE because a true literal was found. Moving to next clause.` : `C${i + 1} is FALSE because all its literals were false.`;
      snapshot('clause', i, 0, msg);

      if (!clauseIsTrue) {
        snapshot('final', i, 0, `Formula is UNSATISFIABLE because C${i + 1} is FALSE, making the whole conjunction false.`, false);
        return history;
      }
    }

    snapshot('final', form.length - 1, 0, 'All clauses evaluated to TRUE. The formula is SATISFIABLE!', true);
    return history;
  }, []);
  
  const handleSetFormula = (newFormula: CNFFormula) => {
    setFormula(newFormula);
    const uniqueVars = [...new Set(newFormula.flatMap(c => c.map(l => l.variable)))].sort();
    setDistinctVariables(uniqueVars);
    const newAssignments: VariableAssignment = {};
    uniqueVars.forEach(v => { newAssignments[v] = manualAssignments[v] || false; });
    setManualAssignments(newAssignments);
    const history = generateAnimationHistory(newFormula, newAssignments);
    setAnimationHistory(history);
    setHistoryIndex(0);
    setIsAnimating(true);
    setIsPaused(true);
  };
  
  const regenerateVisualization = () => {
    if (!formula) return;
    const history = generateAnimationHistory(formula, manualAssignments);
    setAnimationHistory(history);
    setHistoryIndex(0);
    setIsAnimating(true);
    setIsPaused(true);
  };

  useEffect(() => {
    if (formula) {
      regenerateVisualization();
    }
  }, [manualAssignments]); 

  const handlePlayResume = () => {
    if (historyIndex >= animationHistory.length - 1) {
      regenerateVisualization();
      setTimeout(() => {
        setIsAnimating(true);
        setIsPaused(false);
      }, 100);
      return;
    }
    setIsAnimating(true);
    setIsPaused(false);
  };

  const handlePause = () => { setIsPaused(true); };
  const handleNextStep = () => { setIsPaused(true); setHistoryIndex(prev => Math.min(prev + 1, animationHistory.length - 1)); };
  const handlePreviousStep = () => { setIsPaused(true); setHistoryIndex(prev => Math.max(0, prev - 1)); };
  const handleRestart = () => { regenerateVisualization(); };

  const currentFrame = historyIndex > -1 ? animationHistory[historyIndex] : null;

  return (
    <Container sx={{ my: 2 }}>
      <Typography variant="h3" align="center" gutterBottom>CNF Formula Visualizer</Typography>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 1: Declare Variables</Typography><FormControl fullWidth><InputLabel>Number of Variables</InputLabel><Select value={String(numVariables)} label="Number of Variables" onChange={(e: SelectChangeEvent) => setNumVariables(Number(e.target.value))}>{[...Array(10).keys()].map(n => <MenuItem key={n + 1} value={String(n + 1)}>{n + 1}</MenuItem>)}</Select></FormControl></Paper>
      <Paper elevation={3} sx={{ p: 3, mb: 2 }}><Typography variant="h5" gutterBottom>Step 2: Create Formula</Typography><CNFInput setFormula={handleSetFormula} availableVariables={availableVariables} /></Paper>
      
      {formula && (
        <>
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Typography variant="h5" gutterBottom>Step 3: Assign Values Manually</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                {distinctVariables.map(v => (<FormControlLabel key={v} control={<Switch checked={!!manualAssignments[v]} onChange={(e) => setManualAssignments(p => ({ ...p, [v]: e.target.checked }))}/>} label={`${v}: ${manualAssignments[v] ? 'True' : 'False'}`}/>))}
            </Box>
          </Paper>
          
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5" gutterBottom sx={{mb: 0}}>Step 4: Visualize</Typography>
                {animationHistory.length > 0 && (
                    <AnimationControls
                        onPlay={handlePlayResume}
                        onPause={handlePause}
                        onRestart={handleRestart}
                        onNext={handleNextStep}
                        onPrevious={handlePreviousStep}
                        isAnimating={isAnimating}
                        isPaused={isPaused}
                        canStepForward={historyIndex < animationHistory.length - 1}
                        canStepBackward={historyIndex > 0}
                    />
                )}
            </Box>
            <Divider />
            
            {currentFrame ? (
                <>
                <Visualization
                    formula={formula}
                    assignment={manualAssignments}
                    literalResults={currentFrame.literalResults}
                    clauseResults={currentFrame.clauseResults}
                    animationStep={currentFrame.step}
                    animationMessage={isPaused ? `Paused. (Step: ${currentFrame.message})` : currentFrame.message}
                />
                {currentFrame.finalResult !== null && (
                    <Alert severity={currentFrame.finalResult ? 'success' : 'error'} sx={{ mt: 2 }}>
                    <Typography variant="h6">Final Result: The formula is {currentFrame.finalResult ? 'SATISFIABLE' : 'UNSATISFIABLE'} for this assignment.</Typography>
                    </Alert>
                )}
                </>
            ) : (
                <Typography sx={{mt: 2, color: 'text.secondary'}}>Visualization will appear here after setting the formula.</Typography>
            )}
          </Paper>
        </>
      )}
    </Container>
  );
};

export default VisualizePage;