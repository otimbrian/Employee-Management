import express, { response } from 'express'
import Department from '../models/department.js'
import { responseMessage } from '../utils/helper.js'
import middlewares from '../utils/middlewares.js'
import Employee from '../models/employee.js'

const departmentRouter = express.Router()

// Get all Departments.
departmentRouter.get(
    '/',
    middlewares.tokenExtracter,
    middlewares.checkAdmin,
    async (request, response) => {
        const departments = await Department.find({}).populate('employees')
        if (departments) {
            response.json(departments)
        }
    }
)

// Create a department.
departmentRouter.post(
    '/',
    middlewares.tokenExtracter,
    middlewares.checkAdmin,
    async (request, response) => {
        const department = request.body

        const newDepartment = new Department({
            name: department.name
        })

        const savedDepartment = await newDepartment.save()
        if (savedDepartment) {
            response.status(201).json(savedDepartment)
        } else {
            const res = responseMessage(500, 'Error Saving Data to Datbase')
            response.status(500).send(res)
        }
    }
)

// Get a single deprtment using Id
departmentRouter.get(
    '/:id',
    middlewares.tokenExtracter,
    middlewares.checkAdmin,
    async (request, response) => {
        // const departmentId = Number(request.params.id)
        const department = await Department.findById(request.params.id)

        if (department) {
            response.json(department)
        } else {
            const res = responseMessage(404, 'department not found in database')
            response.status(404).send(res).end()
        }
    }
)

// Delete  department using Id.
departmentRouter.delete(
    '/:id',
    middlewares.tokenExtracter,
    middlewares.checkAdmin,
    async (request, response) => {
        await Department.findByIdAndDelete(request.params.id)
        response.status(204).end()
    }
)

// Update a department using id.
departmentRouter.put('/:id', async (request, response) => {
    // Find the department by id
    const department = await Department.findById(request.params.id)

    // Filter out employees that need updating.
    const employeesToBeUpdated = request.body.employees.filter(employee => {
        return !department.employees.includes(employee.id)
    })

    // Change the list of department Objects in the employees to
    // A list of department Ids if they exist.
    if (employeesToBeUpdated.length !== 0) {
        employeesToBeUpdated.forEach(element => {
            let departmentIdIds = []

            element.department.forEach(dep => {
                departmentIdIds.push(dep.id)
            })
            element.department = departmentIdIds
        })
    }

    // Update change the department object to id to be updated to the database
    request.body.employees = request.body.employees.map(employee => employee.id)

    const updatedDepartment = await Department.findByIdAndUpdate(
        request.params.id,
        request.body,
        { new: true }
    ).populate('employees')

    // updating the employees to
    //  have the Ids of the updated department..
    await employeesToBeUpdated.forEach(async employee => {
        // Add the employee Id to the department as reference
        employee.department = employee.department.concat(department._id)

        // Update the department in the database
        await Employee.findByIdAndUpdate(employee.d, employee)
    })

    if (updatedDepartment) {
        response.json(updatedDepartment)
    } else {
        res = responseMessage(500, 'Failed to Update')
        response.status(500).send(res)
    }
})

export default departmentRouter
