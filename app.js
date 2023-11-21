import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import middlewares from './utils/middlewares.js'
import employeeRouter from './controllers/employees.js'

const app = express()

mongoose.set('strictQuery', false)

logger.infor("Connecting to", config.MONGODB_URI)
mongoose.connect(config.MONGODB_URI).then(() => {
    logger.infor('Connected to Database')
}).catch((error) => {
    logger.error('error in connecting to the database ===>', error)
})

app.use(cors)
app.use(express.static('dist'))
app.use(express.json())
app.use(middlewares.requestLogger)

app.use('/api/employees', employeeRouter)

app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

export default app