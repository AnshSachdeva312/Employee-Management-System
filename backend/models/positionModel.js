const mongoose = require('mongoose');

const EmployeePositionSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    employmentType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        required: true
    },
    dateOfJoining: {
        type: Date,
        required: true
    },
    dateOfLeaving: {
        type: Date,
        default: null // Null if still employed
    },
    salary: {
        amount: { type: Number, required: true },
        currency: { type: String, default: 'USD' }
    },
    workLocation: {
        office: { type: String, required: true },
        remote: { type: Boolean, default: false }
    },
    reportsTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Manager or supervisor
        default: null
    },
    status: {
        type: String,
        enum: ['Active', 'On Leave', 'Resigned', 'Terminated'],
        default: 'Active'
    }
}, { timestamps: true });

const EmployeePosition = mongoose.model('EmployeePosition', EmployeePositionSchema);
module.exports = EmployeePosition