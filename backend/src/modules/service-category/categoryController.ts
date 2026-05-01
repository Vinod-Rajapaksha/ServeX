import type { Request, Response, NextFunction } from 'express';
import * as categoryService from './categoryService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getAllCategories();
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.getCategoryById(req.params.id as string);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.createCategory(req.body);
    sendResponse(res, 201, result, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await categoryService.updateCategory(req.params.id as string, req.body);
    sendResponse(res, 200, result, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await categoryService.deleteCategory(req.params.id as string);
    sendResponse(res, 204, null, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};
