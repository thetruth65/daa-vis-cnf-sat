import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const About: React.FC = () => {
  return (
    <Paper elevation={3} sx={{ padding: 3, margin: 2 }}>
      <Typography variant="h4" gutterBottom>
        About the CNF Formula Visualizer
      </Typography>
      <Typography paragraph>
        This tool is an educational visualizer for the Boolean Satisfiability Problem (SAT) for formulas in Conjunctive Normal Form (CNF). A CNF formula is a conjunction (AND) of clauses, where each clause is a disjunction (OR) of literals. A literal is a variable or its negation.
      </Typography>
      <Typography paragraph>
        The visualizer uses a brute-force approach to find a satisfying assignment of truth values (True/False) to the variables. It iterates through all possible assignments and, for each one, checks if the formula evaluates to True.
      </Typography>
      <Typography variant="h5" gutterBottom>
        How it Works
      </Typography>
      <Typography paragraph>
        1.  **Input a CNF Formula:** Use the interactive form to create your formula.
        2.  **Visualization:** The visualizer will test each possible assignment of truth values to the variables.
        3.  **Step-by-Step Evaluation:** For each assignment, you will see the clauses being evaluated. A clause turns green if it is true and red if it is false.
        4.  **Satisfiability:** If an assignment makes all clauses true, the formula is satisfiable, and the visualizer will highlight this solution.
      </Typography>
      <Typography variant="h5" gutterBottom>
        Pseudo-code for the Brute-Force SAT Solver
      </Typography>
      <Box component="pre" sx={{ backgroundColor: '#2e2e2e', padding: 2, borderRadius: 1, overflowX: 'auto' }}>
        <code>
          {`
function isSatisfiable(formula):
  variables = getAllVariables(formula)
  n = numberOfVariables(variables)
  
  for i from 0 to 2^n - 1:
    assignment = generateAssignment(variables, i)
    if evaluateFormula(formula, assignment) is True:
      return "SATISFIABLE", assignment
      
  return "UNSATISFIFIABLE", null

function evaluateFormula(formula, assignment):
  for each clause in formula:
    if evaluateClause(clause, assignment) is False:
      return False
  return True

function evaluateClause(clause, assignment):
  for each literal in clause:
    if evaluateLiteral(literal, assignment) is True:
      return True
  return False
          `}
        </code>
      </Box>
    </Paper>
  );
};

export default About;