# 构建前端
FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Python 后端
FROM python:3.11-slim

WORKDIR /app/backend

# 安装依赖
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制后端代码
COPY backend/app ./app

# 复制前端构建结果
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# 创建数据目录
RUN mkdir -p /app/backend/data

# 暴露端口
EXPOSE 964

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "964"]
