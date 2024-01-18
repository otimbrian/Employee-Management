import express from 'express'
import mongoose from 'mongoose'
import 'express-async-errors'
// import morgan from 'morgan'
import cors from 'cors'
import config from './utils/config.js'
import logger from './utils/logger.js'
import middlewares from './utils/middlewares.js'
import employeeRouter from './controllers/employees.js'
import departmentRouter from './controllers/departments.js'
import loginRouter from './controllers/login.js'

const app = express()

mongoose.set('strictQuery', false)

logger.infor('Connecting to -->', config.MONGODB_URI_CONNECTION_STRING)
mongoose
    .connect(config.MONGODB_URI_CONNECTION_STRING)
    .then(() => {
        logger.infor('Connected to Database')
    })
    .catch(error => {
        logger.error('error in connecting to the database ===>', error)
    })

app.use(cors())
app.use(express.static('dist'))
// app.use(express.static('build'))
app.use(express.json())
app.use(middlewares.requestLogger)

app.use('/api/employees', employeeRouter)
app.use('/api/departments', departmentRouter)
app.use('/api/login', loginRouter)

app.use(middlewares.unknownEndpoint)
app.use(middlewares.errorHandler)

export default app
