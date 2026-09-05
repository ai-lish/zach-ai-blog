---
title: "ComfyUI Desktop 實戰：RTX 5080 由 CUDA 錯誤到成功生成 SDXL"
pubDate: 2026-09-05
description: "以 Windows 11、RTX 5080 16GB 與 Animagine XL 為例，示範本地模型路徑、第一個 SDXL workflow，以及 CUDA unknown error 的實際排查方法。"
---

# ComfyUI Desktop 實戰：RTX 5080 由 CUDA 錯誤到成功生成 SDXL

這篇文章記錄一次完整的 ComfyUI Desktop 新手實戰：由安裝後設定模型資料夾、建立第一個 SDXL workflow，到遇到 `CUDA error: unknown error`，最後在 RTX 5080 上成功生成第一張動漫風圖片。

整個生成流程使用本機 GPU。測試沒有使用私人相片，也沒有把圖片送到雲端 AI 服務。

## 先分清四個名詞

初學者最容易把以下四者當成同一件事：

| 名稱 | 作用 |
| --- | --- |
| Stable Diffusion | 由文字或圖片生成影像的模型技術與生態系統 |
| Animagine XL | 一個以動漫風格為主的 SDXL checkpoint |
| ComfyUI | 以 node graph 組合模型、提示詞及取樣流程的生成引擎 |
| ComfyUI Desktop | 管理及啟動本地 ComfyUI instance 的桌面程式 |

因此，Desktop 不是另一個生成模型；它只是負責啟動 ComfyUI。真正生成圖片的是 `Animagine XL` checkpoint 加上 ComfyUI 的 workflow。

## 測試環境與資料夾

本次測試硬體及版本如下：

- Windows 11
- AMD Ryzen 7 7800X3D
- RTX 5080 16GB VRAM，compute capability `(12, 0)`
- Desktop Python 3.13.12
- Desktop Torch `2.12.1+cu130`
- ComfyUI `0.34.5`
- checkpoint：`animagine-xl-4.0-opt.safetensors`

我的 Agent 版和 Desktop 版保留獨立的 runtime：

```text
C:\AI\ComfyUI                         Agent 版程式及 .venv
C:\AI\ComfyUI-Desktop\ComfyUI        Desktop 版程式及獨立環境
```

兩者可以共用模型及輸出資料夾，但不應共用 Python、Torch 或 custom node 安裝環境。這樣 Agent 可以繼續使用 Git + `venv`，Desktop 則由桌面程式管理。

本次共用資料夾設定為：

```text
模型：C:\AI\ComfyUI\models
輸出：C:\AI\ComfyUI\output
```

模型檔案必須放在正確的子資料夾：

```text
C:\AI\ComfyUI\models\checkpoints\animagine-xl-4.0-opt.safetensors
```

## 在 Desktop 設定模型與輸出位置

在 ComfyUI Desktop 中：

1. 按左上角 `≡`。
2. 開啟「桌面端設定」。
3. 進入「存儲」。
4. 在「共享模型」加入 `C:\AI\ComfyUI\models`。
5. 在「共享輸出」設定 `C:\AI\ComfyUI\output`。
6. 重新啟動 ComfyUI instance。

「共享模型」會讓 Desktop 找到 Agent 版已下載的 checkpoint；「共享輸出」則讓兩個版本的結果集中在同一個位置。這不代表兩個版本共用 venv。

如果只想確認模型檔案是否真的存在，可以在 PowerShell 執行：

```powershell
Test-Path 'C:\AI\ComfyUI\models\checkpoints\animagine-xl-4.0-opt.safetensors'
```

結果應為 `True`。

## 建立第一個 SDXL workflow

最小的 text-to-image workflow 只需要以下 nodes：

```text
Load Checkpoint
CLIP Text Encode (Prompt)        正面提示詞
CLIP Text Encode (Prompt)        負面提示詞
Empty Latent Image
KSampler
VAE Decode
Save Image
```

連線方式如下：

```text
Load Checkpoint MODEL  -> KSampler model
Load Checkpoint CLIP   -> 兩個 CLIP Text Encode 的 CLIP
正面 conditioning       -> KSampler positive
負面 conditioning       -> KSampler negative
Empty Latent Image     -> KSampler latent_image
KSampler samples       -> VAE Decode samples
Load Checkpoint VAE    -> VAE Decode vae
VAE Decode image       -> Save Image images
```

### 建議的第一次參數

在 `Empty Latent Image` 設定：

```text
width: 1024
height: 1024
batch_size: 1
```

在 `KSampler` 設定：

```text
steps: 28
cfg: 6.0
sampler_name: euler_ancestral
scheduler: karras
denoise: 1.0
seed: 42
```

正面提示詞可以先使用：

```text
masterpiece, best quality, anime illustration, 1girl, solo,
clearly adult 18-year-old fictional university student,
ordinary campus portrait, dark shoulder-length hair,
natural expression, school blazer, soft daylight,
clean lineart, detailed eyes
```

負面提示詞：

```text
lowres, worst quality, low quality, bad anatomy, bad hands,
extra fingers, extra limbs, blurry, watermark, text
```

`Save Image` 的 `filename_prefix` 可設定為：

```text
desktop_animagine_test
```

如果兩個 ComfyUI 版本共用 output，建議使用不同 prefix，例如 `desktop_` 和 `agent_`，避免檔名難以辨認。

## 第一次執行遇到 CUDA unknown error

第一次按「執行」時，workflow 的 `CheckpointLoaderSimple` 變成紅色，錯誤面板顯示：

```text
torch.AcceleratorError: CUDA error: unknown error
```

這時不要立即重新下載 checkpoint，也不要先改節點連線。先看 Desktop log：

```text
C:\AI\ComfyUI-Desktop\ComfyUI\logs\comfyui.log
```

本次 log 已經顯示：

```text
model weight dtype torch.float16
VAE load device: cuda:0
CLIP/text encoder model load device: cuda:0
```

之後錯誤才發生在：

```text
torch.cuda.synchronize()
```

這代表 checkpoint 已經被找到，問題較接近 CUDA context、allocator 或 offload 組合，而不是模型路徑錯誤。

## 先分辨 Torch 是否本身正常

使用 Desktop 自己的 Python 環境，做一個不載入模型的 CUDA smoke test：

```powershell
$py = 'C:\AI\ComfyUI-Desktop\ComfyUI\ComfyUI\.venv\Scripts\python.exe'
& $py -c "import torch; print('torch=',torch.__version__); print('cuda=',torch.version.cuda); print('available=',torch.cuda.is_available()); print('device=',torch.cuda.get_device_name(0)); print('capability=',torch.cuda.get_device_capability(0)); x=torch.randn((1024,1024),device='cuda'); torch.cuda.synchronize(); print('tensor_sync=PASS')"
```

本次輸出確認：

```text
torch= 2.12.1+cu130
cuda= 13.0
available= True
device= NVIDIA GeForce RTX 5080
capability= (12, 0)
tensor_sync=PASS
```

因此，Torch 可以識別 RTX 5080，基本 CUDA 運算也正常。問題集中在 ComfyUI Desktop 的預設記憶體管理組合。

## 修正 Desktop 的啟動參數

Desktop 預設可能啟用 `cudaMallocAsync`、dynamic VRAM 及 async offload。對這次環境，改用較保守的 ComfyUI 啟動參數：

```text
--enable-manager --disable-cuda-malloc --disable-dynamic-vram --disable-async-offload
```

在 Desktop instance 的設定中找到 `Startup Args` 或「啟動參數」，保留原有的 `--enable-manager`，加入其餘三個參數。儲存後完全重新啟動 Desktop instance。

除非 log 顯示另一個明確問題，否則不要因為這次錯誤立即更換 Torch build，也不要為了消除 cu130 warning 而跳到另一個 nightly 版本。先固定已能通過 smoke test 的版本。

如果 Agent 版、Portable 版及 Desktop 版同時運行，排錯時最好暫停另外兩個版本，只保留正在測試的 instance。多個版本同時使用同一張 GPU，會令 VRAM 和 CUDA context 判斷變得不清楚。

## 修正後的驗收標準

重啟後，log 應該接近：

```text
Device: cuda:0 NVIDIA GeForce RTX 5080 : native
Using pytorch attention
Dynamic vram disabled with argument
```

不應再出現：

```text
cudaMallocAsync
Using async weight offloading with 2 streams
```

重新執行相同 workflow。這次實測成功輸出（當時 Desktop 尚未改 output 位置）：

```text
檔案：C:\Users\User\AppData\Local\Comfy-Desktop\ComfyUI-Shared\output\desktop_animagine_test_00001_.png
尺寸：1024 x 1024
生成時間：17.79 秒
```

![Animagine XL SDXL 本地生成結果](/images/comfyui-desktop-sdxl-baseline.png)

如果你已按上一節把「共享輸出」改成 `C:\AI\ComfyUI\output`，必須重新啟動 Desktop instance；之後的新圖片才會寫入：

```text
C:\AI\ComfyUI\output
```

驗收時至少確認三件事：

1. `Save Image` 真的產生檔案，而不只是畫面預覽。
2. 圖片不是黑圖，尺寸是預期的 `1024 x 1024`。
3. log 沒有新的 CUDA exception，並且記錄 `Prompt executed`。

## 本地生成與私隱

上述 workflow 只使用本地的 `Load Checkpoint`、`KSampler`、`VAE Decode` 及 `Save Image`。下載 checkpoint 或 Python dependencies 時需要網絡，但按下生成後，圖片可以完全在本機處理。

如果要保持離線及私隱：

- 不要把私人相片拖入雲端 workflow。
- 不要使用 Comfy Cloud 或 API Nodes 作為這個本地測試的必要步驟。
- 模型與 custom node 下載完成後，可以在 Windows Firewall 或離線環境下測試基本 txt2img。
- 公開生成結果前，先查看所用 checkpoint 的 license 及使用限制。

## 這次驗證了甚麼，尚未驗證甚麼？

這次已驗證：

- ComfyUI Desktop 能讀取共用模型資料夾。
- Animagine XL SDXL checkpoint 能在 RTX 5080 16GB 上生成。
- `1024 x 1024`、batch 1 的基本 workflow 可運行。
- Desktop 的保守啟動參數可以避開本次 allocator/offload 錯誤。

這次尚未驗證：

- IP-Adapter FaceID
- InsightFace 與 `CUDAExecutionProvider`
- Impact Pack 的 FaceDetailer
- LoRA training
- Character sheet、Live2D layer separation 及 video pipeline

因此，baseline 成功只代表 Stable Diffusion/ComfyUI 的本地生圖基礎已經成立；下一階段才應安裝及測試身份控制 nodes，並繼續使用合成參考圖作為安全測試資料。
