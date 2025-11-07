// File: components/FormTitle.tsx
import React from 'react';
import { Box, Typography } from '@mui/material';

interface FormTitleProps {
  title: string;
}

const FormTitle: React.FC<FormTitleProps> = ({ title }) => {
  return (
    <Box
      sx={{
        width: '400px',
        height: '24px',
        paddingTop: '5px',
        paddingBottom: '4px',
        textAlign: 'left'
      }}
    >
      <Typography
        variant="h1"
        sx={{
          fontSize: '24px',
          fontWeight: 600,
          lineHeight: '32px',
          color: '#3B3B3B',
          textTransform: 'capitalize'
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default FormTitle;