const express = require('express');
const usersRouter = require('./routes/users');
const ordersRouter = require('./routes/orders');

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Project 3: Database Integration API is running',
    endpoints: {
      users: '/api/users',
      userOrders: '/api/users/:id/orders',
      orders: '/api/orders',
    },
  });
});

app.use('/api/users', usersRouter);
app.use('/api/orders', ordersRouter);

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'internal server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
