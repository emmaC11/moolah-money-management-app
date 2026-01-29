import { Typography, Container, Box, CssBaseline } from '@mui/material';
import Navbar from '../components/common/Navbar.jsx';

export default function Dashboard() {
  return (
    <>
      <Box>
        <Navbar />
        <Container>
          <Typography>
              Dashboard Component
          </Typography>
          <Typography>
              Welcome to Moolah! Your financial overview will appear here.
          </Typography>
        </Container> 
      </Box>
    </>
  )
}