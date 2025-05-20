import express from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import brandRoutes from './brand.routes';

const router = express.Router();

// Mount all routes here
router.use('/auth', authRoutes);
router.use('/category', categoryRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);

export default router;
