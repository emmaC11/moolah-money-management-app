import { Typography, Container, Box, CssBaseline, Card, CardContent, Button, IconButton  } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function Budgets() {
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
        {/* Active Budget Card */}
        <Card sx={{ mb: 3, mt: 3, border: '1px solid var(--border)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', mb: 0.5 }}>
                  Active Budget
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Budget Name Hardcoded
                </Typography>
              </Box>
            </Box>

            {/* Summary Cards */}
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
              {/* Income Card */}
              <Card sx={{ backgroundColor: '#DCFCE7', border: 'none', boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ color: 'var(--primary-green)', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary-green)' }}>
                    €6,500.00 hardcoded
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
                    Monthly Income
                  </Typography>
                </CardContent>
              </Card>

              {/* Expenses Card */}
              <Card sx={{ backgroundColor: '#FEE2E2', border: 'none', boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <TrendingDownIcon sx={{ color: 'var(--error)', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, color: 'var(--error)' }}>
                    €0.00 hardcoded
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
                    Monthly Expenses
                  </Typography>
                </CardContent>
              </Card>

              {/* Balance Card */}
              <Card sx={{ backgroundColor: '#F3F4F6', border: 'none', boxShadow: 'none' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <AccountBalanceWalletIcon sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
                  </Box>
                  <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600 }}>
                    €6,500.00 hardcoded
                  </Typography>
                  <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
                    Net Balance
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </CardContent>
        </Card>

        {/* Active Budget Section*/}
        <Card sx={{ border: '1px solid var(--border)' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ flex: 1 }}>
                {/* todo: update hardcoded values */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Budget 1 Hardcoded
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 2, mt: 1 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Income</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>€11,850.00</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Expenses</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>€0.00</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Balance</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>€11,850.00</Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>Created</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Dec 5, 2025</Typography>
                  </Box>
                  </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" startIcon={<MoreVertIcon />} sx={{ textTransform: 'none', color: 'var(--text-secondary)' }}>
                  Set Active
                </Button>
                <IconButton size="small">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton size="small" sx={{ color: 'var(--error)' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
    </Container>

    
  )
}