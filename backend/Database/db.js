const mongoose=require("mongoose");
async function connectDB(){
    await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to MongoDB");
}
module.exports=connectDB;