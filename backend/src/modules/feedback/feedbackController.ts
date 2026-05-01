import type { Request, Response, NextFunction } from 'express';
import * as feedbackService from './feedbackService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const feedbackData = { ...req.body, userId: req.user._id };
    const result = await feedbackService.addFeedback(feedbackData);
    sendResponse(res, 201, result, 'Feedback added successfully');
  } catch (error) {
    next(error);
  }
};

export const getByService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getServiceFeedback(req.params.serviceId as string);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};
export const getByProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.getProviderFeedback(req.params.providerId as string);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.updateFeedback(req.params.id, req.user._id, req.body);
    sendResponse(res, 200, result, 'Feedback updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await feedbackService.deleteFeedback(req.params.id, req.user._id);
    sendResponse(res, 200, result, 'Feedback deleted successfully');
  } catch (error) {
    next(error);
  }
};

