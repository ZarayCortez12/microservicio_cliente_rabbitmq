import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TOKEN_SECRET } from "../config.js";
import { createAccessToken } from "../libs/jwt.js";
import Producer from "../producer.js";

const producer = new Producer();

export const register = async (req, res) => {
  try {
    const {
      nombres,
      apellidos,
      tipoIdentificacion,
      identificacion,
      fechaNacimiento,
      telefono,
      correo,
      direccion,
      genero,
      ciudad,
    } = req.body;

    // Validar si el correo, documento o teléfono ya existen
    const userFound = await User.findOne({
      $or: [{ correo }, { identificacion }, { telefono }],
    });
    if (userFound) {
      const errors = [];
      if (userFound.correo === correo)
        errors.push("El correo ya está registrado");
      if (userFound.identificacion === identificacion)
        errors.push("El documento ya está registrado");
      if (userFound.telefono === telefono)
        errors.push("El teléfono ya está registrado");

      return res.status(400).json({
        error: "Validation error",
        message: errors,
      });
    }

    // Crear el usuario si no hay duplicados
    const newUser = new User({
      nombres,
      apellidos,
      tipoIdentificacion,
      identificacion,
      fechaNacimiento,
      telefono,
      correo,
      direccion,
      genero,
      password: "123456",
      ciudad,
    });

    // Guardar el usuario en la base de datos
    const userSaved = await newUser.save();

    // Enviar mensaje a RabbitMQ sin afectar la respuesta al cliente
    try {
      await producer.publishMessage({
        message: "Nuevo usuario registrado",
        user: {
          id: userSaved._id,
          nombres: userSaved.nombres,
          apellidos: userSaved.apellidos,
          correo: userSaved.correo,
          identificacion: userSaved.identificacion,
          direccion: userSaved.direccion,
          telefono: userSaved.telefono,
          genero: userSaved.genero,
          ciudad: userSaved.ciudad,
        },
      });
      console.log("Mensaje enviado a RabbitMQ");
    } catch (rabbitError) {
      console.error("Error al enviar mensaje a RabbitMQ:", rabbitError);
    }

    // Enviar respuesta al cliente
    res.json({
      id: userSaved._id,
      correo: userSaved.correo,
    });
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { identificacion, correo } = req.body;
    const userFound = await User.findOne({ identificacion });

    if (!userFound)
      return res.status(400).json({
        message: ["Usuario no registrado"],
      });

    if (userFound.correo !== correo)
      return res.status(400).json({
        message: ["El correo no coincide"],
      });

    res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const verifyToken = async (req, res) => {
  const { token } = req.cookies;
  if (!token) return res.send(false);

  jwt.verify(token, TOKEN_SECRET, async (error, user) => {
    if (error) return res.sendStatus(401);

    const userFound = await User.findById(user.id);
    if (!userFound) return res.sendStatus(401);

    return res.json({
      id: userFound._id,
      username: userFound.username,
      email: userFound.email,
    });
  });
};

export const logout = async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
  });
  return res.sendStatus(200);
};

export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find();
    res.json(usuarios);
    console.log("estos son los usuarios: ", usuarios);
  } catch (error) {
    return res.status(404).json({ message: "Usuario no Encontrado" });
  }
};

export const getUsuario = async (req, res) => {
  try {
    console.log(req.params);
    const usuario = await User.find({ identificacion: req.params.identificacion });
    res.json(usuario);
  } catch (error) {
    return res.status(404).json({ message: "Usuario no Encontrado" });
  }
};
