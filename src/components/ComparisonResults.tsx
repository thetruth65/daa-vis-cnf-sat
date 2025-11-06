// src/components/ComparisonResults.tsx

import React from 'react';
import { Box, Typography } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonResultsProps {
  shortCircuitEvals: number;
  bruteForceEvals: number;
}

const ComparisonResults: React.FC<ComparisonResultsProps> = ({ shortCircuitEvals, bruteForceEvals }) => {

  const data = {
    labels: ['Short-Circuit (Optimized)', 'Naive Brute-Force'],
    datasets: [
      {
        label: 'Total Literal Evaluations',
        data: [shortCircuitEvals, bruteForceEvals],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Algorithmic Work Comparison',
        font: { size: 18 }
      },
    },
    scales: {
        y: {
            beginAtZero: true,
            title: {
                display: true,
                text: 'Number of Operations'
            }
        }
    }
  };

  const improvement = (((bruteForceEvals - shortCircuitEvals) / bruteForceEvals) * 100).toFixed(1);

  return (
    <Box sx={{ mt: 2 }}>
        <Typography variant="h6" align="center" gutterBottom>
            The short-circuit algorithm performed {shortCircuitEvals} operations, while the naive brute-force algorithm performed {bruteForceEvals} operations.
        </Typography>
        {bruteForceEvals > shortCircuitEvals && (
            <Typography variant="subtitle1" align="center" color="primary" gutterBottom>
                That's a {improvement}% reduction in work for this specific assignment!
            </Typography>
        )}
        <Box sx={{ maxWidth: '600px', mx: 'auto', p: 2 }}>
            <Bar options={options} data={data} />
        </Box>
    </Box>
  );
};

export default ComparisonResults;