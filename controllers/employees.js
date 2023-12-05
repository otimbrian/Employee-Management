import express from 'express'
// const employeeRouter = require('express').Router()
import Employee from '../models/employee.js'
import Department from '../models/department.js'
import logger from '../utils/logger.js'

const employeeRouter = express.Router()

employeeRouter.get('/', async (request, response) => {
    const employees = await Employee.find({}).populate('department')
    response.json(employees)

})

// Create An Employee.

employeeRouter.post('/', async (request, response, next) => {

    // get the request body.
    const body = request.body

    // const department = Department.findById(body.departmentId)
    const departmentsIds = []

    body.department.forEach(async department => {
        const dep = await Department.findById(department.id)
        departmentsIds.push(dep)
    })
    logger.infor(departmentsIds)

    // const departments = await Department.find({
    //     "id" : {
    //       "$in" : departmentsIds
    //      }
    //   })

    // const dep = await Department.findById(departmentsIds[0])

    // logger.infor(dep)
    // console.log("Retrieved Departments ==>", departments)
    
    // // logger.infor("Department after adding =====>", departments)

    // const newEmployee = new Employee({
    //     name: body.name,
    //     surname: body.surname,
    //     department: body.department
    // })

    // logger.infor("New Employee", newEmployee)

    // try {
    //     const createdEmployee = await newEmployee.save()
    //     logger.infor("Created Employee", createdEmployee)

    //     if (createdEmployee) {
    //         logger.infor("Some Departments ===> ", departments)
    //         departments.forEach(async depart => {
    //             depart.employees.concat(createdEmployee.id)
    //             await depart.save()
    //         })

    //         response.status(201).json(createdEmployee)
    //     } else {
    //         const res = responseMessage(500, "Error Saving Data to Datbase")
    //         response.status(500).send(res)
    //     }
    // } catch (err) {
    //     logger.error("Error in Creating Employee ===>", err.message)
    //     next(err)
    // }

})


employeeRouter.delete('/:id', async (request, response, next) => {
    try {
        await Employee.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch (exception) {
        next(exception)
    }
})
export default employeeRouter