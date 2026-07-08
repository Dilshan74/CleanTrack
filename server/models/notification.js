const mongoose = require("mongoose");


const notificationSchema = new mongoose.Schema({

    receiver:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },


    receiverType:{
        type:String,
        enum:[
            "User",
            "Driver",
            "Admin"
        ],
        required:true
    },


    title:{
        type:String,
        required:true
    },


    message:{
        type:String,
        required:true
    },


    isRead:{
        type:Boolean,
        default:false
    },


    notificationType:{
        type:String,
        enum:[
            "Collection",
            "Route",
            "Request",
            "System"
        ]
    }


},
{
    timestamps:true
});


module.exports =
mongoose.model(
"notification",
notificationSchema
);