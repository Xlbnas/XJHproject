# Smart Order System

智能点餐系统，包含前端和后端，支持实时推荐、AI模型集成、产品图片展示等功能。

## 功能特性

- **实时推荐**：输入菜品描述时，系统会实时推荐相关菜品
- **AI模型集成**：使用本地AI算法处理自然语言描述
- **产品图片展示**：推荐结果中显示产品图片
- **数据库存储**：使用SQLite存储菜单数据和用户数据
- **Docker支持**：提供Dockerfile和docker-compose.yml文件，方便部署

## 技术栈

- **前端**：React + Vite + React Router
- **后端**：Python + FastAPI + SQLAlchemy
- **AI**：本地关键词匹配算法
- **数据库**：SQLite
- **容器化**：Docker

## 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/Xlbnas/XJHproject.git
cd XJHproject
```

### 2. 使用Docker运行（推荐）

```bash
docker-compose up
```

- 前端将在 http://localhost:198 运行
- 后端将在 http://localhost:964 运行

### 3. 本地开发

#### 前端

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:198 运行。

#### 后端

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 964
```

后端将在 http://localhost:964 运行。

## 项目结构

```
smart-order-system/
├── backend/           # 后端代码 (Python FastAPI)
│   ├── app/           # 应用代码
│   │   ├── __init__.py      # 包初始化
│   │   ├── main.py          # 主应用文件
│   │   ├── database.py      # 数据库模型和连接
│   │   ├── schemas.py       # Pydantic数据模型
│   │   └── auth.py          # 认证相关
│   ├── data/          # 数据目录 (SQLite数据库)
│   ├── requirements.txt   # Python依赖
│   └── Dockerfile     # Docker构建文件
├── frontend/          # 前端代码 (React)
│   ├── src/           # 源代码
│   │   ├── components/      # 组件
│   │   ├── context/         # 上下文
│   │   ├── pages/           # 页面
│   │   ├── main.jsx         # 入口文件
│   │   └── index.css        # 样式文件
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
| phone | TEXT | UNIQUE NOT NULL | 手机号 |
| password_hash | TEXT | NOT NULL | 密码哈希 |
| nickname | TEXT | | 昵称 |
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
| tags | TEXT | | 菜品标签（逗号分隔） |
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

## API接口说明

### 认证API

#### 注册
- **端点**：`POST /api/auth/register`
- **参数**：`phone`, `password`, `nickname` (可选)
- **返回**：token 和 user 信息

#### 登录
- **端点**：`POST /api/auth/login`
- **参数**：`phone`, `password`
- **返回**：token 和 user 信息

#### 获取当前用户
- **端点**：`GET /api/auth/me`
- **Header**：`Authorization: Bearer <token>`
- **返回**：当前用户信息

### 菜单API

#### 获取所有菜品
- **端点**：`GET /api/menu`
- **返回**：菜品列表

#### 添加菜品
- **端点**：`POST /api/menu`
- **参数**：`name`, `price`, `category`, `desc`, `image`, `tags`
- **返回**：新创建的菜品

#### 更新菜品
- **端点**：`PUT /api/menu/{id}`
- **参数**：`name`, `price`, `category`, `desc`, `image`, `tags`
- **返回**：更新后的菜品

#### 删除菜品
- **端点**：`DELETE /api/menu/{id}`
- **返回**：删除成功消息

### 订单API

#### 创建订单
- **端点**：`POST /api/orders`
- **参数**：`items` (数组)
- **Header**：`Authorization: Bearer <token>`
- **返回**：订单信息

#### 获取订单列表
- **端点**：`GET /api/orders`
- **参数**：`status` (可选)
- **Header**：`Authorization: Bearer <token>`
- **返回**：订单列表

#### 更新订单状态
- **端点**：`PATCH /api/orders/{order_no}/status`
- **参数**：`status`
- **Header**：`Authorization: Bearer <token>`
- **返回**：更新后的订单状态

#### 订单评价
- **端点**：`POST /api/orders/{order_no}/review`
- **参数**：`rating`, `comment`
- **Header**：`Authorization: Bearer <token>`
- **返回**：评价结果

### 推荐API

#### 获取推荐
- **端点**：`GET /api/recommendations/recommend`
- **参数**：`query` - 搜索关键词
- **返回**：推荐的菜品列表，包含推荐理由

## AI搜索功能详解

### 搜索模式

#### 本地AI搜索
- **描述**：使用本地算法理解自然语言查询并提供相关推荐
- **特点**：
  - 自然语言理解
  - 上下文感知推荐
  - 智能关键词提取
- **工作原理**：
  1. 用户输入查询（例如："spicy chicken dish"）
  2. 系统提取与食物相关的关键关键词
  3. 系统将这些关键词与菜单项目名称、描述和标签进行匹配
  4. 显示相关推荐

### 视觉元素

- **搜索模式切换**：AI搜索和普通搜索模式之间的清晰视觉区分
- **推荐卡片**：显示相关菜单项目，包括价格和推荐理由

## 安全考虑

- 使用bcrypt对密码进行哈希处理
- 使用JWT令牌进行身份验证
- 对所有用户输入实施输入验证
- CORS配置允许跨域访问

## 未来增强

- 集成外部AI模型（如OpenAI、SiliconFlow）
- 具有更多上下文感知的增强AI模型
- 用于个性化推荐的用户偏好学习
- 多语言支持
- 语音搜索功能
- 高级过滤选项

## 故障排除

### 常见问题

1. **后端无法启动**：
   - 检查Python版本（需要3.11+）
   - 确保所有依赖已安装：`pip install -r requirements.txt`
   - 检查端口964是否被占用

2. **图片不加载**：
   - 应用使用来自Unsplash的占位图片
   - 确保互联网连接
   - 检查浏览器控制台是否有CORS错误

3. **登录失败**：
   - 检查数据库文件是否正确创建
   - 确认管理员账户已初始化
   - 检查后端日志获取详细错误信息

## 许可证

MIT License
