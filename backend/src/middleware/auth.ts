import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email: string;
    empresaId: string;
    rol: string;
  };
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No se proporcionó token de autenticación' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];
    
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'guardia-management-secret-key-2024') as any;
    
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || '',
      empresaId: decodedToken.empresaId || '',
      rol: decodedToken.rol || 'guardia',
    };

    next();
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ error: 'Token de autenticación inválido o expirado' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    if (roles.length && !roles.includes(req.user.rol)) {
      res.status(403).json({ error: 'No tienes permisos para esta acción' });
      return;
    }

    next();
  };
};

export const requireEmpresaMatch = (options?: { paramKey?: string; bodyKey?: string }) => {
  const paramKey = options?.paramKey ?? 'empresaId';
  const bodyKey = options?.bodyKey ?? 'empresaId';

  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user?.empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const paramEmpresaId = req.params?.[paramKey];
    if (paramEmpresaId && paramEmpresaId !== req.user.empresaId) {
      res.status(403).json({ error: 'No tienes acceso a esta empresa' });
      return;
    }

    const bodyEmpresaId = (req.body && req.body[bodyKey]) || null;
    if (bodyEmpresaId && bodyEmpresaId !== req.user.empresaId) {
      res.status(403).json({ error: 'No tienes acceso a esta empresa' });
      return;
    }

    next();
  };
};

export const generateToken = (user: { uid: string; email: string; empresaId: string; rol: string }): string => {
  return jwt.sign(
    { uid: user.uid, email: user.email, empresaId: user.empresaId, rol: user.rol },
    process.env.JWT_SECRET || 'default-secret',
    { expiresIn: '7d' }
  );
};
