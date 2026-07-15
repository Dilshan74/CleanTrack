const CollectionHistory =
require("../models/collectionHistory.js");


// Add Collection History

exports.addHistory = async(req,res)=>{

try{


const history =
await CollectionHistory.create(req.body);


res.status(201).json({

success:true,
message:"Collection history saved",
history

});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};




// Get All History

exports.getHistory = async(req,res)=>{

try{


const history =
await CollectionHistory.find()
.populate("user")
.populate("driver")
.populate("route");


res.json({

success:true,
history

});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};


// Get Driver History

exports.getDriverHistory = async(req,res)=>{

try{


const history =
await CollectionHistory.find({

driver:req.params.driverId

});


res.json({

success:true,
history

});


}
catch(error){

res.status(500).json({
message:error.message
});

}

};