import express from 'express'
import Employee from '../models/employee.js'
import Department from '../models/department.js'
import { responseMessage } from '../utils/helper.js'

const employeeRouter = express.Router()

// Get all Employees in the database
employeeRouter.get('/', async (request, response) => {
    const employees = await Employee.find({}).populate('department')
    response.json(employees.map(employee => employee.toJSON()))

})

// Delete one employee using id.
employeeRouter.delete('/:id', async (request, response, next) => {
    await Employee.findByIdAndDelete(request.params.id)
    response.status(204).end()
})

// Get one employee using id.
employeeRouter.get('/:id', async (request, response, next) => {
    const employee = await Employee.findById(request.params.id)

    if (employee) {
        response.status(200).json(employee)
    } else {
        const res = responseMessage(404, "Employee not found in database")
        response.status(404).send(res)
    }
})

// Create an employee
employeeRouter.post('/', async (request, response, next) => {
    // Get the request body
    const body = request.body

    const departmentsIds = []
    body.department.forEach(department => departmentsIds.push(department.id))

    // Create a new Employee object
    const newEmployee = new Employee({
        name: body.name,
        surname: body.surname,
        department: departmentsIds
    })

    // save the employee
    const savedEmployee = await newEmployee.save()

    // Add the employee reference id to Each department.
    // logger.infor(body.department)
    await body.department.forEach(
        async depart => {

            // Add the reference id
            depart.employees = depart.employees.concat(savedEmployee._id)

            // Update the department
            await Department.findByIdAndUpdate(depart.id, depart)
        }
    )

    response.status(201).json(savedEmployee).end()
})

// Update an Employee
employeeRouter.put('/:id', async (request, response, next) => {
    const updatedEmployee = await Employee.findByIdAndUpdate(request.params.id, request.body, { new: true })
    response.json(updatedEmployee.toJSON())

})
export default employeeRouter