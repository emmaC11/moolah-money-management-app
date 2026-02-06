import { Typography, Container, Box, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import SavingsIcon from '@mui/icons-material/Savings';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export default function Dashboard() {
  const navigate = useNavigate();

  const navCards = [
    {
      title: '01 Create a Budget',
      description: 'Set up a budget to track your income and stay on top of your expenses.',
      icon: <AccountBalanceWalletIcon sx={{ fontSize: 32 }} />,
      path: '/budgets',
      backgroundColor: '#E0F2FE',
      iconColor: '#0369A1'
    },
    {
      title: '02 Add Transactions',
      description: 'Track your spending habits with easy transaction entry. Remember to record each expense and income!',
      icon: <ReceiptLongIcon sx={{ fontSize: 32 }} />,
      path: '/transactions',
      backgroundColor: '#FED7AA',
      iconColor: '#C2410C'
    },
    {
      title: '03 Set a Goal',
      description: 'Create savings goals that match your dreams and aspirations for the future.',
      icon: <SavingsIcon sx={{ fontSize: 32 }} />,
      path: '/goals',
      backgroundColor: '#E9D5FF',
      iconColor: '#7C3AED'
    },
    {
      title: '04 Review Progress',
      description: 'See your progress, celebrate your wins, and adjust your strategy for continued success.',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      path: '/budgets',
      backgroundColor: '#DCFCE7',
      iconColor: '#16A34A'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 8, mb: 4 }}>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            color: 'var(--text-primary)', 
            fontWeight: 700, 
            mb: 2 
          }}
        >
          Moolah Money Management
        </Typography>
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'var(--text-secondary)',
          }}
        >
          Your journey to financial wellness starts here. Follow these simple steps to take control of your money and grow your wealth.
        </Typography>
      </Box>

      {/* Navigation Cards Grid */}
      <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
          gap: 3 
        }}
      >
        {navCards.map((card) => (
          <Card sx={{ 
              backgroundColor: card.backgroundColor,
              border: 'none',
            }}
          >
            <CardContent sx={{ p: 5 }}>
              {/* Icon */}
              <Box 
                sx={{ 
                  width: 56, 
                  height: 56, 
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  color: card.iconColor
                }}
              >
                {card.icon}
              </Box>

              {/* Content */}
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    mb: 1
                  }}
                >
                  {card.title}
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6
                  }}
                >
                  {card.description}
                </Typography>
              </Box>

              {/* Button */}
              <Button
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleNavigation(card.path)}
                sx={{
                  backgroundColor: card.iconColor,
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                }}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Container>
  );
}