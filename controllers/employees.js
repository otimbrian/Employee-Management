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
        console.log("Saved Employee ----->", savedEmployee)

        // Add the employee reference id to Each department.
        // logger.infor(body.department)
        await body.department.forEach(async depart => {

            // Transform the list of employees into a list of ids
            depart.employees = await depart.employees.map(emplo => emplo.id)

            // Add the reference id
            // Add the new created user
            depart.employees = depart.employees.concat(savedEmployee._id)

            // Update the department
            await Department.findByIdAndUpdate(depart.id, depart)
        })

        const requiredUser = await Employee.findById(savedEmployee._id).populate('department')
        response.status(201).json(requiredUser).end()
    }
)

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
employeeRouter.put(
    '/change',
    middleware.tokenExtracter,
    middleware.userExtractor,
    async (request, response) => {
        // Check if the old password provided matches the one in the database.
        const correctUserPassword = request.user
            ? bcrypt.compare(request.body.oldPassword, request.user.passwordHass)
            : false
        // If the old password provided doesnt match,
        // Send invalid password response.
        if (!correctUserPassword) {
            const res = responseMessage(401, 'Invalid Password', null)
            response.status(401).send(res).end()
        } else {
            // If the old password Matches,
            // Proceed to create a password hass of the new password.
            const newPasswordHass = await hassPassword(request.body.newPassword)

            // Create a user Object for update.
            // Change the password Hass value
            request.user.passwordHass = newPasswordHass

            // Carry out the update operation.
            const updatedEmployee = await Employee.findByIdAndUpdate(
                request.user._id,
                request.user,
                { returnOriginal: false }
            ).populate('department')

            if (updatedEmployee) {
                // If the update was successful, send the updated object.
                response.json(updatedEmployee.toJSON())
            } else {
                res = responseMessage(500, 'Failed to Update', '')
                response.status(500).send(res)
            }
        }
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

    // Update the department to a list id list to be updated to the database
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

export default employeeRouter
