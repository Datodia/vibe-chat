export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
};

export type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
};

export type AuthActions = {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
};

export type AuthStore = AuthState & AuthActions;
export type AuthStoreType = AuthStore;
