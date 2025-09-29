import express from 'express';
import { signUp, signIn, getAddressOptions, getAllUsers  } from '../controllers/authController';

const router = express.Router();

// Auth routes
router.post('/signup', signUp);
router.post('/signin', signIn);

// Address options route
router.get('/address-options', getAddressOptions);
router.get('/users', getAllUsers);

export default router;