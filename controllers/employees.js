import express from 'express'
import bcrypt from 'bcrypt'
import Employee from '../models/employee.js'
import Department from '../models/department.js'
import { responseMessage } from '../utils/helper.js'
import logger from '../utils/logger.js'

const employeeRouter = express.Router()

// Get all Employees in the database
employeeRouter.get('/', async (request, response) => {
    const employees = await Employee.find({}).populate('department')
    response.json(employees.map(employee => employee.toJSON()))
})

// Delete one employee using id.
employeeRouter.delete('/:id', async (request, response) => {
    await Employee.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

// Get one employee using id.
employeeRouter.get('/:id', async (request, response) => {
    const employee = await Employee.findById(request.params.id)

    if (employee) {
        response.status(200).json(employee)
    } else {
        const res = responseMessage(404, 'Employee not found in database')
        response.status(404).send(res)
    }
})

// Create an employee
employeeRouter.post('/', async (request, response) => {
    // Get the request body
    const body = request.body

    const departmentsIds = []
    body.department.forEach(department => departmentsIds.push(department.id))

    const saltRounds = 10
    const passwordHass = await bcrypt.hash(body.password, saltRounds)

    // Create a new Employee object
    const newEmployee = new Employee({
        name: body.name,
        surname: body.surname,
        email: body.email,
        isAdmin: body.isAdmin,
        passwordHass: passwordHass,
        department: departmentsIds
    })

    // save the employee
    const savedEmployee = await newEmployee.save()

    // Add the employee reference id to Each department.
    // logger.infor(body.department)
    await body.department.forEach(async depart => {
        // Add the reference id
        depart.employees = depart.employees.concat(savedEmployee._id)

        // Update the department
        await Department.findByIdAndUpdate(depart.id, depart)
    })
    response.status(201).json(savedEmployee).end()
})

// Update an Employee
employeeRouter.put('/:id', async (request, response) => {
    // Get a copy of the employee.
    const employee = await Employee.findById(request.params.id)

    // logger.infor(employee)

    // Get departments that require updating
    const departmentsToBeAdded = request.body.department.filter(depart => {
        return !employee.department.includes(depart.id)
    })

    // Update the department id list to be updated to the database
    request.body.department = request.body.department.map(
        department => department.id
    )

    // updating the new departments.
    await departmentsToBeAdded.forEach(async department => {
        // Add the employee Id to the department as reference
        department.employees = department.employees.concat(employee.id)

        // Update the department in the database
        await Department.findByIdAndUpdate(department.id, department)
    })

    const updatedEmployee = await Employee.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true }
    )
    if (updatedEmployee) {
        response.json(updatedEmployee.toJSON())
    } else {
        res = responseMessage(500, 'Failed to Update')
        response.status(500).send(res)
    }
})

export default employeeRouter
