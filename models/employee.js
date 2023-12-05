import mongoose from 'mongoose';
import mongooseUniqueValidator from 'mongoose-unique-validator';

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        unique: true,
    },
    surname: {
        type: String,
        required: true,
        minlength: 3
    },
    department: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department'
        }
    ],
})

// Unique validtor to check uniqueness of the employees being created.
// To void duplicates.
employeeSchema.plugin(mongooseUniqueValidator)

employeeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

const Employee =  mongoose.model('Employee', employeeSchema)
export default Employee