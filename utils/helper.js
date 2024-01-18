

export const responseMessage = (status, message, data) => {
    return data === null
        ? {
            status: status,
            message: message,
        }
        : {
            status: status,
            message: message,
            data: data,
        }
}