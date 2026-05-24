const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const basicAuth = require('../middleware/auth');

const VALID_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

// POST /api/orders — public
router.post('/', async (req, res, next) => {
  try {
    const { items, ...orderData } = req.body;

    let total = 0;
    const resolvedItems = await Promise.all(
      items.map(async (item) => {
        const product = await Product.findById(item.productId);
        if (!product) {
          const err = new Error(`Product ${item.productId} not found`);
          err.status = 404;
          throw err;
        }
        const unitPrice = product.price;
        total += unitPrice * item.quantity;
        return { product: product._id, size: item.size, quantity: item.quantity, unitPrice };
      })
    );

    const order = await Order.create({ ...orderData, items: resolvedItems, total });
    const populated = await order.populate('items.product');
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders — admin only
router.get('/', basicAuth, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('items.product').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
});

// GET /api/orders/:id — admin only
router.get('/:id', basicAuth, async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/orders/:id/status — admin only
router.patch('/:id/status', basicAuth, async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
    }
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
