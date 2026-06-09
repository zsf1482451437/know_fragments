const users = new Map([
    ['wenxin', '1314'],
    ['sifeng', '1314'],
]);
const sessions = new Map();
export function validateCredentials(userName, password) {
    if (!isAuthUserName(userName)) {
        return null;
    }
    return users.get(userName) === password ? userName : null;
}
export function createSession(userName) {
    const token = crypto.randomUUID();
    sessions.set(token, userName);
    return { token, userName };
}
export function removeSession(token) {
    sessions.delete(token);
}
export function getUserNameByToken(token) {
    return sessions.get(token) ?? null;
}
export function getTokenFromHeader(header) {
    if (!header?.startsWith('Bearer ')) {
        return null;
    }
    return header.slice('Bearer '.length).trim() || null;
}
function isAuthUserName(userName) {
    return userName === 'wenxin' || userName === 'sifeng';
}
