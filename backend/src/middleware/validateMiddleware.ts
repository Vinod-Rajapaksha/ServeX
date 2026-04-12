import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';
import { AppError } from '../core/appError.js';

export const validate = (schema: z.ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessage = error.issues
          .map((issue: any) => `${issue.path[issue.path.length - 1]}: ${issue.message}`)
          .join(', ');
        return next(new AppError(errorMessage, 400));
      }
      return next(error);
    }
  };
};
