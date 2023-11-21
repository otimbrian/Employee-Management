import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 5
    },
    surname: {
        type: String,
        required: true,
        minlength: 5
    },
    department: String,
})

employeeSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject._v
    }
})

export default mongoose.model('Employee', employeeSchema)