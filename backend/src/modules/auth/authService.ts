import jwt from 'jsonwebtoken';
import User from '../../database/models/User.js';
import { AppError } from '../../core/appError.js';
import { uploadImage } from '../../utils/cloudinary.js';

const signToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET as string, {
    expiresIn: (process.env.JWT_EXPIRE as any) || '1d',
  });
};

const signRefreshToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRE as any) || '7d',
  });
};

export const registerUser = async (userData: any) => {
  const { email } = userData;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new AppError('Email already in use', 400);
  }

  const user = await User.create(userData);

  const token = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  return { user, token, refreshToken };
};

export const loginUser = async (loginData: any) => {
  const { email, password } = loginData;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  const token = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  (user as any).password = undefined;

  return { user, token, refreshToken };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new AppError('User not found', 404);

  if (!(await user.comparePassword(currentPassword))) {
    throw new AppError('Current password is incorrect', 401);
  }

  user.password = newPassword;
  await user.save();
  return { message: 'Password changed successfully' };
};

export const refreshAccessToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError('Refresh token is required', 401);
  }

  try {
    const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new AppError('User no longer exists', 401);
    }

    const newToken = signToken(user._id.toString());
    const newRefreshToken = signRefreshToken(user._id.toString());

    return { token: newToken, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError('Invalid or expired refresh token', 401);
  }
};

export const updateUserProfile = async (userId: string, updateData: any) => {
  if (updateData.profileImage && updateData.profileImage.startsWith('data:image')) {
    try {
      const imageUrl = await uploadImage(updateData.profileImage, 'avatars');
      updateData.profileImage = imageUrl;
    } catch (error) {
      throw new AppError('Avatar upload failed', 500);
    }
  }

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return { user };
};
