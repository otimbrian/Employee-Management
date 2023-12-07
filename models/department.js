import mongoose from 'mongoose'
import mongooseUniqueValidator from 'mongoose-unique-validator'

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        required: true,
        unique: true
    },
    employees: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee'
        }
    ]
})

// Unique validtor to check uniqueness of the department being created.
// To void duplicates.
departmentSchema.plugin(mongooseUniqueValidator)

departmentSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Department = mongoose.model('Department', departmentSchema)
export default Department
