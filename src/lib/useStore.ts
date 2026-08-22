import { useEffect, useState, useCallback } from 'react';
import { store } from './store';
import type { UserProfile } from './types';

/** Re-renders whenever the store state changes. */
export function useStore() {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const unsub = store.subscribe(rerender);
    return () => { unsub(); };
  }, [rerender]);

  return store;
}

/** Returns the current logged-in user, or null. */
export function useCurrentUser(): UserProfile | null {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const unsub = store.subscribe(rerender);
    return () => { unsub(); };
  }, [rerender]);

  return store.currentUser();
}

/** Returns true while the initial auth token is being validated. */
export function useIsInitializing(): boolean {
  const [, setTick] = useState(0);
  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const unsub = store.subscribe(rerender);
    return () => { unsub(); };
  }, [rerender]);

  return store.isInitializing();
}
