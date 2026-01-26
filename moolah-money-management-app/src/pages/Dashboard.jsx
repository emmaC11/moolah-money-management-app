import { Typography, Container } from '@mui/material';

export default function Dashboard() {
  return (
    <div>
     <Container maxWidth="lg">
        <Typography>
            Dashboard Component
        </Typography>
        <Typography>
            Welcome to Moolah! Your financial overview will appear here.
        </Typography>
    </Container> 
    </div>
  )
}
