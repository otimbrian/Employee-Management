// require('dotenv').config()
import dotenv from 'dotenv'
dotenv.config()

// Get the Port and Mongo Connection URI from the dotenc file
const PORT = process.env.PORT
const MONGODB_URI = process.env.MONGODB_URI

export default {
    MONGODB_URI,
    PORT
}