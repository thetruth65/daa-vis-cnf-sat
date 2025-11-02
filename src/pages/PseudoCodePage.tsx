// src/pages/PseudoCodePage.tsx

import React from 'react';
import { Container, Paper, Typography, Box } from '@mui/material';

const PseudoCodePage: React.FC = () => {
  const codeStyle = {
    backgroundColor: '#2d2d2d',
    color: '#f8f8f2',
    padding: '20px',
    borderRadius: '8px',
    fontFamily: 'monospace',
    fontSize: '1rem',
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    lineHeight: '1.6',
  };

  const keyword = { color: '#ff79c6' };
  const func = { color: '#50fa7b' };
  const comment = { color: '#6272a4' };
  const variable = { color: '#8be9fd' };
  const logical = { color: '#f1fa8c' };
  const string = { color: '#f1fa8c' };

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Visualizer Algorithm Pseudo-code
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ mb: 3 }}>
          This pseudo-code reflects the exact "short-circuiting" logic used in the visualizer.
        </Typography>
        <Box sx={codeStyle}>
          <span style={keyword}>function</span> <span style={func}>generateAnimationHistory</span>(<span style={variable}>formula</span>, <span style={variable}>assignments</span>) &#123;
          <br />
          {'  '}<span style={variable}>history</span> = <span style={keyword}>new</span> <span style={variable}>List</span>();
          <br />
          <br />
          {'  '}<span style={comment}>// Frame 0: Initial state of the visualization</span>
          <br />
          {'  '}<span style={func}>addSnapshot</span>(<span style={variable}>history</span>, <span style={string}>"Initializing evaluation..."</span>);
          <br />
          <br />
          {'  '}<span style={comment}>// Loop through each clause (C1, C2, ...)</span>
          <br />
          {'  '}<span style={keyword}>for each</span> <span style={variable}>clause</span> <span style={keyword}>in</span> <span style={variable}>formula</span> &#123;
          <br />
          {'    '}<span style={variable}>clauseIsTrue</span> = <span style={logical}>false</span>;
          <br />
          <br />
          {'    '}<span style={comment}>// Loop through each literal within the current clause</span>
          <br />
          {'    '}<span style={keyword}>for each</span> <span style={variable}>literal</span> <span style={keyword}>in</span> <span style={variable}>clause</span> &#123;
          <br />
          {'      '}<span style={variable}>result</span> = <span style={func}>evaluateLiteral</span>(<span style={variable}>literal</span>, <span style={variable}>assignments</span>);
          <br />
          {'      '}<span style={func}>addSnapshot</span>(<span style={variable}>history</span>, <span style={string}>"Evaluating literal..."</span>, <span style={variable}>result</span>);
          <br />
          <br />
          {'      '}<span style={comment}>// --- OPTIMIZATION 1: Short-circuiting a Clause ---</span>
          <br />
          {'      '}<span style={keyword}>if</span> (<span style={variable}>result</span> === <span style={logical}>true</span>) &#123;
          <br />
          {'        '}<span style={variable}>clauseIsTrue</span> = <span style={logical}>true</span>;
          <br />
          {'        '}<span style={comment}>// A single TRUE makes the whole clause TRUE. Stop checking other literals.</span>
          <br />
          {'        '}<span style={keyword}>break</span>;
          <br />
          {'      '}&#125;
          <br />
          {'    '}&#125;
          <br />
          <br />
          {'    '}<span style={func}>addSnapshot</span>(<span style={variable}>history</span>, <span style={string}>"Clause result is..."</span>, <span style={variable}>clauseIsTrue</span>);
          <br />
          <br />
          {'    '}<span style={comment}>// --- OPTIMIZATION 2: Short-circuiting the Formula ---</span>
          <br />
          {'    '}<span style={keyword}>if</span> (<span style={variable}>clauseIsTrue</span> === <span style={logical}>false</span>) &#123;
          <br />
          {'      '}<span style={comment}>// A single FALSE clause makes the whole formula FALSE. Stop checking other clauses.</span>
          <br />
          {'      '}<span style={func}>addSnapshot</span>(<span style={variable}>history</span>, <span style={string}>"UNSATISFIABLE"</span>, <span style={logical}>false</span>);
          <br />
          {'      '}<span style={keyword}>return</span> <span style={variable}>history</span>; <span style={comment}>// Early exit</span>
          <br />
          {'    '}&#125;
          <br />
          {'  '}&#125;
          <br />
          <br />
          {'  '}<span style={comment}>// If we finish the loop, it means all clauses were TRUE</span>
          <br />
          {'  '}<span style={func}>addSnapshot</span>(<span style={variable}>history</span>, <span style={string}>"SATISFIABLE"</span>, <span style={logical}>true</span>);
          <br />
          {'  '}<span style={keyword}>return</span> <span style={variable}>history</span>;
          <br />
          &#125;
        </Box>
      </Paper>
    </Container>
  );
};

export default PseudoCodePage;