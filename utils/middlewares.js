import jwt from 'jsonwebtoken'
import logger from './logger.js'
import { responseMessage } from './helper.js'
import Employee from '../models/employee.js'

// Error Handling Middeware.
const errorHandler = (error, request, response, next) => {
    console.error('Error message ===>', error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'incorrect/malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    } else if (error.name === 'TokenExpiredError') {
        //If token is expired
        return response.status(401).json({
            error: 'token expired'
        })
    } else if (error.name === 'JsonWebTokenError') {
        //If token is missing or invalid.
        return response.status(401).json({ error: error.message })
    }
    next(error)
}

// Middleware for
// Logging the contents of a request.
const requestLogger = (request, response, next) => {
    logger.infor('Method:', request.method)
    logger.infor('Path:  ', request.path)
    logger.infor('Body:  ', request.body)
    logger.infor('---')
    next()
}

// Middleware for handling unknown or unhandled responses
const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

// Middleware for Extrcting the user token.
const tokenExtracter = (request, response, next) => {
    // Get the uthorization header
    const authorization = request.get('authoriztion')

    if (authorization && authorization.startsWith('Bearer ')) {
        // Get the token and assign it to the request.
        request.token = authorization.replace('Bearer ', '')
    } else {
        request.token = null
    }
    next()
}

// Middleware to extrct the user information from the token.
const userExtractor = async (request, response, next) => {
    // Decode the token
    const decodedToken = jwt.verify(request.token, process.env.SECRET_KEY)

    // If there's no Id then the token is invalid.
    if (!decodedToken.id) {
        const res = responseMessage(401, 'missing or invalid token', null)
        return response.status(401).send(res).end()
    }

    // Get the user and add it to the request.
    request.user = await Employee.findById(decodedToken.id)

    next()
}

export default {
    errorHandler,
    requestLogger,
    unknownEndpoint,
    tokenExtracter,
    userExtractor
}
