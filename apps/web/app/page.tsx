import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

export default function Home() {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3" component="h1" fontWeight={700}>
          SIMON JP
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Frontend Next.js + MUI siap digunakan.
        </Typography>
        <Button variant="contained" size="large">
          Get Started
        </Button>
      </Stack>
    </Container>
  );
}
