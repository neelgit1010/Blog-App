const jwt = require('jsonwebtoken')
const secret = "neel@a$ta5leAfClover"

function createUserToken(user) {
    const payload = {
        id : user._id,
        name : user.name,
        email : user.email,
        dp : user.dp,
        role : user.role
    }
   
    const token = jwt.sign(payload, secret)
    return token
}

function validateUserToken(token) {
    const payload = jwt.verify(token, secret)
    return payload  
}

module.exports = {
    createUserToken,
    validateUserToken
}