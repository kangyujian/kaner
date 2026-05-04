# 小桃 - 情感对话机器人

一款基于TypeScript开发的情感对话机器人，支持多种人设和情感状态管理。

## 功能特性

- 🎭 **多人设支持**：温柔、可爱、调皮、萝莉、御姐
- 💖 **情感系统**：喜怒哀乐情感状态机
- 🧠 **记忆模块**：短期记忆和长期记忆
- 🔌 **多模型支持**：千问、DeepSeek、Kimi
- 💬 **聊天界面**：简洁美观的聊天界面

## 技术栈

- **后端**：Node.js + Express + TypeScript
- **前端**：React + TypeScript + Vite
- **存储**：文件存储（JSON格式）

## 项目结构

```
kaner/
├── src/
│   ├── backend/           # 后端代码
│   │   ├── ai/           # AI模型模块
│   │   ├── emotion/      # 情感状态机模块
│   │   ├── memory/       # 记忆模块
│   │   ├── session/      # 会话管理模块
│   │   ├── types/        # 类型定义
│   │   └── server.ts     # 服务器入口
│   └── frontend/         # 前端代码
│       ├── src/
│       │   ├── api/      # API调用
│       │   ├── components/# 组件
│       │   ├── types/    # 类型定义
│       │   ├── App.tsx
│       │   ├── main.tsx
│       │   └── index.css
│       ├── index.html
│       ├── package.json
│       ├── vite.config.ts
│       └── tsconfig.json
├── doc/                  # 文档
│   └── prd.md           # 产品需求文档
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
└── README.md
```

## 快速开始

### 安装依赖

```bash
# 安装后端依赖
npm install

# 安装前端依赖
cd src/frontend && npm install
```

### 配置环境变量

复制 `.env.example` 并修改：

```bash
cp .env.example .env
```

编辑 `.env` 文件，填入您的API密钥：

```env
QIANWEN_API_KEY=your_qianwen_api_key
DEEPSEEK_API_KEY=your_deepseek_api_key
KIMI_API_KEY=your_kimi_api_key
PORT=3000
```

### 启动开发服务器

```bash
# 启动后端（终端1）
npm run build
npm start

# 启动前端（终端2）
cd src/frontend && npm run dev
```

### 访问应用

打开浏览器访问：http://localhost:5173

## API接口

| 接口 | 方法 | 描述 |
|------|------|------|
| `/api/health` | GET | 健康检查 |
| `/api/session` | POST | 创建会话 |
| `/api/sessions` | GET | 获取会话列表 |
| `/api/session/:id/messages` | GET | 获取会话消息 |
| `/api/session/:id` | DELETE | 删除会话 |
| `/api/chat` | POST | 发送消息 |
| `/api/emotion` | GET | 获取情感状态 |
| `/api/persona` | POST | 设置人设 |
| `/api/models` | GET | 获取模型列表 |
| `/api/model` | POST | 设置模型 |

## 使用示例

```bash
# 创建会话
curl -X POST http://localhost:3000/api/session

# 发送消息
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "你好", "sessionId": "xxx", "persona": "gentle"}'
```

## 许可证

MIT License
