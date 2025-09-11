# Electron-Swappy 开发计划 (v2 - 基于 grim/slurp)

## 项目目标

创建一个现代、流畅的截图后快速编辑和标注工具。核心是提供强大的编辑功能，而不是截图本身。

## 技术选型

- **应用框架:** Electron
- **UI 库:** React
- **核心截图工具 (外部依赖):**
  - `slurp`: 用于在屏幕上选择一个区域。
  - `grim`: 用于截取由 `slurp` 选择的区域。
- **开发/构建:** Vite

**重要:** 本方案依赖用户系统预先安装 `grim` 和 `slurp`，主要面向使用 Wayland 的 Linux 用户。

## 核心工作流程

应用的核心不再是自己实现截图，而是编排 `grim` 和 `slurp`，然后加载结果进行编辑。

1.  **触发截图 (Renderer -> Main):**
    - 用户在 UI 界面（Renderer 进程）点击“截图”按钮。
    - 通过 Electron 的 IPC (`ipcRenderer.invoke`) 向 Main 进程发送一个 `take-screenshot` 事件。

2.  **执行截图 (Main 进程):**
    - Main 进程监听 `take-screenshot` 事件。
    - 使用 Node.js 的 `child_process.exec` 执行 shell 命令: `grim -g "$(slurp)" /path/to/temp/screenshot.png`。
    - 截图被保存在一个临时的、唯一命名的文件中（例如，在 `os.tmpdir()` 中）。
    - **错误处理:** 捕获命令执行失败的情况（如 `grim`/`slurp` 未安装，或用户按 `Esc` 取消）。

3.  **加载截图 (Main -> Renderer):**
    - 截图成功后，Main 进程将临时文件的路径返回给 Renderer 进程。
    - Renderer 进程收到文件路径后，出于安全策略，它不能直接加载。
    - Renderer 进程通过另一次 IPC (`ipcRenderer.invoke`) 请求 Main 进程读取该文件。
    - Main 进程使用 `fs.readFile` 读取图片文件，将其转换为 Base64 格式的 Data URL 字符串。
    - Main 进程将此 Base64 字符串返回给 Renderer 进程。

4.  **显示与编辑 (Renderer 进程):**
    - Renderer 进程接收到 Base64 字符串。
    - 使用 React state 更新 UI，将一个 `<img>` 标签的 `src` 设置为该 Base64 字符串，从而在界面上显示出截图。
    - 用户现在可以开始使用各种工具在 `<canvas>` 上对图像进行标注和编辑。

## 功能实现列表

- **标注工具集:**
  - [ ] 画笔
  - [ ] 文本
  - [ ] 箭头
  - [ ] 矩形
  - [ ] 椭圆
- **效果工具:**
  - [ ] 模糊/马赛克
- **编辑历史:**
  - [ ] 撤销 (Undo)
  - [ ] 重做 (Redo)
- **其他:**
  - [ ] 复制到剪贴板
  - [ ] 保存到文件