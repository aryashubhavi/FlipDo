const asyncMiddleware = fn =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(next);
};

asyncMiddleware.name = asyncMiddleware;

module.exports = asyncMiddleware;
