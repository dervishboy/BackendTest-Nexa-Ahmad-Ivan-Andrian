const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

router.post('/register', employeeController.registerKaryawan);
router.get('/list', employeeController.getKaryawanList);
router.put('/update/:nip', employeeController.updateKaryawan);
router.patch('/deactivate/:nip', employeeController.deactivateKaryawan);

module.exports = router;