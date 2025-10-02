// Mocks
const mockFindByEmail = jest.fn();
const mockCreateUser = jest.fn();

// Mock UserRepository class used inside AuthService
jest.mock('../../src/repositories/user.repository', () => ({
  UserRepository: jest.fn().mockImplementation(() => ({
    findByEmail: mockFindByEmail,
    createUser: mockCreateUser,
  })),
}));

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn(async (pwd: string) => `hashed:${pwd}`),
  compare: jest.fn(async (pwd: string, hash: string) => hash === `hashed:${pwd}`),
}));

// Prepare PrismaClient mock instance
const mockPrisma = {
  refreshToken: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
  },
};

// Mock @prisma/client
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrisma),
}));

// Mock jsonwebtoken inline to avoid hoisting issues
jest.mock('jsonwebtoken', () => ({
  __esModule: true,
  default: {
    sign: jest.fn(() => 'access-secret-token'),
    verify: jest.fn(() => ({ userId: 'u1', email: 'a@b.c', role: 'USER' })),
  },
  sign: jest.fn(() => 'access-secret-token'),
  verify: jest.fn(() => ({ userId: 'u1', email: 'a@b.c', role: 'USER' })),
}));

describe('AuthService', () => {
  let service: any;
  let AuthServiceCtor: any;

  beforeEach(() => {
    jest.clearAllMocks();
    // Import after mocks are set up
    const mod = require('../../src/services/auth.service');
    AuthServiceCtor = mod.AuthService;
    service = new AuthServiceCtor();
  });

  describe('register', () => {
    it('fails if user already exists', async () => {
      mockFindByEmail.mockResolvedValueOnce({ id: 'u1' });
      const res = await service.register({
        email: 'a@b.c',
        password: 'pass',
        firstName: 'A',
        lastName: 'B',
      } as any);
      expect(res.success).toBe(false);
      expect(res.message).toMatch(/already exists/i);
    });

    it('creates user and returns tokens', async () => {
      mockFindByEmail.mockResolvedValueOnce(null);
      mockCreateUser.mockResolvedValueOnce({
        id: 'u1', email: 'a@b.c', firstName: 'A', lastName: 'B', role: 'USER', password: 'hashed:pass'
      });
      mockPrisma.refreshToken.create.mockResolvedValueOnce({});

      const res = await service.register({
        email: 'a@b.c',
        password: 'pass',
        firstName: 'A',
        lastName: 'B',
      } as any);

      expect(res.success).toBe(true);
      expect(res.data?.accessToken).toBeDefined();
      expect(res.data?.refreshToken).toBeDefined();
      expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('fails if user not found', async () => {
      mockFindByEmail.mockResolvedValueOnce(null);
      const res = await service.login({ email: 'x@y.z', password: 'p' } as any);
      expect(res.success).toBe(false);
    });

    it('fails if password invalid', async () => {
      mockFindByEmail.mockResolvedValueOnce({
        id: 'u1', email: 'a@b.c', password: 'hashed:other', isActive: true
      });
      const res = await service.login({ email: 'a@b.c', password: 'pass' } as any);
      expect(res.success).toBe(false);
    });

    it('fails if user deactivated', async () => {
      mockFindByEmail.mockResolvedValueOnce({
        id: 'u1', email: 'a@b.c', password: 'hashed:pass', isActive: false
      });
      const res = await service.login({ email: 'a@b.c', password: 'pass' } as any);
      expect(res.success).toBe(false);
    });

    it('succeeds and returns tokens', async () => {
      mockFindByEmail.mockResolvedValueOnce({
        id: 'u1', email: 'a@b.c', password: 'hashed:pass', isActive: true, firstName: 'A', lastName: 'B', role: 'USER'
      });
      mockPrisma.refreshToken.create.mockResolvedValueOnce({});
      const res = await service.login({ email: 'a@b.c', password: 'pass' } as any);
      expect(res.success).toBe(true);
      expect(res.data?.accessToken).toBeDefined();
      expect(res.data?.refreshToken).toBeDefined();
    });
  });

  describe('refreshTokens', () => {
    it('fails if token not found or expired', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValueOnce(null);
      const res = await service.refreshTokens('rt');
      expect(res.success).toBe(false);
    });

    it('returns new tokens if valid', async () => {
      const now = new Date(Date.now() + 60_000);
      mockPrisma.refreshToken.findFirst.mockResolvedValueOnce({
        token: 'rt',
        userId: 'u1',
        expiresAt: now,
        user: { id: 'u1', email: 'a@b.c', firstName: 'A', lastName: 'B', role: 'USER' },
      });
      mockPrisma.refreshToken.create.mockResolvedValueOnce({});
      const res = await service.refreshTokens('rt');
      expect(res.success).toBe(true);
      expect(res.data?.accessToken).toBeDefined();
    });
  });

  describe('logout', () => {
    it('deletes refresh tokens and returns success', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValueOnce({});
      const res = await service.logout('rt');
      expect(res.success).toBe(true);
      expect(mockPrisma.refreshToken.deleteMany).toHaveBeenCalledWith({ where: { token: 'rt' } });
    });
  });
});
