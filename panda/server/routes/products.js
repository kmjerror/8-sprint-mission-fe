const express = require('express');
const Product = require('../models/Product');
const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { name, description, price, tags = [] } = req.body;
    if (!name || !description || price == null) {
      return res.status(400).json({ message: 'name, description, price are required' });
    }
    const doc = await Product.create({ name, description, price, tags });
    return res.status(201).json(doc);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const offset = Math.max(parseInt(req.query.offset ?? '0', 10), 0);
    const limitRaw = parseInt(req.query.limit ?? '20', 10);
    const limit = Math.min(isNaN(limitRaw) ? 20 : limitRaw, 100);
    const keyword = (req.query.keyword ?? '').trim();
    const sortParam = (req.query.sort ?? '').trim();

    const filter = keyword
      ? {
          $or: [
            { name: { $regex: keyword, $options: 'i' } },
            { description: { $regex: keyword, $options: 'i' } },
          ],
        }
      : {};

    const sort = sortParam === 'recent' ? { createdAt: -1 } : {};

    const [total, docs] = await Promise.all([
      Product.countDocuments(filter),
      Product.find(filter)
        .sort(sort)
        .skip(offset)
        .limit(limit)
        .select('name price createdAt'),
    ]);

    const list = docs.map(d => d.toJSON());
    return res.status(200).json({ total, list });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const doc = await Product.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const { name, description, price, tags, createdAt } = doc.toJSON();
    return res.status(200).json({ id, name, description, price, tags, createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const allowed = ['name', 'description', 'price', 'tags'];
    const updates = {};
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No updatable fields' });
    }

    const doc = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });
    if (!doc) return res.status(404).json({ message: 'Product not found' });

    const { name, description, price, tags, createdAt } = doc.toJSON();
    return res.status(200).json({ id, name, description, price, tags, createdAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ message: 'Invalid id format' });
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;