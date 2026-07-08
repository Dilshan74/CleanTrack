const CollectionRoute = require("../models/collectionRoute.js");


// Add Route

exports.addRoute = async(req,res)=>{

try{

const route = await CollectionRoute.create(req.body);


res.status(201).json({
success:true,
message:"Route created",
route
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};



// Get Routes

exports.getRoutes = async(req,res)=>{

try{

const routes = await CollectionRoute.find()
.populate("driver");


res.json({
success:true,
routes
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};



// Update Route

exports.updateRoute = async(req,res)=>{

try{


const route = await CollectionRoute.findByIdAndUpdate(

req.params.id,

req.body,

{
new:true
}

);


res.json({
success:true,
route
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};




// Delete Route

exports.deleteRoute = async(req,res)=>{

try{


await CollectionRoute.findByIdAndDelete(req.params.id);


res.json({
success:true,
message:"Route deleted"
});


}catch(error){

res.status(500).json({
message:error.message
});

}

};