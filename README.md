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
│   │   ├── app.js         # 主应用文件
│   │   ├── config/        # 配置文件
│   │   │   └── db.js       # 数据库配置
│   │   └── modules/        # 模块
│   │       ├── auth/        # 认证模块
│   │       ├── orders/      # 订单模块
│   │       └── recommendations/ # 推荐模块
│   ├── package.json   # 依赖配置
│   └── Dockerfile     # Docker构建文件
├── frontend/          # 前端代码
│   ├── src/           # 源代码
│   │   ├── components/      # 组件
│   │   ├── context/         # 上下文
│   │   ├── pages/           # 页面
│   │   ├── main.jsx         # 入口文件
│   │   └── index.css         # 样式文件
│   ├── index.html     # HTML模板
│   ├── package.json   # 依赖配置
│   └── Dockerfile     # Docker构建文件
├── .gitignore         # Git忽略文件
├── Dockerfile         # 项目根目录Dockerfile
├── docker-compose.yml # Docker Compose配置
├── README.md          # 项目说明
└── LICENSE            # 许可证
```

## 数据库表结构

### users表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 用户ID |
| username | TEXT | UNIQUE NOT NULL | 用户名 |
| password | TEXT | NOT NULL | 密码 |
| role | TEXT | DEFAULT 'user' | 角色 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### menu_items表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 菜品ID |
| name | TEXT | NOT NULL | 菜品名称 |
| category | TEXT | NOT NULL | 菜品分类 |
| price | REAL | NOT NULL | 菜品价格 |
| desc | TEXT | | 菜品描述 |
| image | TEXT | | 菜品图片 |
| tags | TEXT | | 菜品标签 |
| sales | INTEGER | DEFAULT 0 | 销量 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### orders表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 订单ID |
| order_no | VARCHAR(32) | UNIQUE NOT NULL | 订单号 |
| user_id | INTEGER | REFERENCES users(id) | 用户ID |
| total_price | REAL | NOT NULL | 总价格 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'pending' | 订单状态 |
| restaurant | TEXT | DEFAULT 'Maison Lumière' | 餐厅名称 |
| rating | INTEGER | DEFAULT 0 | 评分 |
| review | TEXT | DEFAULT '' | 评价 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 创建时间 |

### order_items表
| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | INTEGER | PRIMARY KEY AUTOINCREMENT | 订单项ID |
| order_id | INTEGER | REFERENCES orders(id) ON DELETE CASCADE | 订单ID |
| menu_item_id | INTEGER | | 菜品ID |
| name | VARCHAR(100) | NOT NULL | 菜品名称 |
| price | REAL | NOT NULL | 菜品价格 |
| quantity | INTEGER | NOT NULL | 数量 |

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
