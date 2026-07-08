const mongoose = require("mongoose");


const driverSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true
    },

    phone:{
        type:String,
        required:true
    },

    licenseNumber:{
        type:String,
        required:true
    },

    vehicleNumber:{
        type:String,
        required:true
    },

    assignedRoute:{
        type:String,
        default:"Not Assigned"
    },

    status:{
        type:String,
        default:"Available"
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("Driver",driverSchema);