const mongoose = require('mongoose');

async function fix() {
    console.log('Connecting to mongoose...');
    await mongoose.connect('mongodb://127.0.0.1:27017/car_rental', { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected.');
    const db = mongoose.connection;
    const cars = await db.collection('cars').find({}).toArray();
    const bookings = await db.collection('bookings').find({}).toArray();
    
    console.log(`Found ${cars.length} cars and ${bookings.length} bookings.`);
    for (let b of bookings) {
        if (!b.carId) continue;
        const car = cars.find(c => c._id.toString() === b.carId || String(c._id) === String(b.carId));
        if (car) {
            console.log(`Fixing booking ${b._id} to ownerId ${car.ownerId}`);
            await db.collection('bookings').updateOne(
                { _id: b._id }, 
                { $set: { 
                    ownerId: car.ownerId, 
                    carName: car.name,
                    carNumber: car.plateNumber || 'Unknown',
                    customerName: 'Test Customer',
                    ownerName: 'MITHUL'
                }}
            );
        } else {
            console.log(`Car ${b.carId} not found for booking ${b._id}`);
            // Fallback: Just set the ownerId to the first car's owner if it's the only one
            if (cars.length > 0) {
               await db.collection('bookings').updateOne({ _id: b._id }, { $set: { ownerId: cars[0].ownerId, ownerName: 'MITHUL' } });
            }
        }
    }
    console.log('Done.');
    process.exit(0);
}

fix().catch(err => {
    console.error(err);
    process.exit(1);
});
