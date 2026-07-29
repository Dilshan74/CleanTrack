const mongoose = require("mongoose");


const driverSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },

    email:{
        type:String,
        required:true,
        unique:true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"]
    },

    phone:{
        type:String,
        required:true,
        trim: true,
        match: [/^\d{10}$/, "Phone number must be exactly 10 digits"]
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