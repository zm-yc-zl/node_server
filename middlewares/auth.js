const jwt = require("jsonwebtoken");
const util = require("util");
const { fail } = require("../utils/response");

// 异步化 jwt.verify
const jwtVerify = util.promisify(jwt.verify);

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return fail(res, "请先登录", 401);
    }

    // 使用 async/await 替代回调
    const decoded = await jwtVerify(
      token,
      process.env.JWT_SECRET || "secret_key",
    );

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return fail(res, "登录已过期，请重新登录", 401);
  }
};

module.exports = auth;
