import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
  auth: { onAuthStateChanged: vi.fn() },
  db: {},
  googleProvider: {},
}));

// Mock Firestore
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  deleteDoc: vi.fn(),
  doc: vi.fn(),
  query: vi.fn(),
  orderBy: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn((_q, cb) => { cb({ docs: [] }); return vi.fn(); }),
  writeBatch: vi.fn(() => ({ delete: vi.fn(), commit: vi.fn() })),
  serverTimestamp: vi.fn(() => new Date().toISOString()),
  where: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
}));
