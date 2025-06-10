const Product = require('../models/productModel');
const Order = require('../models/orderModel');

exports.createProducts = async (req, res) => {
    try {
        const productArray = JSON.parse(req.body.products);
        const files = req.files;

        const results = [];

        for (let i = 0; i < productArray.length; i++) {
            const p = productArray[i];

            const variantNames = ['A', 'B', 'C', 'D', 'E', 'F'];
            const variants = variantNames.map((v) => {
                const custom = p.variants?.find((x) => x.name === v);
                return {
                    name: v,
                    available: custom ? custom.available : true
                };
            });

            const newProduct = new Product({
                code: p.code,
                subCategoryId: p.subCategoryId,
                setSize: p.setSize,
                image: files[i]?.filename || '',
                variants
            });

            await newProduct.save();
            results.push(newProduct);
        }

        res.status(201).json({ success: true, message: 'Products created', data: results });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.getProductsBySubCategoryId = async (req, res) => {
    try {
        const { subCategoryId } = req.query;

        if (!subCategoryId) {
            return res.status(400).json({ success: false, error: 'subCategoryId is required' });
        }

        const products = await Product.find({ subCategoryId }).select('code image')

        res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

exports.getSingleProduct = async (req, res) => {
    try {
        const { productId } = req.query;

        if (!productId) {
            return res.status(400).json({ success: false, error: 'productId is required' });
        }

        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.addToOrder = async (req, res) => {
    try {
        const { userId, productCode, variantName, increment = 1 } = req.body;

        const today = new Date().toISOString().split('T')[0];

        let order = await Order.findOne({ userId, date: today });

        if (!order) {
            if (increment <= 0) {
                return res.status(400).json({ success: false, message: "Cannot decrement item that doesn't exist." });
            }
            order = new Order({ userId, date: today, items: [] });
        }

        const existingItemIndex = order.items.findIndex(
            (item) => item.productCode === productCode && item.variantName === variantName
        );

        if (existingItemIndex > -1) {
            order.items[existingItemIndex].quantity += increment;

            // If quantity drops to 0 or below, remove the item
            if (order.items[existingItemIndex].quantity <= 0) {
                order.items.splice(existingItemIndex, 1);
            }
        } else {
            if (increment > 0) {
                order.items.push({ productCode, variantName, quantity: increment });
            } else {
                return res.status(400).json({ success: false, message: "Cannot decrement non-existing item." });
            }
        }

        // If all items are removed and no items left, optionally delete order
        if (order.items.length === 0) {
            await Order.deleteOne({ _id: order._id });
            return res.status(200).json({ success: false, message: 'Order deleted as no items remain.' });
        }

        await order.save();
        res.status(200).json({ success: true, message: 'Order updated', order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.getOrdersGrouped = async (req, res) => {
    try {
        const { userId } = req.query;

        const orders = await Order.find({ userId });

        const groupedByDate = {};

        for (const order of orders) {
            const date = order.date;

            if (!groupedByDate[date]) {
                groupedByDate[date] = {};
            }

            for (const item of order.items) {
                const key = item.productCode;

                if (!groupedByDate[date][key]) {
                    groupedByDate[date][key] = {};
                }

                groupedByDate[date][key][item.variantName] =
                    (groupedByDate[date][key][item.variantName] || 0) + item.quantity;
            }
        }

        const result = Object.keys(groupedByDate)
            .sort((a, b) => new Date(b) - new Date(a)) // latest date first
            .map((date) => {
                const products = Object.entries(groupedByDate[date]).map(([code, variants]) => {
                    const variantStr = Object.entries(variants)
                        .map(([v, qty]) => `${v} - ${qty}`)
                        .join(' / ');
                    return `${code} → ${variantStr}`;
                });

                return {
                    date,
                    products,
                };
            });

        res.status(200).json({ success: true, message: 'Grouped orders', data: result });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
