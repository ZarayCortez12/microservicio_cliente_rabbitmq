import mongoose from 'mongoose';

const UserSchema = mongoose.Schema({
    nombres:{
        type: String,
        required: true
    },
    apellidos:{
        type: String,
        required: true
    },
    tipoIdentificacion:{
        type: String,
        required: true
    },
    identificacion:{
        type: String,
        required: true,
        unique: true
    },
    fechaNacimiento:{
        type: Date,
        required: true,
        default: Date.now
    },
    telefono:{
        type: String,
        required: true
    },
    direccion:{
        type: String,
        required: true
    },
    ciudad:{
        type: String,
        required: true
    },
    correo:{
        type: String,
        required: true,
        unique: true
    },
    genero:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required: true
    },
})

export default mongoose.model('User', UserSchema);