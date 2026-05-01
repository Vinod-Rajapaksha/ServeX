import type { Response, NextFunction } from 'express';
import * as requestService from './requestService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const requestData = { ...req.body, userId: req.user._id };
    const result = await requestService.createRequest(requestData);
    sendResponse(res, 201, result, 'Service request created successfully');
  } catch (error) {
    next(error);
  }
};

export const getMy = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getMyRequests(req.user._id);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getOpen = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getOpenRequests();
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const accept = async (req: any, res: Response, next: NextFunction) => {
  try {
    const { price } = req.body;
    const result = await requestService.acceptRequest(req.params.id, req.user._id, price);
    sendResponse(res, 200, result, 'Request accepted successfully');
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.getAllRequests();
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const placeBid = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.placeBid(req.params.id, req.user._id, req.body);
    sendResponse(res, 200, result, 'Bid placed successfully');
  } catch (error) {
    next(error);
  }
};

export const acceptBid = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.acceptBid(req.params.id, req.params.bidId, req.user._id);
    sendResponse(res, 200, result, 'Bid accepted and booking created');
  } catch (error) {
    next(error);
  }
};

export const updateStatus = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.updateRequestStatus(req.params.id, req.body.status);
    sendResponse(res, 200, result, 'Request status updated');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await requestService.deleteRequest(req.params.id, req.user._id);
    sendResponse(res, 200, result, 'Request deleted successfully');
  } catch (error) {
    next(error);
  }
};
