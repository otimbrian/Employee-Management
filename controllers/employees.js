import express from 'express'
// const employeeRouter = require('express').Router()
import Employee from '../models/employee.js'
import Department from '../models/department.js'
// import logger from '../utils/logger.js'

const employeeRouter = express.Router()

employeeRouter.get('/', async (request, response) => {
    const employees = await Employee.find({}).populate('departments')
    response.json(employees)

})

// Create An Employee.

employeeRouter.post('/', async (request, response, next) => {
    const body = request.body

    // const department = Department.findById(body.departmentId)
    const departments = []
    body.department.forEach(department => {
        const depart = Department.findById(department.id)
        departments.push(depart)
    })

    const newEmployee = new Employee({
        name: body.name,
        surname: body.name,
        department: departments
    })

    try {
        const createdEmployee = await newEmployee.save()

        departments.forEach(depart => {
            depart.employees.concat(createdEmployee.id)
            depart.save()
        })
    } catch (error) {
        next(error)
    }

})

export default employeeRouter