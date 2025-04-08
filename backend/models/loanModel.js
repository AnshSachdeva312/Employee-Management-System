const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loanSchema = new Schema({
    employeeId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    loanType: { type: String, required: true, enum: ['PERSONAL', 'EMERGENCY', 'EDUCATION', 'HOUSING'] },
    amount: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true },
    repaymentPeriod: { type: Number, required: true, min: 1, max: 60 }, // in months
    status: { 
        type: String, 
        enum: ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'DISBURSED'], 
        default: 'SUBMITTED' 
    },
    documents: [{
        path: { type: String, required: true },
        originalName: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }],
    emiDetails: {
        emi: Number,
        totalPayment: Number,
        repaymentPeriod: Number
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    comments: String,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Loan = mongoose.model('Loan', loanSchema);
module.exports=Loan;