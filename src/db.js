import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://127.0.0.1:27017/cliente');
        console.log('Conectado a la base de datos cliente en MongoDB local');
    } catch (error) {
        console.error('Error de conexión a MongoDB', error);
    }
};