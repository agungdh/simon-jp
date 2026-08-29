'use client';

import { useEffect, useState } from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import { fetchMe, login, logout, ApiError, type SessionUser } from './api';

export default function App() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setSubmitting(true);
    try {
      const u = await login(nip, password);
      setUser(u);
      setPassword('');
    } catch (err) {
      if (err instanceof ApiError && err.errors) {
        setFieldErrors(err.errors);
      } else {
        setError(err instanceof Error ? err.message : 'Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    setError(null);
    try {
      await logout();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography color="text.secondary">Memuat…</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Stack spacing={3}>
        <Typography variant="h4" component="h1" fontWeight={700} textAlign="center">
          SIMON JP
        </Typography>

        {error && <Alert severity="error">{error}</Alert>}

        {user ? (
          <Card elevation={3}>
            <CardContent>
              <Stack spacing={2} alignItems="center">
                <Typography variant="h6">Halo, {user.nama}</Typography>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    NIP
                  </Typography>
                  <Typography variant="body1">{user.nip}</Typography>
                </Box>
                <Button variant="outlined" color="error" onClick={handleLogout}>
                  Logout
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Card elevation={3}>
            <CardContent>
              <Stack
                component="form"
                spacing={2}
                onSubmit={handleLogin}
                noValidate
              >
                <Typography variant="h6">Login</Typography>
                <TextField
                  label="NIP"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                    setFieldErrors((f) => {
                      if (!f.nip) return f;
                      const { nip: _nip, ...rest } = f;
                      return rest;
                    });
                  }}
                  error={Boolean(fieldErrors.nip)}
                  helperText={fieldErrors.nip}
                  fullWidth
                  required
                  autoFocus
                />
                <TextField
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setFieldErrors((f) => {
                      if (!f.password) return f;
                      const { password: _password, ...rest } = f;
                      return rest;
                    });
                  }}
                  error={Boolean(fieldErrors.password)}
                  helperText={fieldErrors.password}
                  fullWidth
                  required
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  fullWidth
                >
                  {submitting ? 'Masuk…' : 'Login'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        )}
      </Stack>
    </Container>
  );
}
