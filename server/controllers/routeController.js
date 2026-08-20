const Route = require("../models/route.js");
const { isValidLocation, getPostalCodeForCity } = require("../utils/locationData");

// Add Route

exports.addRoute = async(req,res)=>{
try{
    const { startPoint, endPoint, province, district, city } = req.body;
    
    if (!province) {
        return res.status(400).json({ success: false, message: "Province is required." });
    }
    if (!district) {
        return res.status(400).json({ success: false, message: "District is required." });
    }
    if (!city) {
        return res.status(400).json({ success: false, message: "City is required." });
    }
    
    if (!isValidLocation(province, district, city)) {
        return res.status(400).json({ success: false, message: "Invalid combination of Province, District, and City." });
    }
    
    const resolvedPostalCode = getPostalCodeForCity(province, district, city);
    if (!resolvedPostalCode) {
        return res.status(400).json({ success: false, message: "Could not determine postal code for the selected City." });
    }
    
    req.body.postalCode = resolvedPostalCode;
    req.body.areas = [
        {
            province,
            district,
            city,
            areaName: city
        }
    ];

    if (!startPoint || !startPoint.name || startPoint.latitude === undefined || startPoint.longitude === undefined) {
        return res.status(400).json({ success: false, message: "Start point is required with valid name, latitude and longitude." });
    }
    if (!endPoint || !endPoint.name || endPoint.latitude === undefined || endPoint.longitude === undefined) {
        return res.status(400).json({ success: false, message: "End point is required with valid name, latitude and longitude." });
    }
    if (isNaN(startPoint.latitude) || isNaN(startPoint.longitude) || isNaN(endPoint.latitude) || isNaN(endPoint.longitude)) {
        return res.status(400).json({ success: false, message: "Start and End point coordinates must be valid numbers." });
    }
    if (Number(startPoint.latitude) === Number(endPoint.latitude) && Number(startPoint.longitude) === Number(endPoint.longitude)) {
        return res.status(400).json({ success: false, message: "Start and End points cannot be exactly identical." });
    }

    const route = await Route.create(req.body);

    try {
        const CollectionRoute = require("../models/collectionRoute.js");
        await CollectionRoute.create({
            routeName: route.routeName,
            area: city,
            postalCode: resolvedPostalCode,
            collectionDay: "Scheduled",
            collectionTime: route.collectionTime,
            driver: route.assignedDriver || null,
            status: "Active"
        });
    } catch (err) {
        console.error("Failed to create CollectionRoute:", err.message);
    }

    // Sync Driver's assignedRoute and vehicleNumber if assigned during creation
    if (req.body.assignedDriver) {
        const Driver = require("../models/driver.js");
        const updateData = { assignedRoute: route._id, status: "Assigned" };
        if (req.body.assignedTruck) {
            updateData.vehicleNumber = req.body.assignedTruck;
            const Truck = require("../models/truck.js");
            await Truck.findByIdAndUpdate(req.body.assignedTruck, { assignedDriver: req.body.assignedDriver });
        }
        await Driver.findByIdAndUpdate(req.body.assignedDriver, updateData);
    }

    // Create admin panel notification for new route
    try {
        const Notification = require("../models/notification.js");
        await Notification.create({
            receiver: req.user.id,
            receiverType: "Admin",
            title: "New Route Created",
            message: `Route "${route.routeName}" has been added from ${startPoint.name} to ${endPoint.name}.`,
            notificationType: "Route",
            isRead: false
        });
    } catch (notifErr) {
        console.error("Failed to create route notification:", notifErr.message);
    }

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
    .populate({
        path: "assignedDriver",
        populate: { path: "vehicleNumber" }
    });

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
    const { startPoint, endPoint, province, district, city } = req.body;
    
    if (province !== undefined || district !== undefined || city !== undefined) {
        const currentRoute = await Route.findById(req.params.id);
        if (!currentRoute) {
            return res.status(404).json({ success: false, message: "Route not found." });
        }
        const finalProvince = province !== undefined ? province : currentRoute.province;
        const finalDistrict = district !== undefined ? district : currentRoute.district;
        const finalCity     = city !== undefined ? city : currentRoute.city;
        
        if (!isValidLocation(finalProvince, finalDistrict, finalCity)) {
            return res.status(400).json({ success: false, message: "Invalid combination of Province, District, and City." });
        }
        
        const resolvedPostalCode = getPostalCodeForCity(finalProvince, finalDistrict, finalCity);
        if (!resolvedPostalCode) {
            return res.status(400).json({ success: false, message: "Could not determine postal code for the selected City." });
        }
        req.body.postalCode = resolvedPostalCode;
        req.body.areas = [
            {
                province: finalProvince,
                district: finalDistrict,
                city: finalCity,
                areaName: finalCity
            }
        ];
    }

    if (startPoint !== undefined || endPoint !== undefined) {
        let sp = startPoint;
        let ep = endPoint;
        if (!sp || !ep) {
            const currentRoute = await Route.findById(req.params.id);
            if (currentRoute) {
                if (!sp) sp = currentRoute.startPoint;
                if (!ep) ep = currentRoute.endPoint;
            }
        }
        if (sp || ep) {
            if (!sp || !sp.name || sp.latitude === undefined || sp.longitude === undefined) {
                return res.status(400).json({ success: false, message: "Start point is required with valid name, latitude and longitude." });
            }
            if (!ep || !ep.name || ep.latitude === undefined || ep.longitude === undefined) {
                return res.status(400).json({ success: false, message: "End point is required with valid name, latitude and longitude." });
            }
            if (isNaN(sp.latitude) || isNaN(sp.longitude) || isNaN(ep.latitude) || isNaN(ep.longitude)) {
                return res.status(400).json({ success: false, message: "Start and End point coordinates must be valid numbers." });
            }
            if (Number(sp.latitude) === Number(ep.latitude) && Number(sp.longitude) === Number(ep.longitude)) {
                return res.status(400).json({ success: false, message: "Start and End points cannot be exactly identical." });
            }
        }
    }

    const oldRoute = await Route.findById(req.params.id);
    const route = await Route.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new:true }
    );

    // Sync Driver and Truck assignments
    const Driver = require("../models/driver.js");
    const Truck = require("../models/truck.js");

    const driverId = req.body.assignedDriver !== undefined ? req.body.assignedDriver : (route ? route.assignedDriver : null);
    const truckId = req.body.assignedTruck !== undefined ? req.body.assignedTruck : (route ? route.assignedTruck : null);

    // 1. Clear old driver's assignments if driver changed
    if (req.body.assignedDriver !== undefined && oldRoute && oldRoute.assignedDriver && oldRoute.assignedDriver.toString() !== req.body.assignedDriver) {
        await Driver.findByIdAndUpdate(oldRoute.assignedDriver, { assignedRoute: null, vehicleNumber: null, status: "Available" });
        if (oldRoute.assignedTruck) {
            await Truck.findByIdAndUpdate(oldRoute.assignedTruck, { assignedDriver: null });
        }
    }

    // 2. Set new driver's assignments
    if (driverId) {
        const updateData = { assignedRoute: route._id, status: "Assigned" };
        if (truckId) {
            updateData.vehicleNumber = truckId;
            await Truck.findByIdAndUpdate(truckId, { assignedDriver: driverId });
        } else {
            updateData.vehicleNumber = null;
        }
        await Driver.findByIdAndUpdate(driverId, updateData);
    }

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