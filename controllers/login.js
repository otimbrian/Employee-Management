import bcrypt from 'bcrypt'
import express from 'express'
import jwt from 'jsonwebtoken'
import Employee from '../models/employee.js'
import { responseMessage } from '../utils/helper.js'

const loginRouter = express.Router()

loginRouter.post('/', async (request, response) => {
    const { email, password } = request.body

    const user = await Employee.findOne({ email })
    const correctPassword =
        user === null ? false : await bcrypt.compare(password, user.passwordHass)

    if (!(user && correctPassword)) {
        const res = responseMessage(401, 'invalid email or password', null)
        return response.status(401).send(res).end()
    }

    const userToken = {
        name: user.name,
        email: user.email,
        id: user._id,
        isAdmin: user.isAdmin
    }

    const token = jwt.sign(userToken, process.env.SECRET_KEY, {
        expiresIn: 60 * 60
    })
    const res = responseMessage(200, 'succesfully signed in', {
        token: token,
        username: user.name,
        userId: user._id
    })
    response.status(200).send(res).end()
})

export default loginRouter
