import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import app from './app';
//TCP1
mongoose.connect(process.env.MONGO_URL as string, {})
    .then(data => {
        console.log("MongoDB connection succeed");
        const PORT = process.env.PORT ?? 3000;
        app.listen(PORT, function () {
            console.log(`The server is running successfully on http://localhost:${PORT} \n`);
            console.info(`The admin is running successfully on http://localhost:${PORT}/admin`)
        });
    })
    .catch((err) => console.log("ERROR on connection MongoDB", err));

