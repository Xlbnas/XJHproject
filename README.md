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

## AI搜索功能详解

### 搜索模式

#### 1. AI搜索
- **描述**：使用大语言模型（LLM）理解自然语言查询并提供相关推荐
- **特点**：
  - 自然语言理解
  - 上下文感知推荐
  - AI处理过程中的视觉进度指示器
  - 智能关键词提取
- **工作原理**：
  1. 用户输入查询（例如："spicy chicken dish"）
  2. 系统将查询发送到AI模型
  3. AI提取与食物相关的关键关键词
  4. 系统将这些关键词与菜单项目进行匹配
  5. 显示相关推荐

#### 2. 普通搜索
- **描述**：传统的基于关键词的搜索，用于直接匹配
- **特点**：
  - 响应速度快
  - 精确的关键词匹配
  - 简单可靠
- **工作原理**：
  1. 用户输入搜索词
  2. 系统在项目名称、描述和标签中搜索精确匹配
  3. 立即显示匹配的项目

### 视觉元素

- **AI进度条**：动画进度指示器，显示AI处理状态
- **搜索模式切换**：AI搜索和普通搜索模式之间的清晰视觉区分
- **推荐卡片**：显示相关菜单项目，包括价格和推荐理由

### API集成
AI搜索功能使用SiliconFlow API和DeepSeek-V3.2模型进行自然语言处理。

### 性能优化
- **缓存**：搜索结果被缓存以提高响应时间
- **防抖**：搜索请求被防抖以防止过多的API调用
- **错误处理**：如果AI API失败，优雅地回退到普通搜索

## 安全考虑

- API密钥安全存储，不在客户端代码中暴露
- 使用bcryptjs对密码进行哈希处理
- 使用JWT令牌进行身份验证
- 对所有用户输入实施输入验证

## 未来增强

- 具有更多上下文感知的增强AI模型
- 用于个性化推荐的用户偏好学习
- 多语言支持
- 语音搜索功能
- 高级过滤选项

## 故障排除

### 常见问题

1. **AI搜索不工作**：
   - 检查后端服务器是否运行
   - 验证API密钥配置
   - 检查与SiliconFlow API的网络连接

2. **图片不加载**：
   - 应用使用来自Unsplash的占位图片
   - 确保互联网连接
   - 检查浏览器控制台是否有CORS错误

3. **搜索结果不更新**：
   - 尝试清除浏览器缓存
   - 确保搜索模式设置正确
   - 检查控制台是否有错误消息

## 环境变量配置

### 后端环境变量

1. 在 `backend` 目录中创建 `.env` 文件
2. 添加以下内容：

```env
# SiliconFlow API Key
# This file contains sensitive information and should not be committed to version control
# API Key for SiliconFlow AI service
API_KEY=YOUR_API_KEY_HERE
```

### 注意事项

- `.env` 文件已被添加到 `.gitignore` 中，确保不会被提交到版本控制系统
- 请将 `API_KEY` 值替换为您自己的 SiliconFlow API 密钥
- 保持 API 密钥的安全性，不要在代码中硬编码

## 许可证

MIT License
