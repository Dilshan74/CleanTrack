const Route = require("../models/route.js");


// Add Route

exports.addRoute = async(req,res)=>{

try{

const route = await Route.create(req.body);


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

const routes = await Route.find()
.populate("assignedDriver");


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


const route = await Route.findByIdAndUpdate(

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


await Route.findByIdAndDelete(req.params.id);


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

// Schedule a route
exports.assignSchedule = async (req, res) => {
    try {
        const { assignedDriver, collectionTime, truck } = req.body;
        
        const updateData = { assignedDriver, collectionTime };
        // if truck needs to be saved on driver:
        // this can be handled later or kept simple.
        
        const route = await Route.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );
        
        if (!route) {
            return res.status(404).json({ success: false, message: "Route not found" });
        }
        
        res.json({ success: true, message: "Schedule created", route });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};