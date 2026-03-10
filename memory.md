# 项目记忆：2026-growth

更新时间：2026-03-10

## 1. 项目定位

- 这是一个**纯前端单页应用（SPA）**，主题是“2026 我的成长之旅”。
- 目标是把个人成长拆成 5 个长期模块：**财务、变美、学习、副业、提醒**，并在首页做汇总。
- 技术栈非常轻：**Vue 3 + Vue Router 4 + Chart.js + sql.js + Firebase Realtime Database**，全部通过 CDN 注入，没有构建工具、没有 npm、没有打包流程。
- 页面语言为中文，整体是**移动端优先**设计，容器最大宽度 480px。

## 2. 运行方式

- 入口文件：`index.html`
- 本地可直接打开，但以下功能更适合在 HTTP 环境下使用：
  - SQL 练习（`sql.js` / wasm 资源加载）
  - 浏览器通知
- 本地启动建议：
  - `python3 -m http.server 8080`
  - 打开 `http://localhost:8080`
- 适合静态部署：
  - GitHub Pages
  - Vercel

## 3. 架构总览

### 3.1 页面与路由

- 路由定义在 `js/app.js`
- 使用 **Hash Router**，路由如下：
  - `/` 首页 Dashboard
  - `/finance` 财务
  - `/beauty` 变美
  - `/learning` 学习
  - `/business` 副业
  - `/reminders` 提醒
  - `/settings` 设置
- 底部导航常驻，只直接暴露：首页 / 财务 / 变美 / 学习 / 副业
- 提醒页与设置页主要通过页面内按钮进入

### 3.2 脚本组织

- `index.html`
  - 先加载 CDN 依赖
  - 再加载 `tutorials/*.js`
  - 再加载 `js/store.js`、`js/sync.js` 和各业务模块
  - 最后加载 `js/app.js`
- 这是一个**全局脚本风格**项目，不是 ESM：
  - 模块之间通过全局常量协作
  - 例如 `FinanceComponent`、`BeautyComponent`、`CloudSync`、`SQL_TUTORIAL`
- 修改时要注意**脚本加载顺序不能随便变**

### 3.3 UI 组织方式

- 所有页面组件都使用 Vue Composition API 的全局版本
- 模板写在 JS 文件里的 `template: \`...\`` 字符串内
- 大部分页面都采用：
  - `ref` 保存表单与弹窗状态
  - `computed` 做汇总计算
  - `onMounted` 拉取本地数据
  - `watch + nextTick` 重绘 Chart.js 图表

## 4. 关键文件地图

- `index.html`
  - 应用入口、CDN 依赖、脚本加载顺序、部署注释
- `css/style.css`
  - 单文件样式表，包含全局变量、页面布局、模块样式
- `js/store.js`
  - 本地存储统一入口，封装 `get/getObj/set/add/update/remove/exportAll/importAll`
- `js/sync.js`
  - Firebase Realtime Database 云同步逻辑
- `js/app.js`
  - Dashboard、Settings、Router、App 壳层
- `js/finance.js`
  - 财务模块：记账 + 资产管理
- `js/beauty.js`
  - 变美模块：体重 / 运动 / 护肤 / 计划
- `js/learning.js`
  - 学习中心：教程模式 + 打卡模式 + SQL 沙箱
- `js/business.js`
  - 副业模块：内容记录 / 内容日历 / 收入 / 粉丝 / 热榜
- `js/reminder.js`
  - 提醒系统、通知权限、定时触发逻辑
- `tutorials/`
  - 课程内容数据源，直接挂到全局常量

## 5. 数据持久化模型

### 5.1 存储方式

- 所有业务数据默认存放在 `localStorage`
- 统一通过 `GrowthStore` 操作
- `GrowthStore.add()` 会自动补：
  - `id`
  - `createdAt`
- `GrowthStore.update()` 会自动补：
  - `updatedAt`
- `GrowthStore.set()` 在云同步开启时会自动触发防抖上传

### 5.2 Storage Keys

- 数组型：
  - `growth_transactions`
  - `growth_assets`
  - `growth_asset_snapshots`
  - `growth_weight`
  - `growth_exercise`
  - `growth_skincare`
  - `growth_beauty_plans`
  - `growth_content`
  - `growth_content_plans`
  - `growth_followers`
  - `growth_business_income`
  - `growth_reminders`
- 对象型：
  - `growth_learning_progress`
  - `growth_settings`

### 5.3 主要数据结构

- `growth_transactions`
  - `{ type, amount, category, categoryIcon, date, notes, id, createdAt }`
- `growth_assets`
  - `{ name, type, typeLabel, typeIcon, balance, id, createdAt }`
- `growth_asset_snapshots`
  - `{ assetId, balance, date, id, createdAt }`
- `growth_weight`
  - `{ weight, date, id, createdAt }`
- `growth_exercise`
  - `{ type, typeIcon, duration, calories, date, id, createdAt }`
- `growth_skincare`
  - `{ routine, steps, notes, date, id, createdAt }`
- `growth_beauty_plans`
  - `{ name, frequency, period, checkins, id, createdAt }`
- `growth_learning_progress`
  - 结构是对象字典：`{ [skillId]: { completedLessons: [], checkins: [] } }`
  - `checkins` 项结构：`{ date, time, duration, note }`
- `growth_content`
  - `{ title, platform, platformColor, date, status, views, likes, comments, saves, shares, id, createdAt }`
- `growth_content_plans`
  - `{ title, platform, notes, plannedDate, id, createdAt }`
- `growth_business_income`
  - `{ amount, source, platform, date, notes, id, createdAt }`
- `growth_followers`
  - `{ platform, count, date, id, createdAt }`
- `growth_reminders`
  - `{ content, date, time, repeat, module, moduleIcon, moduleColor, completed, lastFired, id, createdAt }`
- `growth_settings`
  - 当前已确认至少包含：`targetWeight`

## 6. 各模块记忆

### 6.1 Dashboard / 首页

- 负责展示：
  - 本月结余
  - 净资产
  - 学习进度
  - 本周内容数
  - 体重趋势
  - 本月副业收入
  - 今日提醒
- 有浮动快捷入口，可跳到各模块与设置页
- 首页数字带动画效果

### 6.2 Finance / 财务

- 两个子页签：
  - `tracking`：流水记录
  - `assets`：资产管理
- 记账支持：
  - 收入 / 支出
  - 分类图标
  - 月度汇总
  - 收支图、支出分布图、年度结余趋势图
- 资产支持：
  - 账户新增 / 编辑 / 删除
  - 快速更新余额
  - 通过 `growth_asset_snapshots` 记录历史快照
  - 净资产趋势图按快照推导

### 6.3 Beauty / 变美

- 三个子页签：
  - `weight`
  - `exercise`
  - `skincare`
- 体重：
  - 支持目标体重（存在 `growth_settings.targetWeight`）
  - 显示趋势、进度、距离目标差值
- 运动：
  - 保存运动类型、时长、消耗
- 护肤：
  - 记录早/晚流程与步骤
  - 计算连续护肤天数
- Beauty Plans：
  - 可定义周期目标并按天打卡

### 6.4 Learning / 学习

- 三层视图切换：
  - `list` 技能列表
  - `detail` 技能详情
  - `lesson` 课程内容
- 支持两类技能：
  - `tutorial` 教程型：按章节 / 课时学习
  - `checkin` 打卡型：记录时长与备注
- 当前教程来源：
  - `SQL_TUTORIAL`
  - `TAROT_TUTORIAL`
  - `EDITING_TUTORIAL`（打卡型）
- SQL 教程支持：
  - 读取课时中的 `exercise.setupSQL`
  - 使用 `sql.js` 在浏览器内建临时数据库
  - 支持执行多条 SQL
  - 可显示提示与答案

### 6.5 Business / 副业

- 五个子页签：
  - `content`
  - `calendar`
  - `income`
  - `followers`
  - `trending`
- 内容记录：
  - 平台、状态、播放、点赞、评论、收藏、转发
- 内容日历：
  - 同时显示已发布内容和待发布计划
- 收入：
  - 记录金额、来源、平台、日期、备注
  - 保存副业收入时，会**自动同步写入 `growth_transactions`**
- 粉丝：
  - 按平台记录粉丝数并绘图
- 热榜：
  - 更像“外链导航 / 灵感入口”，不是持久化功能核心

### 6.6 Reminders / 提醒

- 提醒支持：
  - 指定日期
  - 可选时间
  - 重复规则：不重复 / 每天 / 每周 / 每月
  - 关联模块颜色与图标
- 列表按：
  - 今天
  - 明天
  - 本周
  - 以后
 进行分组
- 全局有通知辅助函数与轮询：
  - 周期性检查是否到达提醒时间
  - 满足条件时触发浏览器通知
  - 用 `lastFired` 防重复提醒

### 6.7 Settings / 设置

- 功能包含：
  - 本地数据导入 / 导出
  - 云端同步连接 / 上传 / 下载 / 断开
  - 通知权限状态展示与申请
  - 清空数据
- 导入 / 云端下载属于**覆盖型操作**

## 7. 云同步记忆

- 云同步实现位于 `js/sync.js`
- 使用 Firebase Realtime Database
- 用户输入同步密钥后：
  - 本地保存 `growth_sync_key`
  - 通过简单 hash 转成数据库路径
- 同步特点：
  - 默认本地优先写入
  - 有防抖上传
  - 能监听云端更新并回写本地
- 注意：
  - Firebase 配置当前直接写在前端源码里
  - 这意味着它不是“服务器私密配置”模式

## 8. 代码约定与修改注意

- 不要引入构建工具式写法（如 `import/export`），除非准备整体改造
- 新模块若要接入，优先遵循现有模式：
  - 新建 `js/xxx.js`
  - 暴露全局组件常量
  - 在 `index.html` 中按顺序注入
  - 在 `js/app.js` 中注册路由
- 如果要新增存储结构：
  - 先在 `GrowthStore.KEYS` 中登记
  - 再决定是数组型还是对象型
- 图表更新时保持现有习惯：
  - 先 `destroy()` 旧实例
  - 再创建新实例

## 9. 已发现的注意点

- `Dashboard` 的净资产卡片目前按 `a.amount` 求和，但资产模块实际保存字段是 `balance`
- `Dashboard` 的学习进度卡片目前把 `growth_learning_progress` 当数组读；实际它是对象字典
- 副业收入删除时，只删 `growth_business_income`，不会反向删除自动生成的财务收入流水
- 项目当前没有测试、lint、formatter、构建链路；修改后主要依赖手动验证

## 10. 后续协作建议

- 后续如果继续维护，优先把“**数据 schema 明确化**”作为第一原则
- 如果要增强可维护性，推荐的演进顺序：
  1. 统一 Dashboard 与真实 schema
  2. 把各模块的数据结构写成单独文档
  3. 把全局脚本逐步迁移为模块化结构
  4. 再考虑引入打包、测试、PWA 等能力

