const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET  /api/users/list?page=1&pageSize=10&keyword=
router.get("/list", userController.list);

// GET  /api/users/1
router.get("/:id", userController.detail);

// POST /api/users
router.post("/", userController.create);

// PUT  /api/users/1
router.put("/:id", userController.update);

// DELETE /api/users/1
router.delete("/:id", userController.remove);

// POST /api/users/generate - 批量生成测试数据
router.post("/generate", userController.generateTestData);

module.exports = router;
