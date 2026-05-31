const express = require('express');
const { getTax } = require('../controllers/taxController');

const router = express.Router();

router.get('/', getTax);

module.exports = router;
