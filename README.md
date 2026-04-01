# Smart Order System

智能点餐系统，包含前端和后端，支持实时推荐、AI模型集成、产品图片展示等功能。

## 功能特性

- **实时推荐**：输入菜品描述时，系统会实时推荐相关菜品
- **AI模型集成**：使用SiliconFlow的AI模型处理自然语言描述
- **产品图片展示**：推荐结果中显示产品图片
- **数据库存储**：使用SQLite存储菜单数据和用户数据
- **Docker支持**：提供Dockerfile和docker-compose.yml文件，方便部署

## 技术栈

- **前端**：React + Vite + React Router
- **后端**：Express.js + SQLite
- **AI**：SiliconFlow API
- **容器化**：Docker

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Xlbnas/XJHproject.git
cd XJHproject
```

### 2. 安装依赖

#### 前端依赖

```bash
cd frontend
npm install
```

#### 后端依赖

```bash
cd ../backend
npm install
```

### 3. 运行项目

#### 前端

```bash
cd frontend
npm run dev
```

前端将在 http://localhost:198 运行。

#### 后端

```bash
cd backend
npm run dev
```

后端将在 http://localhost:964 运行。

### 4. 使用Docker运行

```bash
docker-compose up
```

## 项目结构

```
smart-order-system/
├── backend/           # 后端代码
│   ├── src/           # 源代码
│   ├── package.json   # 依赖配置
│   └── Dockerfile     # Docker构建文件
├── frontend/          # 前端代码
│   ├── src/           # 源代码
│   ├── package.json   # 依赖配置
│   └── Dockerfile     # Docker构建文件
├── .gitignore         # Git忽略文件
├── Dockerfile         # 项目根目录Dockerfile
├── docker-compose.yml # Docker Compose配置
├── README.md          # 项目说明
└── LICENSE            # 许可证
```

## 管理员账户

- **用户名**：Xlbnas
- **密码**：Xlbnas

## 接口说明

### 推荐API

- **端点**：`GET /api/recommendations/recommend`
- **参数**：`query` - 搜索关键词或自然语言描述
- **返回**：推荐的菜品列表，包含菜品详情和图片

## 许可证

MIT License
