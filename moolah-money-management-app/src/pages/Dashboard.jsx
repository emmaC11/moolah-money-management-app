import { Typography, Container, Box, CssBaseline } from '@mui/material';

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
        <Box>
          <Typography variant="h4" sx={{color: 'var(--primary-green-dark)', fontWeight: 700, mb: 1 }}>
            Budget Overview
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Manage and compare all your budgets
          </Typography>
        </Box>
        {/* todo: add budget button */}
    </Container>
  )
}