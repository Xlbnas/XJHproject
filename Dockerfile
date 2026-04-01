# 构建前端
FROM node:20-alpine as frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# 构建后端
FROM node:20-alpine as backend
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .

# 最终镜像
FROM node:20-alpine
WORKDIR /app

# 复制前端构建结果
COPY --from=frontend /app/frontend/dist /app/frontend/dist

# 复制后端代码
COPY --from=backend /app/backend /app/backend

# 安装后端依赖
WORKDIR /app/backend
RUN npm install --only=production

# 暴露端口
EXPOSE 964 198

# 启动命令
CMD ["sh", "-c", "cd /app/backend && npm start"]
