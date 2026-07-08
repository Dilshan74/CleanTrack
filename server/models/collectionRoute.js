const mongoose = require("mongoose");


const collectionRouteSchema = new mongoose.Schema({

    routeName:{
        type:String,
        required:true
    },

    area:{
        type:String,
        required:true
    },


    collectionDay:{
        type:String,
        required:true
    },


    collectionTime:{
        type:String,
        required:true
    },


    driver:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Driver",
        default:null
    },


    status:{
        type:String,
        default:"Active"
    }


},
{
    timestamps:true
});


module.exports = mongoose.model(
    "CollectionRoute",
    collectionRouteSchema
);