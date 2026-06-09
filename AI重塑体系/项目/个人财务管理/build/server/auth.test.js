import { describe, expect, it } from 'vitest';
import { createSession, getTokenFromHeader, getUserNameByToken, removeSession, validateCredentials } from './auth.js';
describe('auth module', () => {
    it('固定用户凭证校验通过', () => {
        expect(validateCredentials('wenxin', '1314')).toBe('wenxin');
        expect(validateCredentials('sifeng', '1314')).toBe('sifeng');
        expect(validateCredentials('wenxin', 'wrong')).toBeNull();
    });
    it('会话创建和移除生效', () => {
        const session = createSession('wenxin');
        expect(getUserNameByToken(session.token)).toBe('wenxin');
        removeSession(session.token);
        expect(getUserNameByToken(session.token)).toBeNull();
    });
    it('可以从 Bearer 请求头中提取 token', () => {
        expect(getTokenFromHeader('Bearer token-1')).toBe('token-1');
        expect(getTokenFromHeader('Basic token-1')).toBeNull();
    });
});
