# 本地截图分析后端

这一层专门处理美团、抖音、小红书、淘宝推荐页截图。

**不调用 Qwen、GPT、Gemini 等商业多模态 API。**

当前流水线：

```text
截图
↓
PaddleOCR：标题 / 价格 / 优惠文字
↓
固定页面切片：推荐卡区域
↓
OpenCLIP：图片内容零样本分类
↓
标准 JSON
↓
微信小程序本地规则：生成“平台眼中的你”
```

## 1. 建议环境

Python 3.10 或 3.11。

CPU 可以运行，但 OpenCLIP 第一次分析会比较慢；有 NVIDIA GPU 会明显更快。

## 2. 安装

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

PaddlePaddle 在不同系统 / CUDA 版本上安装包可能不同。如果 `paddlepaddle` 安装失败，请根据你的 CPU / CUDA 环境安装官方对应 wheel，再执行剩余依赖安装。

## 3. 启动

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

检查：

```text
GET http://127.0.0.1:8000/health
```

## 4. 分析截图

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -F "platform=xiaohongshu" \
  -F "file=@sample.png"
```

支持：

- `meituan`
- `douyin`
- `xiaohongshu`
- `taobao`

接口一次分析一张图。微信小程序会逐张上传，再在本地合并多张截图结果。

## 5. 模型缓存

第一次调用时：

- PaddleOCR 会下载中文 OCR 模型
- OpenCLIP 会下载 `ViT-B-32 / laion2b_s34b_b79k`

之后会使用本机缓存，不需要每次重新下载。

## 6. 当前 MVP 的页面切片策略

为了避免再引入一个很重的 GUI 解析模型，目前使用透明、固定的页面切片规则：

- 美团：去掉顶部区域后按纵向推荐列表切 4 块
- 小红书：去掉顶部后按 2 列 × 3 行切片
- 淘宝：去掉顶部后按 2 列 × 3 行切片
- 抖音：一张截图视为一个推荐样本

后续可以把 `services/layout.py` 替换成 OmniParser / YOLO，而无需修改小程序接口。

## 7. 隐私

服务端当前不写入上传图片到磁盘，图片只在当前请求内存中完成分析。

比赛版仍应在小程序上传页提示用户：

- 不上传订单详情
- 不上传收货地址
- 不上传聊天页面
- 尽量裁掉头像、昵称、定位等无关信息
