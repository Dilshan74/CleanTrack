const User = require("../models/user.js");
const Driver = require("../models/driver.js");
const CollectionRoute = require("../models/collectionRoute.js");
const CollectionRequest = require("../models/collectionRequest.js");
const CollectionHistory = require("../models/collectionHistory.js");



// Dashboard Statistics

exports.getDashboardStats = async(req,res)=>{

try{


const totalUsers = await User.countDocuments();


const totalDrivers = await Driver.countDocuments();


const totalRoutes = await CollectionRoute.countDocuments();


const totalRequests = await CollectionRequest.countDocuments();



const pendingRequests = await CollectionRequest.countDocuments({
    status:"Pending"
});



const completedCollections = await CollectionHistory.countDocuments();



res.json({

success:true,

stats:{

totalUsers,

totalDrivers,

totalRoutes,

totalRequests,

pendingRequests,

completedCollections

}

});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};