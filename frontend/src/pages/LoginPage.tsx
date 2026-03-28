import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  InputAdornment,
  IconButton,
  Alert,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useSnackbar } from 'notistack';
import { AppDispatch, RootState } from '../store';
import { loginUser } from '../store/authSlice';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  const { enqueueSnackbar } = useSnackbar();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      enqueueSnackbar('Please enter username and password', { variant: 'warning' });
      return;
    }
    const result = await dispatch(loginUser({ username: username.trim(), password }));
    if (loginUser.fulfilled.match(result)) {
      enqueueSnackbar('Welcome back!', { variant: 'success' });
      navigate(from, { replace: true });
    } else {
      enqueueSnackbar(result.payload as string || 'Login failed', { variant: 'error' });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1a2e 50%, #0a1628 100%)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '20%',
          left: '10%',
          width: 400,
          height: 400,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,180,216,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '10%',
          right: '5%',
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,119,182,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        },
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 440, px: 2, position: 'relative', zIndex: 1 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
              boxShadow: '0 8px 32px rgba(0, 180, 216, 0.4)',
            }}
          >
            <Typography sx={{ color: '#fff', fontWeight: 900, fontSize: '1.8rem' }}>S</Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(135deg, #00B4D8, #48CAE4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            SPYZIER
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, letterSpacing: '0.15em', fontSize: '0.75rem' }}>
            FLEET MONITORING SYSTEM
          </Typography>
        </Box>

        {/* Card */}
        <Card
          sx={{
            background: 'rgba(17, 24, 39, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 180, 216, 0.15)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={700} mb={0.5}>
              Sign In
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Enter your credentials to access the dashboard
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <TextField
                fullWidth
                label="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                autoComplete="username"
                autoFocus
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((s) => !s)}
                        edge="end"
                        size="small"
                        sx={{ color: 'text.secondary' }}
                      >
                        {showPassword ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="small"
                    sx={{ color: '#00B4D8', '&.Mui-checked': { color: '#00B4D8' } }}
                  />
                }
                label={<Typography variant="body2" color="text.secondary">Remember me</Typography>}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  background: 'linear-gradient(135deg, #00B4D8, #0077B6)',
                  fontSize: '1rem',
                  fontWeight: 700,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #48CAE4, #00B4D8)',
                  },
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign In'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 3 }}>
          © {new Date().getFullYear()} SPYZIER Fleet Monitor. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;
