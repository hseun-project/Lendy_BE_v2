import rateLimit from 'express-rate-limit';

export const apiLimit = rateLimit({
  windowMs: 1000 * 60,
  max: 5,
  handler(req, res) {
    res.status(429).json({
      message: '요청 많음'
    });
  }
});

export const getApiLimit = rateLimit({
  windowMs: 1000 * 60,
  max: 10,
  handler(req, res) {
    res.status(429).json({
      message: '요청 많음'
    });
  }
});
