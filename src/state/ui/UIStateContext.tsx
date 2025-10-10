import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';
import type { PropsWithChildren } from 'react';

import { setLocation as persistLocation } from '../../services/location.service';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type UIState = {
  isAuthorized: boolean;
  isMaster: boolean;
  isLoading: boolean;
  location: Coordinates;
};

export type UIActions = {
  setAuthorization: (value: boolean) => void;
  setMaster: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setLocation: (value: Coordinates) => void;
};

const DEFAULT_STATE: UIState = {
  isAuthorized: false,
  isMaster: false,
  isLoading: true,
  location: {
    latitude: 59.9311,
    longitude: 30.3609,
  },
};

type Action =
  | { type: 'setAuthorization'; payload: boolean }
  | { type: 'setMaster'; payload: boolean }
  | { type: 'setLoading'; payload: boolean }
  | { type: 'setLocation'; payload: Coordinates };

function uiReducer(state: UIState, action: Action): UIState {
  switch (action.type) {
    case 'setAuthorization':
      return { ...state, isAuthorized: action.payload };
    case 'setMaster':
      return { ...state, isMaster: action.payload };
    case 'setLoading':
      return { ...state, isLoading: action.payload };
    case 'setLocation':
      return { ...state, location: action.payload };
    default:
      return state;
  }
}

const UIStateContext = createContext<UIState | undefined>(undefined);
const UIActionsContext = createContext<UIActions | undefined>(undefined);

export type UIStateProviderProps = PropsWithChildren<{ initialState?: Partial<UIState> }>;

export function UIStateProvider({ children, initialState }: UIStateProviderProps) {
  const mergedInitialState = useMemo<UIState>(() => ({
    ...DEFAULT_STATE,
    ...initialState,
    location: {
      ...DEFAULT_STATE.location,
      ...(initialState?.location ?? {}),
    },
  }), [initialState]);

  const [state, dispatch] = useReducer(uiReducer, mergedInitialState);

  const setAuthorization = useCallback<UIActions['setAuthorization']>((value) => {
    dispatch({ type: 'setAuthorization', payload: value });
  }, []);

  const setMaster = useCallback<UIActions['setMaster']>((value) => {
    localStorage.setItem('isMaster', String(value));
    dispatch({ type: 'setMaster', payload: value });
  }, []);

  const setLoading = useCallback<UIActions['setLoading']>((value) => {
    dispatch({ type: 'setLoading', payload: value });
  }, []);

  const setLocation = useCallback<UIActions['setLocation']>((value) => {
    persistLocation(value);
    dispatch({ type: 'setLocation', payload: value });
  }, []);

  const actions = useMemo<UIActions>(() => ({
    setAuthorization,
    setMaster,
    setLoading,
    setLocation,
  }), [setAuthorization, setMaster, setLoading, setLocation]);

  return (
    <UIActionsContext.Provider value={actions}>
      <UIStateContext.Provider value={state}>{children}</UIStateContext.Provider>
    </UIActionsContext.Provider>
  );
}

export function useUIState(): UIState {
  const context = useContext(UIStateContext);
  if (!context) {
    throw new Error('useUIState must be used within a UIStateProvider');
  }
  return context;
}

export function useUIActions(): UIActions {
  const context = useContext(UIActionsContext);
  if (!context) {
    throw new Error('useUIActions must be used within a UIStateProvider');
  }
  return context;
}
