export const authConfig = {
  jwtSecret: process.env.JWT_SECRET || 'memori-dev-jwt-super-secret-key-32-chars-minimum',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'memori-dev-refresh-secret-key-32-chars-minimum',
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  refreshExpiry: process.env.REFRESH_EXPIRY || '7d',
  saltRounds: 10,
};
