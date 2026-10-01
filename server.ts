import express from 'express';
import path from 'path';
import authRoutes from './server/routes/auth.js';
import categoryRoutes from './server/routes/categories.js';
import foodRoutes from './server/routes/food.js';
import orderRoutes from './server/routes/orders.js';
import feedbackRoutes from './server/routes/feedback.js';
import adminRoutes from './server/routes/admin.js';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Mount API endpoints
  app.use('/api/auth', authRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/food', foodRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/feedback', feedbackRoutes);
  app.use('/api/admin', adminRoutes);

  // System health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'CanteenX API', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Mount Vite middlewares in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production serve compiled bundle
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CanteenX] Application server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
