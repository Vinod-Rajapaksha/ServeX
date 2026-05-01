import User, { IUser } from '../../database/models/User.js';
import { AppError } from '../../core/appError.js';

export const findAllUsers = async () => {
  return await User.find().select('-password');
};

export const createNewUser = async (userData: Partial<IUser>) => {
  const user = await User.create(userData);
  user.password = undefined as any;
  return user;
};

export const findUserById = async (id: string) => {
  const user = await User.findById(id).select('-password');
  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};

export const updateUserById = async (id: string, userData: Partial<IUser>) => {
  const user = await User.findByIdAndUpdate(id, userData, {
    new: true,
    runValidators: true,
  }).select('-password');
  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};

export const deleteUserById = async (id: string) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new AppError('No user found with that ID', 404);
  return user;
};
