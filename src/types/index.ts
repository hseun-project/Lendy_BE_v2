import { Request } from 'express';
import { ParsedQs } from 'qs';

export interface BasicResponse {
  message: string;
}

export interface JwtPayloadData {
  id: string;
  sub: string;
  type: 'access' | 'refresh';
  iat: number;
}

export interface AuthenticatedRequest<Params = Record<string, never>, Query = ParsedQs, Body = Record<string, never>, ResBody = unknown>
  extends Request<Params, ResBody, Body, Query> {
  payload?: JwtPayloadData;
  userId?: bigint;
}

export const REDIS_KEY = {
  ACCESS_TOKEN: 'access',
  REFRESH_TOKEN: 'refresh',
  OPEN_ACCESS_TOKEN: 'openAccess',
  OPEN_REFRESH_TOKEN: 'openRefresh',
  OPEN_CODE_STATE: 'openCodeState',
  OPEN_USER_SEQ: 'openUserSeqNo'
};
