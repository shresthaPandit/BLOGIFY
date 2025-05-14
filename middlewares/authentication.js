const { validate } = require("../services/authentication");
function checkForAuthenticationCookie(cookieName) {
  return (req, res, next) => {
    const tokenCookieValue = req.cookies[cookieName];
    if (!tokenCookieValue) {
       return next();
    }
    try {
      const userPayload = validate(tokenCookieValue);
      req.user = userPayload;
      next();
    } catch (e) {
      return next();
    }
  };
}

module.exports={checkForAuthenticationCookie};