import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../core/appError.js';
import User from '../database/models/User.js';
import { UserRole } from '../core/enums.js';

export const protect = async (req: any, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    next(new AppError('Invalid token. Please log in again!', 401));
  }
};

export const restrictTo = (...roles: UserRole[]) => {
  return (req: any, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
