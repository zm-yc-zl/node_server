const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const userRoutes = require("./routes/user");
const authRoutes = require("./routes/auth");
const errorHandler = require("./middlewares/errorHandler");
const auth = require("./middlewares/auth");

const app = express();

// ========== 安全中间件 ==========
app.use(helmet()); // 安全头设置

// ========== 中间件 ==========
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
); // 跨域配置
app.use(express.json({ limit: "10kb" })); // 解析 JSON，限制大小
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // 解析表单
app.use(express.static("public")); // 静态文件服务

// ========== 路由挂载 ==========
app.get("/", (req, res) => {
  res.json({ message: "🎉 服务启动成功", time: new Date().toLocaleString() });
});

// 认证路由（无需登录）
app.use("/api/auth", authRoutes);

// 用户路由（需要登录）
app.use("/api/users", auth, userRoutes);

// ========== 404 处理 ==========
app.use((req, res) => {
  res.status(404).json({ code: 404, message: "接口不存在" });
});

// ========== 全局错误处理 ==========
app.use(errorHandler);

// ========== 启动 ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务已启动: http://localhost:${PORT}`);
});
