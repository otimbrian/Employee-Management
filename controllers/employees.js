import express from 'express'
import bcrypt from 'bcrypt'
import Employee from '../models/employee.js'
import Department from '../models/department.js'
import middleware from '../utils/middlewares.js'
import { hassPassword, responseMessage } from '../utils/helper.js'
import logger from '../utils/logger.js'

const employeeRouter = express.Router()

// Create an employee
employeeRouter.post(
    '/',
    middleware.tokenExtracter,
    middleware.checkAdmin,
    async (request, response) => {
        // Get the request body
        const body = request.body

        const departmentsIds = []
        body.department.forEach(department => departmentsIds.push(department.id))

        const passwordHass = await hassPassword(body.password)

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
    }
)

// Get all Employees in the database
employeeRouter.get(
    '/',
    middleware.tokenExtracter,
    middleware.checkAdmin,
    async (request, response) => {
        const employees = await Employee.find({}).populate('department')
        response.json(employees.map(employee => employee.toJSON()))
    }
)

// Update an Employee
employeeRouter.put('/:id', async (request, response) => {
    // Get a copy of the employee.
    const employee = await Employee.findById(request.params.id)

    // Get departments that require updating
    const departmentsToBeAdded = request.body.department.filter(depart => {
        return !employee.department.includes(depart.id)
    })

    // Change the list of employee Object in the department to
    // A list of employee Ids if they exist.
    if (departmentsToBeAdded.length !== 0) {
        departmentsToBeAdded.forEach(element => {
            let employeeIds = []

            element.employees.forEach(emp => {
                employeeIds.push(emp.id)
            })
            element.employees = employeeIds
        })
    }

    // Update the department id list to be updated to the database
    request.body.department = request.body.department.map(
        department => department.id
    )

    const updatedEmployee = await Employee.findByIdAndUpdate(
        request.params.id,
        request.body,
        { returnOriginal: false }
    ).populate('department')

    // updating the new departments.
    await departmentsToBeAdded.forEach(async department => {
        // Add the employee Id to the department as reference
        department.employees = department.employees.concat(employee._id)

        // Update the department in the database
        await Department.findByIdAndUpdate(department.id, department)
    })

    if (updatedEmployee) {
        response.json(updatedEmployee.toJSON())
    } else {
        res = responseMessage(500, 'Failed to Update', null)
        response.status(500).send(res)
    }
})

// Delete one employee using id.
employeeRouter.delete(
    '/:id',
    middleware.tokenExtracter,
    middleware.checkAdmin,
    async (request, response) => {
        await Employee.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
)

// Get one employee using id.
employeeRouter.get(
    '/:id',
    // middleware.tokenExtracter,
    // middleware.checkAdmin,
    async (request, response) => {
        const employee = await Employee.findById(request.params.id).populate(
            'department'
        )

        if (employee) {
            response.status(200).json(employee)
        } else {
            const res = responseMessage(404, 'Employee not found in database', null)
            response.status(404).send(res).end()
        }
    }
)

// Change Employee Password.
employeeRouter.put('/change-password', middleware.tokenExtracter, middleware.userExtractor, async (request, response) => {
    const correctUserPassword = request.user ? false : bcrypt.compare(request.body.oldPassword, request.user.passwordHass)

    if (!correctUserPassword){
        const res = responseMessage(401, "Invalid Password", null)
        response.status(401).send(res).end()
    }

    const newPasswordHass = hassPassword(request.body.newPassword)

    const updatedUser = {
        ...request.user,
        passwordHass: newPasswordHass
    }

    const updatedEmployee = await Employee.findByIdAndUpdate(
        request.user.id,
        updatedUser,
        { returnOriginal: false }
    ).populate('department')

    if (updatedEmployee) {
        response.json(updatedEmployee.toJSON())
    } else {
        res = responseMessage(500, 'Failed to Update', null)
        response.status(500).send(res)
    }
})

export default employeeRouter
