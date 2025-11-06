// // src/pages/VisualizePage.tsx

// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import type { SelectChangeEvent } from '@mui/material';
// import type { CNFFormula, VariableAssignment, Literal } from '../types';
// import CNFInput from '../components/CNFInput.tsx';
// import Visualization from '../components/Visualization.tsx';
// import AnimationControls from '../components/AnimationControls.tsx';
// import { Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem, Switch, FormControlLabel, Alert, Divider } from '@mui/material';

// type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';
// type AnimationFrame = {
//   step: { clauseIndex: number; literalIndex: number; phase: AnimationPhase };
//   message: string;
//   literalResults: (boolean | null)[][];
//   clauseResults: (boolean | null)[];
//   finalResult: boolean | null;
// };

// const VisualizePage: React.FC = () => {
//   const [numVariables, setNumVariables] = useState(3);
//   const [formula, setFormula] = useState<CNFFormula | null>(null);
//   const [distinctVariables, setDistinctVariables] = useState<string[]>([]);
//   const [manualAssignments, setManualAssignments] = useState<VariableAssignment>({});
//   const [animationHistory, setAnimationHistory] = useState<AnimationFrame[]>([]);
//   const [historyIndex, setHistoryIndex] = useState(-1);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);

//   const availableVariables = useMemo(() => Array.from({ length: numVariables }, (_, i) => `x${i + 1}`), [numVariables]);

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

//   const generateAnimationHistory = useCallback((form: CNFFormula, ass: VariableAssignment): AnimationFrame[] => {
//     const history: AnimationFrame[] = [];
//     const literalEval = (lit: Literal): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);
    
//     // --- THIS IS THE FIX: The 'clauseEval' from the previous version was here and is now removed. ---
    
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

//     snapshot('initial', -1, -1, "Initializing evaluation with the provided variable assignments.");

//     for (let i = 0; i < form.length; i++) {
//       let clauseIsTrue = false;
//       for (let j = 0; j < form[i].length; j++) {
//         const result = literalEval(form[i][j]);
//         literalResults[i][j] = result;
//         snapshot('literal', i, j, `Evaluating literal ${form[i][j].negated ? '¬' : ''}${form[i][j].variable} in C${i + 1}... It is ${result ? 'TRUE' : 'FALSE'}.`);
//         if (result) {
//           clauseIsTrue = true;
//           break;
//         }
//       }
      
//       clauseResults[i] = clauseIsTrue;
//       const msg = clauseIsTrue ? `C${i + 1} is TRUE because a true literal was found. Moving to next clause.` : `C${i + 1} is FALSE because all its literals were false.`;
//       snapshot('clause', i, 0, msg);

//       if (!clauseIsTrue) {
//         snapshot('final', i, 0, `Formula is UNSATISFIABLE because C${i + 1} is FALSE, making the whole conjunction false.`, false);
//         return history;
//       }
//     }

//     snapshot('final', form.length - 1, 0, 'All clauses evaluated to TRUE. The formula is SATISFIABLE!', true);
//     return history;
//   }, []);
  
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
//     if (!formula) return;
//     const history = generateAnimationHistory(formula, manualAssignments);
//     setAnimationHistory(history);
//     setHistoryIndex(0);
//     setIsAnimating(true);
//     setIsPaused(true);
//   };

//   useEffect(() => {
//     if (formula) {
//       regenerateVisualization();
//     }
//   }, [manualAssignments]); 

//   const handlePlayResume = () => {
//     if (historyIndex >= animationHistory.length - 1) {
//       regenerateVisualization();
//       setTimeout(() => {
//         setIsAnimating(true);
//         setIsPaused(false);
//       }, 100);
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
// --- NEW IMPORTS ---
import {
  Typography, Container, Box, Paper, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Alert, Divider, Chip, Button, List, ListItem, ListItemText, ListItemIcon
} from '@mui/material';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

type AnimationPhase = 'initial' | 'literal' | 'clause' | 'final' | 'done';
type AnimationFrame = {
  step: { clauseIndex: number; literalIndex: number; phase: AnimationPhase };
  message: string;
  literalResults: (boolean | null)[][];
  clauseResults: (boolean | null)[];
  finalResult: boolean | null;
};

// --- NEW HELPER FUNCTION TO QUICKLY EVALUATE A FORMULA ---
const isFormulaSatisfied = (formula: CNFFormula, assignment: VariableAssignment): boolean => {
  // 'every' clause must be true
  return formula.every(clause => {
    // 'some' literal in the clause must be true
    return clause.some(literal => {
      const value = assignment[literal.variable];
      return literal.negated ? !value : value;
    });
  });
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
  
  // --- NEW STATE TO STORE THE HINTS ---
  const [satisfyingAssignments, setSatisfyingAssignments] = useState<VariableAssignment[]>([]);


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
  
  // --- NEW FUNCTION TO FIND ALL SOLUTIONS (HINTS) ---
  const findAllSatisfyingAssignments = (form: CNFFormula, vars: string[]) => {
      const solutions: VariableAssignment[] = [];
      const numVars = vars.length;
      const totalCombinations = 1 << numVars; // Same as 2^n

      // Iterate through all possible truth assignments (0 to 2^n - 1)
      for (let i = 0; i < totalCombinations; i++) {
          const currentAssignment: VariableAssignment = {};
          
          // Generate the assignment for this combination
          vars.forEach((variable, index) => {
              // Use bitwise operations to check if the j-th bit is set
              // This maps i=0 to (F,F,F), i=1 to (F,F,T), etc.
              currentAssignment[variable] = ((i >> index) & 1) === 1;
          });
          
          // If this assignment satisfies the formula, add it to our list
          if (isFormulaSatisfied(form, currentAssignment)) {
              solutions.push(currentAssignment);
          }
      }
      
      setSatisfyingAssignments(solutions);
  };

  const generateAnimationHistory = useCallback((form: CNFFormula, ass: VariableAssignment): AnimationFrame[] => {
    const history: AnimationFrame[] = [];
    const literalEval = (lit: Literal): boolean => (lit.negated ? !ass[lit.variable] : ass[lit.variable]);
    
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

    // --- TRIGGER FINDING HINTS AND GENERATING ANIMATION ---
    findAllSatisfyingAssignments(newFormula, uniqueVars);
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
  
  // --- NEW HANDLER TO APPLY A HINT ---
  const applyHint = (assignment: VariableAssignment) => {
    setManualAssignments(assignment);
  };


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

          {/* --- NEW UI SECTION FOR HINTS --- */}
          <Paper elevation={3} sx={{ p: 3, my: 2 }}>
            <Typography variant="h5" gutterBottom>Step 3.5: Satisfying Assignments (Hints)</Typography>
            <Divider sx={{ mb: 2 }} />
            {satisfyingAssignments.length > 0 ? (
                <Box>
                    <Typography color="text.secondary" sx={{mb: 2}}>
                        Found {satisfyingAssignments.length} solution(s). Click "Apply" to load an assignment and visualize it.
                    </Typography>
                    <List dense>
                        {satisfyingAssignments.map((solution, index) => (
                            <ListItem key={index} secondaryAction={
                                <Button variant="outlined" size="small" onClick={() => applyHint(solution)}>
                                    Apply
                                </Button>
                            } sx={{mb: 1, bgcolor: 'action.hover', borderRadius: 1}}>
                                <ListItemIcon><LightbulbOutlinedIcon color="primary" /></ListItemIcon>
                                <ListItemText primary={
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {Object.entries(solution).map(([variable, value]) => (
                                            <Chip 
                                                key={variable}
                                                icon={value ? <CheckCircleIcon /> : <CancelIcon />}
                                                label={`${variable}: ${value ? 'T' : 'F'}`}
                                                color={value ? 'success' : 'error'}
                                                variant="outlined"
                                                size="small"
                                            />
                                        ))}
                                    </Box>
                                } />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            ) : (
                <Alert severity="warning">No satisfying assignments were found for this formula. It is unsatisfiable.</Alert>
            )}
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