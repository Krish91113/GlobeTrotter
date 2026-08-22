declare namespace Express {
  interface Request {
    id: string;
    user?: {
      id: string;
      userId?: string;
      email: string;
      displayName?: string;
    };
  }
}