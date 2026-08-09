const mongoose = require('mongoose');
const uri = 'mongodb://dilshan06akalanka2003_db_user:dilshan06akalanka2003@ac-5evu3iy-shard-00-00.vgib9ti.mongodb.net:27017,ac-5evu3iy-shard-00-01.vgib9ti.mongodb.net:27017,ac-5evu3iy-shard-00-02.vgib9ti.mongodb.net:27017/?ssl=true&replicaSet=atlas-ne6ybs-shard-0&authSource=admin&appName=Cluster0';
mongoose.connect(uri).then(async () => {
    const Route = mongoose.model('Route', new mongoose.Schema({ postalCode: String, status: String }, { strict: false }));
    const routes = await Route.find({
        postalCode: '80260',
        status: { $in: ['Active', 'Inactive', 'Completed'] }
    });
    console.log('Routes found:', routes.length);
    console.log('Routes:', routes);
    process.exit(0);
});
