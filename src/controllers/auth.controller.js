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
      });
  
      // Guardar el usuario en la base de datos
      const userSaved = await newUser.save();
  
      // Enviar mensaje a RabbitMQ sin afectar la respuesta al cliente
      try {
        await producer.publishMessage("registro", userSaved);
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
    const { email, password } = req.body;
    const userFound = await User.findOne({ email });

    if (!userFound)
      return res.status(400).json({
        message: ["The email does not exist"],
      });

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({
        message: ["The password is incorrect"],
      });
    }

    const token = await createAccessToken({
      id: userFound._id,
      username: userFound.username,
    });

    res.cookie("token", token, {
      httpOnly: process.env.NODE_ENV !== "development",
      secure: true,
      sameSite: "none",
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
