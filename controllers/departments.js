import express, { response } from 'express'
import Department from '../models/department.js'
import { responseMessage } from '../utils/helper.js'
import logger from '../utils/logger.js'



const departmentRouter = express.Router()


// Get all Departments.
departmentRouter.get('/', async (request, response, next) => {
    try {
        const departments = await Department.find({}).populate('employees')
        if (departments) {
            response.json(departments)
        }
    } catch {
        exception => next(exception)
    }
})


// Create a department.
departmentRouter.post('/', async (request, response) => {
    const department = request.body

    logger.infor(department)

    const newDepartment = new Department({
        name: department.name
    })

    const savedDepartment = await newDepartment.save()
    if (savedDepartment) {
        response.status(201).json(savedDepartment)
    } else {
        const res = responseMessage(500, "Error Saving Data to Datbase")
        response.status(500).send(res)
    }
})

// Get a single deprtment using Id
departmentRouter.get("/:id", async (request, response, next) => {
    // const departmentId = Number(request.params.id)

    try {
        const department = await Department.findById(request.params.id)
        logger.infor('Department ===', department)
        if (department) {
            response.json(department)
        } else {
            const res = responseMessage(404, "department not found in database")
            response.status(404).send(res).end()
        }
    } catch (exception) {
        logger.infor("Error ==> ", exception)
        next(exception)
    }
})

// Delete  department using Id.
departmentRouter.delete('/:id', async (request, response, next) => {
    // Department.findByIdAndDelete(request.params.id).then(
    //     () => {
    //         response.status(204).end()
    //     }
    // ).catch(error => next(error))
    try {
        await Department.findByIdAndDelete(request.params.id)
        response.status(204).end()
    } catch (exception) {

        logger.infor(exception)
        next(exception)

    }
})

// Update a department using id.
departmentRouter.put('/:id', async (request, response, next) => {
    const body = request.body

    const department = {
        name: body.name
    }

    try {
        const updatedDepartment = await Department.findByIdAndUpdate(request.params.id, department, { new: true })
        if (updatedDepartment) {
            response.json(updatedDepartment)
        } else {
            res = responseMessage(500, "Failed to Update")
            response.status(500).send(res)
        }
    } catch (exception) {
        next(exception)
    }
})

export default departmentRouter