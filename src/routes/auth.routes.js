import { Router } from 'express';
import { register, login, verifyToken, logout, getUsuarios, getUsuario } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verifyToken', verifyToken);
router.post('/logout', logout);
router.get('/usuarios', getUsuarios);
router.get('/usuario/:identificacion', getUsuario);

export default router;
