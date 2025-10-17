import { useCallback, useMemo } from 'react';

import { setLocation as persistLocation } from '../services/location.service';
import {
  getGlobal,
  isGlobalExists,
  setGlobal,
  useGlobalState,
} from './global';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

type UIState = {
  isAuthorized: boolean;
  isMaster: boolean;
  isLoading: boolean;
  location: Coordinates;
};

type UIActions = {
  setAuthorization: (value: boolean) => void;
  setMaster: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setLocation: (value: Coordinates) => void;
};

const DEFAULT_LOCATION: Coordinates = {
  latitude: 59.9311,
  longitude: 30.3609,
};

const UI_KEYS = {
  isAuthorized: 'ui:isAuthorized',
  isMaster: 'ui:isMaster',
  isLoading: 'ui:isLoading',
  location: 'ui:location',
} as const;

const DEFAULT_VALUES: Record<string, unknown> = {
  [UI_KEYS.isAuthorized]: false,
  [UI_KEYS.isMaster]: false,
  [UI_KEYS.isLoading]: true,
  [UI_KEYS.location]: DEFAULT_LOCATION,
};

Object.entries(DEFAULT_VALUES).forEach(([key, value]) => {
  if (!isGlobalExists(key)) {
    setGlobal(key, value);
  }
});

function resolveBoolean(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    return value === 'true';
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  return fallback;
}

function resolveLocation(value: unknown): Coordinates {
  if (
    value &&
    typeof value === 'object' &&
    'latitude' in value &&
    'longitude' in value
  ) {
    const latitude = Number((value as Coordinates).latitude);
    const longitude = Number((value as Coordinates).longitude);

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  }

  return DEFAULT_LOCATION;
}

export function useUIState(): UIState {
  const isAuthorized =
    useGlobalState<boolean | string | number>(UI_KEYS.isAuthorized) ?? false;
  const isMaster =
    useGlobalState<boolean | string | number>(UI_KEYS.isMaster) ?? false;
  const isLoading =
    useGlobalState<boolean | string | number>(UI_KEYS.isLoading) ?? true;
  const location = useGlobalState<Coordinates>(UI_KEYS.location);

  return useMemo(
    () => ({
      isAuthorized: resolveBoolean(isAuthorized, false),
      isMaster: resolveBoolean(isMaster, false),
      isLoading: resolveBoolean(isLoading, true),
      location: resolveLocation(location),
    }),
    [isAuthorized, isMaster, isLoading, location],
  );
}

export function useUIActions(): UIActions {
  const setAuthorization = useCallback<UIActions['setAuthorization']>(
    (value) => {
      setGlobal(UI_KEYS.isAuthorized, Boolean(value));
    },
    [],
  );

  const setMaster = useCallback<UIActions['setMaster']>((value) => {
    const normalized = Boolean(value);
    localStorage.setItem('isMaster', String(normalized));
    setGlobal(UI_KEYS.isMaster, normalized);
  }, []);

  const setLoading = useCallback<UIActions['setLoading']>((value) => {
    setGlobal(UI_KEYS.isLoading, Boolean(value));
  }, []);

  const setLocation = useCallback<UIActions['setLocation']>((value) => {
    persistLocation(value);
    setGlobal(UI_KEYS.location, {
      latitude: value.latitude,
      longitude: value.longitude,
    });
  }, []);

  return useMemo(
    () => ({
      setAuthorization,
      setMaster,
      setLoading,
      setLocation,
    }),
    [setAuthorization, setMaster, setLoading, setLocation],
  );
}

export function setAuthorization(value: boolean): void {
  setGlobal(UI_KEYS.isAuthorized, Boolean(value));
}

export function setMaster(value: boolean): void {
  const normalized = Boolean(value);
  localStorage.setItem('isMaster', String(normalized));
  setGlobal(UI_KEYS.isMaster, normalized);
}

export function setLoading(value: boolean): void {
  setGlobal(UI_KEYS.isLoading, Boolean(value));
}

export function setLocation(value: Coordinates): void {
  persistLocation(value);
  setGlobal(UI_KEYS.location, {
    latitude: value.latitude,
    longitude: value.longitude,
  });
}

export function getUILocation(): Coordinates {
  return resolveLocation(getGlobal(UI_KEYS.location));
}
