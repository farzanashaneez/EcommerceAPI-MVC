import express from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';

const router = express.Router();

// Mount all routes here
router.use('/auth', authRoutes);
router.use('/category', categoryRoutes);

export default router;
