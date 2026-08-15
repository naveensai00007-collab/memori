import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { authConfig } from '../config/auth';
import { AppError } from '../middleware/errorHandler';
import { User, UserSettings } from '../../../shared/types';

export class AuthService {
  static generateTokens(user: { id: string; email: string }) {
    const token = jwt.sign(
      { id: user.id, email: user.email },
      authConfig.jwtSecret,
      { expiresIn: authConfig.jwtExpiry as any }
    );

    const refresh_token = jwt.sign(
      { id: user.id, email: user.email },
      authConfig.jwtRefreshSecret,
      { expiresIn: authConfig.refreshExpiry as any }
    );

    return { token, refresh_token };
  }

  static async register(email: string, masterPassword: string, clientSalt?: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const salt = clientSalt || crypto.randomBytes(32).toString('base64');
    const master_password_hash = await bcrypt.hash(masterPassword, authConfig.saltRounds);

    const defaultSettings: UserSettings = {
      theme: 'light',
      reminder_email: true,
      review_interval: 30,
    };

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        master_password_hash,
        encryption_salt: salt,
        settings: JSON.stringify(defaultSettings),
      },
    });

    // Create initial sync metadata
    await prisma.syncMetadata.create({
      data: {
        user_id: user.id,
      },
    });

    // Log audit event
    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: 'register',
      },
    });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        encryption_salt: user.encryption_salt,
        settings: defaultSettings,
      },
      ...tokens,
    };
  }

  static async login(email: string, masterPassword: string) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new AppError('Invalid email or master password.', 401, 'INVALID_CREDENTIALS');
    }

    const passwordValid = await bcrypt.compare(masterPassword, user.master_password_hash);
    if (!passwordValid) {
      throw new AppError('Invalid email or master password.', 401, 'INVALID_CREDENTIALS');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { last_active_at: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        user_id: user.id,
        action: 'login',
      },
    });

    const settings: UserSettings = JSON.parse(user.settings || '{}');
    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        encryption_salt: user.encryption_salt,
        settings,
      },
      ...tokens,
    };
  }

  static async refreshToken(refreshToken: string) {
    try {
      const payload = jwt.verify(refreshToken, authConfig.jwtRefreshSecret) as { id: string; email: string };
      const user = await prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new AppError('User not found.', 401, 'UNAUTHORIZED');
      }

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (err: any) {
      throw new AppError('Invalid or expired refresh token.', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      encryption_salt: user.encryption_salt,
      settings: JSON.parse(user.settings || '{}'),
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };
  }

  static async updateSettings(userId: string, settingsUpdate: Partial<UserSettings>) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');

    const currentSettings: UserSettings = JSON.parse(user.settings || '{}');
    const updatedSettings = { ...currentSettings, ...settingsUpdate };

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { settings: JSON.stringify(updatedSettings) },
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      encryption_salt: updatedUser.encryption_salt,
      settings: updatedSettings,
    };
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string, newSalt?: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');

    const passwordValid = await bcrypt.compare(oldPassword, user.master_password_hash);
    if (!passwordValid) {
      throw new AppError('Current master password is incorrect.', 400, 'INCORRECT_OLD_PASSWORD');
    }

    const newHash = await bcrypt.hash(newPassword, authConfig.saltRounds);
    const updateData: any = { master_password_hash: newHash };
    if (newSalt) {
      updateData.encryption_salt = newSalt;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        user_id: userId,
        action: 'password_change',
      },
    });

    return { success: true };
  }

  static async exportUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        items: true,
        locations: true,
        reminders: true,
      },
    });

    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');

    return {
      exported_at: new Date().toISOString(),
      schema_version: '1.0.0',
      user: {
        id: user.id,
        email: user.email,
        encryption_salt: user.encryption_salt,
        settings: JSON.parse(user.settings || '{}'),
      },
      items: user.items.map(i => ({
        ...i,
        tags: JSON.parse(i.tags || '[]'),
      })),
      locations: user.locations,
      reminders: user.reminders,
    };
  }

  static async deleteAccount(userId: string, masterPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found.', 404, 'USER_NOT_FOUND');

    const passwordValid = await bcrypt.compare(masterPassword, user.master_password_hash);
    if (!passwordValid) {
      throw new AppError('Incorrect master password.', 400, 'INCORRECT_PASSWORD');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  }
}
