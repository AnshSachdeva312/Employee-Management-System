// controllers/loanController.js
const Loan = require('../models/loanModel');
const User = require('../models/userModel');
const Salary = require('../models/salaryModel');

const createLoan = async (req, res) => {
    try {
        const { loanType, amount, purpose, repaymentPeriod } = req.body;
        const employeeId=req.user.id;
        console.log(employeeId)
        // Basic validation
        if (!loanType || !amount || !purpose || !repaymentPeriod) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        // Check if employee exists
        const employee = await User.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found" });
        }

        // Check salary to determine eligibility
        const salary = await Salary.findOne({ employeeId });
        if (!salary) {
            return res.status(400).json({ success: false, message: "Salary record not found" });
        }

        // Simple eligibility check - loan amount shouldn't exceed 3 months salary
        if (amount > salary.current * 3) {
            return res.status(400).json({ 
                success: false, 
                message: `Loan amount exceeds maximum eligible amount of ${salary.current * 3}` 
            });
        }

        const newLoan = new Loan({
            employeeId,
            loanType,
            amount,
            purpose,
            repaymentPeriod
        });

        await newLoan.save();

        res.status(201).json({ success: true, loan: newLoan });

    } catch (error) {
        console.error("Error creating loan:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const getMyLoans = async (req, res) => {
    try {
        const employeeId = req.user.id;
        const loans = await Loan.find({ employeeId }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, loans });

    } catch (error) {
        console.error("Error fetching loans:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const submitLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const employeeId = req.user.id;

        const loan = await Loan.findOne({ _id: loanId, employeeId });

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        if (loan.status !== 'DRAFT') {
            return res.status(400).json({ success: false, message: "Only draft loans can be submitted" });
        }

        loan.status = 'SUBMITTED';
        loan.updatedAt = new Date();
        await loan.save();

        res.status(200).json({ success: true, loan });

    } catch (error) {
        console.error("Error submitting loan:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const getLoansForApproval = async (req, res) => {
    try {
        // Only managers/admins can access this
        if (req.user.role !== 1) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const loans = await Loan.find({ status: 'SUBMITTED' })
            .populate('employeeId', 'name email')
            .sort({ createdAt: 1 });

        res.status(200).json({ success: true, loans });

    } catch (error) {
        console.error("Error fetching loans for approval:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const approveRejectLoan = async (req, res) => {
    try {
        const { loanId } = req.params;
        const { action, comments } = req.body;
        const approverId = req.user.id;

        // Only managers/admins can access this
        if (req.user.role !== 1) {
            return res.status(403).json({ success: false, message: "Unauthorized" });
        }

        const loan = await Loan.findById(loanId);

        if (!loan) {
            return res.status(404).json({ success: false, message: "Loan not found" });
        }

        if (loan.status !== 'SUBMITTED') {
            return res.status(400).json({ success: false, message: "Only submitted loans can be processed" });
        }

        if (action === 'APPROVE') {
            loan.status = 'APPROVED';
        } else if (action === 'REJECT') {
            loan.status = 'REJECTED';
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        loan.approvedBy = approverId;
        loan.comments = comments;
        loan.updatedAt = new Date();
        await loan.save();

        res.status(200).json({ success: true, loan });

    } catch (error) {
        console.error("Error processing loan:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

const calculateEMI = async (req, res) => {
    try {
        const { amount, repaymentPeriod } = req.body;

        if (!amount || !repaymentPeriod) {
            return res.status(400).json({ success: false, message: "Amount and repayment period are required" });
        }

        // Simple EMI calculation (assuming 0 interest)
        const emi = amount / repaymentPeriod;

        res.status(200).json({ 
            success: true, 
            emi: emi.toFixed(2),
            totalPayment: amount,
            repaymentPeriod 
        });

    } catch (error) {
        console.error("Error calculating EMI:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};
const uploadDocument = async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }
  
      const loanId = req.params.loanId;
      const loan = await Loan.findById(loanId);
  
      if (!loan) {
        // Clean up the uploaded file if loan doesn't exist
        fs.unlinkSync(req.file.path);
        return res.status(404).json({ success: false, message: "Loan not found" });
      }
  
      // Add the document to the loan
      loan.documents.push({
        path: req.file.path,
        originalName: req.file.originalname,
        uploadedAt: new Date()
      });
  
      await loan.save();
  
      res.status(200).json({ 
        success: true, 
        message: "Document uploaded successfully",
        document: {
          path: req.file.path,
          name: req.file.originalname
        }
      });
  
    } catch (error) {
      console.error("Error uploading document:", error);
      
      // Clean up the file if error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
  
      res.status(500).json({ 
        success: false, 
        message: error.message || "Failed to upload document" 
      });
    }
  };
  
  const getDocument = async (req, res) => {
    try {
      const loanId = req.params.loanId;
      const docIndex = req.params.docIndex;
      
      const loan = await Loan.findById(loanId);
      if (!loan || !loan.documents[docIndex]) {
        return res.status(404).json({ success: false, message: "Document not found" });
      }
  
      const doc = loan.documents[docIndex];
      const filePath = path.join(__dirname, '../', doc.path);
  
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: "File not found" });
      }
  
      res.download(filePath, doc.originalName);
  
    } catch (error) {
      console.error("Error retrieving document:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
module.exports = {
    createLoan,
    getMyLoans,
    submitLoan,
    getLoansForApproval,
    approveRejectLoan,
    calculateEMI,
    uploadDocument,
    getDocument
};