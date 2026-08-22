/**
 * store.ts — API-backed store replacing the old localStorage mock.
 *
 * All methods that hit the network are async. The store keeps a small
 * in-memory cache of the current user and bookings so React components
 * can read synchronously after the initial load.
 */

import { api, setToken, clearToken, getToken } from './api';
import type { UserProfile, Booking, DayKey, DayAvailability } from './types';

type Listener = () => void;

interface StoreState {
  currentUser: UserProfile | null;
  bookings: Booking[];
  /** true while the initial auth check is in flight */
  initializing: boolean;
}

let state: StoreState = {
  currentUser: null,
  bookings: [],
  initializing: true,
};

const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

function setState(patch: Partial<StoreState>) {
  state = { ...state, ...patch };
  notify();
}

// --- Init: restore session from stored token on page load ---
(async () => {
  if (!getToken()) {
    setState({ initializing: false });
    return;
  }
  try {
    const { user } = await api.get<{ user: UserProfile }>('/auth/me');
    setState({ currentUser: user, initializing: false });
  } catch {
    clearToken();
    setState({ initializing: false });
  }
})();

export const store = {
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getState(): StoreState {
    return state;
  },

  // --- Auth ---

  async signUp(name: string, email: string, password: string): Promise<UserProfile> {
    const { token, user } = await api.post<{ token: string; user: UserProfile }>(
      '/auth/signup',
      { name, email, password }
    );
    setToken(token);
    setState({ currentUser: user });
    return user;
  },

  async logIn(email: string, password: string): Promise<UserProfile> {
    const { token, user } = await api.post<{ token: string; user: UserProfile }>(
      '/auth/login',
      { email, password }
    );
    setToken(token);
    setState({ currentUser: user });
    return user;
  },

  logOut() {
    clearToken();
    setState({ currentUser: null, bookings: [] });
  },

  currentUser(): UserProfile | null {
    return state.currentUser;
  },

  isInitializing(): boolean {
    return state.initializing;
  },

  // --- Username ---

  async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const params = new URLSearchParams({ username });
    if (excludeUserId) params.set('excludeUserId', excludeUserId);
    const { available } = await api.get<{ available: boolean }>(
      `/users/check-username?${params.toString()}`
    );
    return available;
  },

  async setUsername(userId: string, username: string): Promise<void> {
    await api.put('/users/me/username', { username });
    setState({
      currentUser: state.currentUser
        ? { ...state.currentUser, username }
        : null,
    });
  },

  // --- Profile ---

  async updateProfile(
    _userId: string,
    updates: Partial<Pick<UserProfile, 'name' | 'bio' | 'timezone'>>
  ): Promise<void> {
    const current = state.currentUser;
    if (!current) return;
    const merged = { ...current, ...updates };
    const user = await api.put<UserProfile>('/users/me/profile', {
      name: merged.name,
      bio: merged.bio,
      timezone: merged.timezone,
    });
    setState({ currentUser: { ...current, ...user } });
  },

  async updateAvailability(
    _userId: string,
    availability: Record<DayKey, DayAvailability>
  ): Promise<void> {
    await api.put('/users/me/availability', { availability });
    if (state.currentUser) {
      setState({ currentUser: { ...state.currentUser, availability } });
    }
  },

  async updateBlockedDates(_userId: string, blockedDates: string[]): Promise<void> {
    await api.put('/users/me/blocked-dates', { blockedDates });
    if (state.currentUser) {
      setState({ currentUser: { ...state.currentUser, blockedDates } });
    }
  },

  // --- Public lookup ---

  async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      const { user } = await api.get<{ user: UserProfile }>(`/users/${username}`);
      return user;
    } catch {
      return null;
    }
  },

  // --- Bookings ---

  async getBookingsForUser(_userId: string): Promise<Booking[]> {
    const { bookings } = await api.get<{ bookings: Booking[] }>('/bookings');
    setState({ bookings });
    return bookings;
  },

  /** Cached bookings from the last fetch — for synchronous reads in components. */
  getCachedBookings(): Booking[] {
    return state.bookings;
  },

  async createBooking(
    booking: Omit<Booking, 'id' | 'createdAt' | 'status'>
  ): Promise<Booking> {
    const { booking: created } = await api.post<{ booking: Booking }>('/bookings', booking);
    setState({ bookings: [...state.bookings, created] });
    return created;
  },

  async isSlotBooked(userId: string, date: string, startTime: string): Promise<boolean> {
    const params = new URLSearchParams({ userId, date, startTime });
    const { booked } = await api.get<{ booked: boolean }>(
      `/bookings/check?${params.toString()}`
    );
    return booked;
  },
};
