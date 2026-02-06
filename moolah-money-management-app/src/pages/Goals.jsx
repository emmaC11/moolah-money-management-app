import { Typography, Container, Box, Card, CardContent, Button, IconButton,LinearProgress,Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Sample goals data - to be replaced with dynamic data
const goalsData = [
  { 
    id: 1, 
    name: 'Rainy Day Fund', 
    type: 'emergency-fund',
    description: 'Build an emergency fund to cover unexpected expenses like medical bills or job loss.',
    target: 15000, 
    current: 12500,
    deadline: 'Dec 15, 2025',
    status: 'on-track'
  },
  { 
    id: 2, 
    name: 'iPhone 15', 
    type: 'new-gadget',
    description: 'Save for the latest tech, from smartphones to laptops.',
    target: 5000, 
    current: 3000,
    deadline: 'Sep 5, 2026',
    status: 'on-track'
  },
  { 
    id: 3, 
    name: 'Birthday Party', 
    type: 'tentative-plan',
    description: '',
    target: 2500, 
    current: 2500,
    deadline: 'Jan 30, 2025',
    status: 'on-track'
  },
  { 
    id: 4, 
    name: 'Debt Repayment - Credit Card', 
    type: 'debt-repayment',
    description: 'Pay off high-interest debts like credit cards or student loans to reduce financial stress.',
    target: 7500, 
    current: 0,
    deadline: '',
    status: ''
  },
];

export default function Goals() {
  
  const totalGoals = goalsData.length;
  const totalSaved = goalsData.reduce((sum, goal) => sum + goal.current, 0);
  const totalTarget = goalsData.reduce((sum, goal) => sum + goal.target, 0);

  const calculateProgress = (current, target) => {
    return (current / target) * 100;
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ color: 'var(--primary-green-dark)', fontWeight: 700, mb: 1 }}>
            Savings Goals
          </Typography>
          <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
            Track your progress towards financial milestones
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            backgroundColor: 'var(--primary-green)',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'var(--primary-green-dark)'
            }
          }}
        >
          Create New Goal
        </Button>
      </Box>

      {/* Summary Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        {/* Active Goals Card */}
        <Card sx={{ backgroundColor: '#E0E7FF', border: 'none', boxShadow: 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <SavingsIcon sx={{ color: '#3730A3', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, color: '#3730A3' }}>
              {totalGoals}
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
              Active Goals
            </Typography>
          </CardContent>
        </Card>

        {/* Total Saved Card */}
        <Card sx={{ backgroundColor: '#DCFCE7', border: 'none', boxShadow: 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <TrendingUpIcon sx={{ color: 'var(--primary-green)', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, color: 'var(--primary-green)' }}>
              €{totalSaved.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
              Total Saved
            </Typography>
          </CardContent>
        </Card>

        {/* Total Target Card */}
        <Card sx={{ backgroundColor: '#FEF3C7', border: 'none', boxShadow: 'none' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <AccountBalanceIcon sx={{ color: '#92400E', fontSize: 20 }} />
            </Box>
            <Typography variant="h5" sx={{ textAlign: 'center', fontWeight: 600, color: '#92400E' }}>
              €{totalTarget.toLocaleString()}
            </Typography>
            <Typography variant="caption" sx={{ textAlign: 'center', display: 'block', color: 'var(--text-secondary)' }}>
              Total Target
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Goals List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {goalsData.map((goal) => {
          const progress = calculateProgress(goal.current, goal.target);

          return (
            <Card key={goal.id} sx={{ border: '1px solid var(--border)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {goal.name}
                      </Typography>
                      <Chip 
                        label={goal.type.replace(/-/g, ' ')} 
                        size="small" 
                        sx={{ 
                          backgroundColor: '#E0E7FF',
                          color: '#3730A3',
                          height: 20,
                          textTransform: 'capitalize'
                        }} 
                      />
                    </Box>
                    {goal.description && (
                      <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 2 }}>
                        {goal.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                          Target
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          €{goal.target.toLocaleString()}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                          Current
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          €{goal.current.toLocaleString()}
                        </Typography>
                      </Box>
                      {goal.deadline && (
                        <Box>
                          <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                            Deadline
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {goal.deadline}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    {/* Progress Bar */}
                    <Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)' }}>
                          Progress
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                          {progress.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={progress > 100 ? 100 : progress} 
                        sx={{ 
                          height: 8, 
                          borderRadius: 1,
                          backgroundColor: '#E5E7EB',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: progress >= 100 ? 'var(--primary-green)' : '#3B82F6'
                          }
                        }} 
                      />
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', mt: 0.5, display: 'block' }}>
                        €{goal.current.toLocaleString()} of €{goal.target.toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Button 
                      size="small" 
                      variant="outlined"
                      sx={{ 
                        textTransform: 'none',
                        borderColor: 'var(--primary-green)',
                        color: 'var(--primary-green-dark)',
                        '&:hover': {
                          borderColor: 'var(--primary-green-dark)',
                          backgroundColor: 'var(--success-light)'
                        }
                      }}
                    >
                      Add Money
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
          );
        })}
      </Box>
    </Container>
  );
}