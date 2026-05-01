import type { Request, Response, NextFunction } from 'express';
import * as serviceService from './serviceService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filter: any = {};
    if (req.query.category) filter.categoryId = req.query.category;
    if (req.query.provider) filter.providerId = req.query.provider;

    const result = await serviceService.getAllServices(filter);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await serviceService.getServiceById(req.params.id as string);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const serviceData = { ...req.body, providerId: req.user._id };
    const result = await serviceService.createService(serviceData);
    sendResponse(res, 201, result, 'Service created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await serviceService.updateService(req.params.id as string, req.body, req.user._id);
    sendResponse(res, 200, result, 'Service updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: Response, next: NextFunction) => {
  try {
    await serviceService.deleteService(req.params.id as string, req.user._id);
    sendResponse(res, 204, null, 'Service deleted successfully');
  } catch (error) {
    next(error);
  }
};
