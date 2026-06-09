import type { AuthSession, AuthUserName } from './types.js';

const users = new Map<AuthUserName, string>([
  ['wenxin', '1314'],
  ['sifeng', '1314'],
]);

const sessions = new Map<string, AuthUserName>();

export function validateCredentials(userName: string, password: string) {
  if (!isAuthUserName(userName)) {
    return null;
  }
  return users.get(userName) === password ? userName : null;
}

export function createSession(userName: AuthUserName): AuthSession {
  const token = crypto.randomUUID();
  sessions.set(token, userName);
  return { token, userName };
}

export function removeSession(token: string) {
  sessions.delete(token);
}

export function getUserNameByToken(token: string) {
  return sessions.get(token) ?? null;
}

export function getTokenFromHeader(header?: string | null) {
  if (!header?.startsWith('Bearer ')) {
    return null;
  }
  return header.slice('Bearer '.length).trim() || null;
}

function isAuthUserName(userName: string): userName is AuthUserName {
  return userName === 'wenxin' || userName === 'sifeng';
}
