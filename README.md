# Node Server 技术文档

## 一、项目概述

本项目是一个基于 Node.js + Express 的后端服务，提供用户认证（登录/注册/密码重置）和用户管理功能，采用 JWT 进行身份认证。

---

## 二、技术栈

### 2.1 核心技术

| 技术        | 版本    | 用途                   |
| ----------- | ------- | ---------------------- |
| **Node.js** | -       | 服务端运行时           |
| **Express** | ^4.18.2 | Web 框架               |
| **MySQL**   | ^3.6.5  | 关系型数据库（mysql2） |
| **JWT**     | ^9.0.3  | 身份认证               |

### 2.2 中间件

| 中间件     | 版本    | 功能                          |
| ---------- | ------- | ----------------------------- |
| **helmet** | ^8.2.0  | 安全头设置，防止常见 Web 攻击 |
| **cors**   | ^2.8.5  | 跨域资源共享                  |
| **dotenv** | ^16.3.1 | 环境变量管理                  |

### 2.3 开发工具

| 工具        | 版本   | 用途           |
| ----------- | ------ | -------------- |
| **nodemon** | ^3.0.2 | 开发环境热重载 |

---

## 三、项目结构

```
node_server/
├── app.js                 # 应用入口
├── .env                   # 环境变量配置
├── package.json           # 项目配置
├── config/
│   └── db.js              # 数据库连接配置
├── controllers/
│   ├── authController.js  # 认证相关逻辑
│   └── userController.js  # 用户管理逻辑
├── middlewares/
│   ├── auth.js            # JWT 认证中间件
│   └── errorHandler.js    # 全局错误处理
├── routes/
│   ├── auth.js            # 认证路由
│   └── user.js            # 用户路由
└── utils/
    └── response.js        # 统一响应格式
```

## 四、核心功能

### 4.1 认证模块

| 功能       | 接口                      | 方法 | 是否需要登录 |
| ---------- | ------------------------- | ---- | ------------ |
| 用户注册   | `/api/auth/register`      | POST | 否           |
| 用户登录   | `/api/auth/login`         | POST | 否           |
| 发送验证码 | `/api/auth/sendCode`      | POST | 否           |
| 重置密码   | `/api/auth/resetPassword` | POST | 否           |
| 验证 Token | `/api/auth/verify`        | GET  | 是           |

### 4.2 用户模块

| 功能         | 接口             | 方法   | 是否需要登录 |
| ------------ | ---------------- | ------ | ------------ |
| 获取用户列表 | `/api/users`     | GET    | 是           |
| 获取单个用户 | `/api/users/:id` | GET    | 是           |
| 更新用户信息 | `/api/users/:id` | PUT    | 是           |
| 删除用户     | `/api/users/:id` | DELETE | 是           |

---

## 五、开发流程

### 5.1 环境要求

- Node.js >= 16.x
- MySQL >= 5.7

### 5.2 安装依赖

```bash
# 安装项目依赖
npm install

# 开发模式（热重载）
npm run dev

# 生产模式
npm start
```

### 5.3 配置环境变量

在 `.env` 文件中配置以下参数：

```env
# 服务器配置
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=my_database

# JWT 密钥
JWT_SECRET=your_secret_key

# CORS 配置
CORS_ORIGIN=http://localhost:3000

# 环境
NODE_ENV=development
```

### 5.4 数据库初始化

创建数据库并执行以下 SQL 脚本：

```sql
CREATE DATABASE IF NOT EXISTS my_database;

USE my_database;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 六、API 接口规范

### 6.1 成功响应

```json
{
  "code": 200,
  "message": "操作成功",
  "data": { ... }
}
```

### 6.2 失败响应

```json
{
  "code": 400,
  "message": "错误信息"
}
```

### 6.3 认证方式

使用 JWT Token 认证，在请求头中携带：

```bash
Authorization: Bearer <token>
```

---

## 七、安全注意事项

1. **密码加密**：生产环境应使用 `bcrypt` 对密码进行加密存储
2. **验证码存储**：应使用 Redis 替代内存存储，支持分布式部署
3. **HTTPS**：生产环境应配置 HTTPS
4. **JWT 密钥**：应使用足够长度的随机字符串，避免硬编码
5. **SQL 注入**：项目已使用参数化查询，防止 SQL 注入

---

## 八、启动说明

```bash
# 1. 确保 MySQL 服务已启动
# 2. 创建数据库并配置 .env 文件
# 3. 安装依赖
npm install

# 4. 启动开发服务器
npm run dev

# 5. 访问服务
# 主页: http://localhost:3000
# API 基础路径: http://localhost:3000/api
```
