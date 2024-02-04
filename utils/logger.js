// Logging information
const infor = (...message) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...message)
    }
}

// Logging error information
const error = (...errorMessage) => {
    if (process.env.NODE_ENV !== 'test') {
        console.log(...errorMessage)
    }
}

export default {
    infor,
    error
}
