const Truck = require("../models/truck");

// Add a new truck
exports.addTruck = async (req, res) => {
    try {
        const { plateNumber, capacity, status } = req.body;
        
        const existingTruck = await Truck.findOne({ plateNumber });
        if (existingTruck) {
            return res.status(400).json({ success: false, message: "Truck already exists" });
        }

        const truck = await Truck.create({
            plateNumber,
            capacity,
            status
        });

        res.status(201).json({ success: true, truck });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all trucks
exports.getTrucks = async (req, res) => {
    try {
        const trucks = await Truck.find().populate("assignedDriver", "name email");
        res.json({ success: true, trucks });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a truck
exports.updateTruck = async (req, res) => {
    try {
        const { plateNumber, capacity, status, assignedDriver } = req.body;
        
        let updateData = { plateNumber, capacity, status };
        if (assignedDriver !== undefined) {
            updateData.assignedDriver = assignedDriver;
        }

        const truck = await Truck.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );

        if (!truck) {
            return res.status(404).json({ success: false, message: "Truck not found" });
        }

        res.json({ success: true, truck });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a truck
exports.deleteTruck = async (req, res) => {
    try {
        const truck = await Truck.findByIdAndDelete(req.params.id);
        
        if (!truck) {
            return res.status(404).json({ success: false, message: "Truck not found" });
        }

        res.json({ success: true, message: "Truck deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
