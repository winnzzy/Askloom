import { Request, Response, NextFunction } from "express";

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export function asyncHandler(route: AsyncRoute) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(route(req, res, next)).catch(next);
  };
}
