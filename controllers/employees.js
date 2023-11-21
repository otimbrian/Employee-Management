import express from 'express'
import employee from '../models/employee.js'
import logger from '../utils/logger.js'

const employeeRouter = express.Router()

employeeRouter.get('/', (response, request) => {
    console.log("Received Request")
})

export default employeeRouter