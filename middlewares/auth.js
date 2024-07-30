const { validateUserToken } = require("../services/auth");

function checkAuthCookie(cookie) {
  return (req, res, next) => {
    const cookieVal = req.cookies[cookie];
    if (!cookieVal) return next();

    try {
      const userPayload = validateUserToken(cookieVal);
      req.user = userPayload;
    } catch (error) {}

    return next();
  };
}

module.exports = {checkAuthCookie}