
const express = require('express');
const loanRouter = express.Router();
const upload = require('../middleware/upload');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const {
    createLoan,
    getMyLoans,
    submitLoan,
    getLoansForApproval,
    approveRejectLoan,
    calculateEMI,
    uploadDocument,
    getDocument
} = require('../controllers/loanController');

// Employee routes
loanRouter.post('/', authMiddleware, createLoan);
loanRouter.get('/my-loans', authMiddleware, getMyLoans);
loanRouter.put('/:loanId/submit', authMiddleware, submitLoan);
loanRouter.post('/calculate-emi', authMiddleware, calculateEMI);

// Manager/Admin routes
loanRouter.get('/for-approval', authMiddleware, adminMiddleware, getLoansForApproval);
loanRouter.put('/:loanId/process', authMiddleware, adminMiddleware, approveRejectLoan);
loanRouter.post('/:loanId/documents',authMiddleware,upload.single('document'),uploadDocument);
  
loanRouter.get('/:loanId/documents/:docIndex',authMiddleware,getDocument);
module.exports = loanRouter;