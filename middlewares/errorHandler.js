function errorHandler(err, req, res, next) {
  console.error("🔥 错误:", err.stack);

  res.status(500).json({
    code: 500,
    message: "服务器内部错误",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
}

module.exports = errorHandler;
