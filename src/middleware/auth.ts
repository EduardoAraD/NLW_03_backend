import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
const env =  require('../../.env')

module.exports = (request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    if(!authHeader) 
        return response.status(401).send({ error: 'No token provided' })
    
    const parts = authHeader.split(' ')
    if(parts.length !== 2)
        return response.status(401).send({ error: 'Token error' })
    
    const [ scheme, tokenReq ] = parts

    if(!/^Bearer$/i.test(scheme))
        return response.status(401).send({ error: 'Token malformatted' })
    
    const token = jwt.verify(tokenReq, env.authSecret)
    if(!token)
        return response.status(401).send({ error: 'Token invalid' })
    
    //const tokenDecode = jwt.decode(token);
    //console.log(tokenDecode)
    next();
    //tokenJWT.

    /*jwt.verify(token, env.authSecret, (err: Error): VerifyOptions => {
        if(err)
            return response.status(401).send({ error: 'Token invalid' })

        return next();
    })*/
}