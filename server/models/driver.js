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

    vehicleNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Truck",
        default: null
    },

    assignedRoute: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Route",
        default: null
    },

    location: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
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