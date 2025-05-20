import express from 'express';
import authRoutes from './auth.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import brandRoutes from './brand.routes';
import cartRoutes from './cart.routes';

const router = express.Router();

// Mount all routes here
router.use('/auth', authRoutes);
router.use('/category', categoryRoutes);
router.use('/products', productRoutes);
router.use('/brands', brandRoutes);
router.use('/carts', cartRoutes);

export default router;
