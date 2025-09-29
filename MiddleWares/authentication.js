const { validateToken } = require("../sevices/authentication");

function checkForAuthenticationCookie(cookieName) {
    return (req, res, next) => {
        const tokenCookieValue = req.cookies[cookieName];
        if (!tokenCookieValue) {
            return next();
        }

        try {
            const userPayload = validateToken(tokenCookieValue, "Pakistan@9733");

            req.user = userPayload;
            res.locals.user = userPayload; 
        } catch (error) {
            console.error("Invalid token:", error.message);
        }

        return next(); 
    };
}

module.exports = {
    checkForAuthenticationCookie,
};
