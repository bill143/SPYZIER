import { useSelector } from 'react-redux';
import { RootState } from '../store';

export const useAuth = () => {
  const { user, isAuthenticated, loading, error, accessToken } = useSelector(
    (state: RootState) => state.auth
  );
  return { user, isAuthenticated, loading, error, accessToken };
};

export default useAuth;
