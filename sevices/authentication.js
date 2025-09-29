const JWT = require("jsonwebtoken");

const secret = "Pakistan@9733";

function createTokenForUser(user) {
    const payload = {
        fullName: user.fullName,
        _id: user._id,
        email: user.email,
        profileImageURL: user.profileImageURL,
        role: user.role,
    };
    const token = JWT.sign(payload, secret);
    return token;
} 

function validateToken(token, secret) {
    const payload = JWT.verify(token, secret);
    return payload;
}

module.exports = {
    createTokenForUser,
    validateToken,
}