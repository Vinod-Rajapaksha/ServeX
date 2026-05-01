import { Request, Response } from 'express';
import * as userService from './userService.js';
import { catchAsync } from '../../utils/catchAsync.js';

export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const users = await userService.findAllUsers();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: users,
  });
});

export const createUser = catchAsync(async (req: Request, res: Response) => {
  const newUser = await userService.createNewUser(req.body);
  res.status(201).json({
    status: 'success',
    data: newUser,
  });
});

export const getUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.findUserById(req.params.id as string);
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

export const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.updateUserById(req.params.id as string, req.body);
  res.status(200).json({
    status: 'success',
    data: user,
  });
});

export const deleteUser = catchAsync(async (req: Request, res: Response) => {
  await userService.deleteUserById(req.params.id as string);
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
