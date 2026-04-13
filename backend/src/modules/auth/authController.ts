import type { Request, Response, NextFunction } from 'express';
import * as authService from './authService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.registerUser(req.body);
    sendResponse(res, 201, result, 'User registered successfully');
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUser(req.body);
    sendResponse(res, 200, result, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await authService.changePassword(req.user._id, currentPassword, newPassword);
    sendResponse(res, 200, result, 'Password changed successfully');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refreshAccessToken(refreshToken);
    sendResponse(res, 200, result, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: any, res: Response, next: NextFunction) => {
  try {
    sendResponse(res, 200, { user: req.user }, 'User profile fetched');
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await authService.updateUserProfile(req.user._id, req.body);
    sendResponse(res, 200, result, 'Profile updated successfully');
  } catch (error) {
    next(error);
  }
};

