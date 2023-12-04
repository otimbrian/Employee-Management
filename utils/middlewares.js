import logger from "./logger.js"

// Error Handling Middeware.
const errorHandler = (error, request, response, next) => {
    console.error("Error message ===>", error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'incorrect/malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
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

export default {
    errorHandler,
    requestLogger,
    unknownEndpoint
}