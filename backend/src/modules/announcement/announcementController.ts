import type { Request, Response, NextFunction } from 'express';
import * as announcementService from './announcementService.js';
import { sendResponse } from '../../core/responseFormatter.js';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await announcementService.getAllAnnouncements();
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const getByRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await announcementService.getAnnouncementsByRole(req.params.role as string);
    sendResponse(res, 200, result);
  } catch (error) {
    next(error);
  }
};

export const create = async (req: any, res: Response, next: NextFunction) => {
  try {
    const data = { ...req.body, createdBy: req.user._id };
    const result = await announcementService.createAnnouncement(data);
    sendResponse(res, 201, result, 'Announcement created successfully');
  } catch (error) {
    next(error);
  }
};

export const update = async (req: any, res: Response, next: NextFunction) => {
  try {
    const result = await announcementService.updateAnnouncement(req.params.id, req.body);
    sendResponse(res, 200, result, 'Announcement updated successfully');
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await announcementService.deleteAnnouncement(req.params.id as string);
    sendResponse(res, 200, null, 'Announcement deleted successfully');
  } catch (error) {
    next(error);
  }
};
