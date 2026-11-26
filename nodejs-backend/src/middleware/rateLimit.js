const rateLimit = require('express-rate-limit');

const WINDOW_MS = 15 * 60 * 1000;

function readPositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function tooManyRequests(req, res, _next, options) {
    res.status(options.statusCode).json({
        name: 'TooManyRequests',
        message: 'Too many requests. Please wait and try again.',
        code: 429
    });
}

function isStaticAsset(req) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return false;
    if (req.path === '/' || req.path === '/favicon.ico') return true;
    if (req.path.startsWith('/reset/') || req.path.startsWith('/loginreset/')) return true;
    return /\.(js|css|map|png|jpg|jpeg|gif|svg|ico|webp|woff2?|ttf|eot|html)$/i.test(req.path);
}

function matchesService(req, name) {
    return req.path === `/${name}` || req.path.startsWith(`/${name}/`);
}

function isAuthRequest(req) {
    if (req.method === 'POST' && (matchesService(req, 'authentication') || matchesService(req, 'users') || matchesService(req, 'userInvites') || matchesService(req, 'mailQues'))) {
        return true;
    }
    if ((req.method === 'POST' || req.method === 'PATCH') && matchesService(req, 'userChangePassword')) return true;
    if (req.method === 'POST' && (req.path === '/verify-email' || req.path === '/verify-recaptcha')) return true;
    return false;
}

const shared = {
    windowMs: readPositiveInt(process.env.RATE_LIMIT_WINDOW_MS, WINDOW_MS),
    standardHeaders: true,
    legacyHeaders: false,
    handler: tooManyRequests
};

const apiLimiter = rateLimit({
    ...shared,
    limit: readPositiveInt(process.env.RATE_LIMIT_MAX, 2000),
    skip: (req) => isStaticAsset(req)
});

const authLimiter = rateLimit({
    ...shared,
    limit: readPositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 20)
});

function rateLimitMiddleware(req, res, next) {
    if (isAuthRequest(req)) return authLimiter(req, res, next);
    return apiLimiter(req, res, next);
}

module.exports = rateLimitMiddleware;
module.exports.isAuthRequest = isAuthRequest;
