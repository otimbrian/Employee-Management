import bcrypt from 'bcrypt'

export const responseMessage = (status, message, data) => {
    return data === null
        ? {
            status: status,
            message: message
        }
        : {
            status: status,
            message: message,
            data: data
        }
}

export const hassPassword = async (password) => {
    const saltRounds = 10
    const passwordHass = await bcrypt.hash(body.password, saltRounds)

    return passwordHass
}
