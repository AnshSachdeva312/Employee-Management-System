require("dotenv").config();
const express=require("express");
const morgan=require("morgan");
const connectDB=require("./Database/db");
const cors=require("cors");
const cookieParser=require("cookie-parser");
const path = require('path');
connectDB();
const app=express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
    origin:["http://localhost:5173"],
    credentials:true
}))
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(morgan("dev"));
app.use(cookieParser());
const authRouter = require("./Routes/authRoutes");
app.use("/api/auth", authRouter);
const userRouter = require("./Routes/userRoute");
app.use("/api/user", userRouter);
const announcementRouter = require("./Routes/announcementRoutes");
app.use("/api/announcements", announcementRouter);
const meetingRouter = require("./Routes/meetingRoutes");
app.use("/api/meetings", meetingRouter);
const taskRouter = require("./Routes/taskRoutes");
app.use("/api/tasks", taskRouter);
const loanRouter = require('./Routes/loanRoutes');
app.use('/api/loans', loanRouter);
const noticePeriodRouter = require('./Routes/noticeperiodRoutes');
app.use('/api/notice-periods', noticePeriodRouter);
const attendanceRouter = require('./Routes/attendanceRoutes');
app.use('/api/attendance', attendanceRouter);
app.listen(3000);