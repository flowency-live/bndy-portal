export const createMockUser = (overrides: any = {}) => ({
  uid: 'mock-user-id',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  phoneNumber: null,
  providerId: 'google.com',
  ...overrides
});