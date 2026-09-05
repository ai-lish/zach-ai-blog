---
title: "MiniMax H3 本機實戰：由 T2V 基礎到 I2V／FL2V Workflow"
pubDate: 2026-09-05
description: "以 RTX 5080 16GB、ComfyUI Desktop 與本機 Qwen3-VL text encoder，逐步建立已驗證的 H3 T2V 及 I2V／FL2V workflow。"
cover: "images/minimax-h3-i2v-errors.png"
---

這篇文章記錄在 Windows 11 上建構 MiniMax H3 本機 video workflow 的實際步驟。目標是先跑通一條可以重現的 Text-to-Video（T2V）管線，再理解 Image-to-Video（I2V）及 First/Last-Frame-to-Video（FL2V）的輸入差異。

測試使用本機 GPU 和本機模型，沒有使用私人相片，也沒有把素材送到雲端 AI 服務。參考圖示範會使用合成圖或其他不含私人資料的圖像。

## 先分清 H3 與 Stable Diffusion

MiniMax H3 不是 SDXL checkpoint，也不是 Stable Diffusion workflow 的另一個 sampler。它是一條獨立的 video/audio diffusion 管線；ComfyUI Desktop 只是負責載入節點、模型和 workflow。

```text
prompt / optional reference frames
        -> Qwen3-VL text encoder
        -> MiniMax H3 diffusion transformer
        -> joint video + audio latent
        -> video VAE + audio VAE
        -> MP4 video with native audio
```

H3 的音訊不是另外呼叫 Ollama、TTS 或 Stable Audio 才產生。prompt 中的 `Audio:` 描述會和畫面一起交給 H3，輸出可包含影像、聲效、音樂或語音。這不代表它可以取代本專案日後的獨立 TTS／STT／音樂工具；本篇只處理 H3 video workflow。

## 測試環境

本次本機驗證的環境：

- Windows 11
- AMD Ryzen 7 7800X3D
- RTX 5080 16GB VRAM，compute capability `(12, 0)`
- 32GB RAM
- ComfyUI Desktop `0.34.5`
- Desktop Python `3.13.12`
- Torch `2.12.1+cu130`
- Attention backend：PyTorch SDPA，沒有安裝 `xformers`

Desktop 版和 Agent／portable 版仍然是兩個獨立 runtime。可以共用模型和 output，但不要共用 Python、Torch 或 custom node environment。

## H3 檔案各自做甚麼

H3 的檔案不是全部放在 `checkpoints`。每一類權重由不同 ComfyUI loader 載入：

| 檔案 | 作用 | 資料夾 |
| --- | --- | --- |
| `qwen3vl_32b_heretic_minimax_h3_nvfp4.safetensors` | 將 prompt 和多模態輸入轉成 conditioning | `models/text_encoders` |
| `minimax_h3_fl2va_pruned_int8_convrot.safetensors` | H3 video/audio diffusion transformer | `models/diffusion_models` |
| `minimax_h3_video_vae_fp16.safetensors` | 將 video latent 解碼成影像 frames | `models/vae` |
| `minimax_h3_audio_vae_fp32.safetensors` | 將 audio latent 解碼成音訊 | `models/vae` |
| `minimax_h3_turbo_v4_step600_ema.safetensors` | Turbo LoRA；減少 sampling steps 的選配檔 | `models/loras` |

本次使用的實際模型根目錄是：

```text
C:\Users\User\Documents\AI agent\ComfyUI_windows_portable\ComfyUI\models
```

`heretic` 是社群修改過的 text encoder 檔名，不是官方保證的「無審查」模式。它不會改變本機資料流向，也不代表所有 prompt 或輸出必然不受限制；只測試合法的成人虛構角色內容，避免使用真人私人相片。

## 設定 Desktop 的共用模型路徑

如果 Desktop 的 model dropdown 看不到上述檔案，先把共用模型根目錄加入 Desktop instance。現時設定檔位於：

```text
C:\AI\ComfyUI-Desktop\ComfyUI\ComfyUI\extra_model_paths.yaml
```

內容如下：

```yaml
h3_local:
  base_path: 'C:\Users\User\Documents\AI agent\ComfyUI_windows_portable\ComfyUI\models'
  is_default: false
  diffusion_models: diffusion_models/
  loras: loras/
  text_encoders: text_encoders/
  vae: vae/
  embeddings: embeddings/
```

重新啟動 Desktop，再檢查以下檔案是否出現在相應 dropdown：

```text
diffusion_models\minimax_h3_fl2va_pruned_int8_convrot.safetensors
text_encoders\qwen3vl_32b_heretic_minimax_h3_nvfp4.safetensors
vae\minimax_h3_video_vae_fp16.safetensors
vae\minimax_h3_audio_vae_fp32.safetensors
loras\minimax_h3_turbo_v4_step600_ema.safetensors
```

下載中的 `.part` 檔案不可當成模型使用。檔案完成後才會改為 `.safetensors`；如果 dropdown 仍顯示舊檔名，先 refresh model list 或重啟 Desktop。

## Workflow A：先建立 H3 T2V

這是第一條應該完成的 workflow。它不需要參考圖，因此最適合先驗證模型、VRAM、sampler、VAE 和 MP4 output 是否完整。

### A-1. 開啟空白或內置 template

在 ComfyUI Desktop 開啟 workflow 選擇器，選：

```text
video_minimax_h3_t2v
```

如果想由空白畫布學習，可手動加入以下 core nodes。內置 template 只是把相同的節點預先排好，兩者不是不同模型。

### A-2. 放置節點

按以下順序建立：

1. `UNETLoader`
2. `CLIPLoader`
3. `VAELoader`（video VAE）
4. `VAELoader`（audio VAE）
5. `MiniMax H3 Image to Video`
6. `RandomNoise`
7. `KSamplerSelect`
8. `BasicScheduler`
9. `BasicGuider`
10. `SamplerCustomAdvanced`
11. `VAEDecode`
12. `VAEDecodeAudio`
13. `CreateVideo`
14. `SaveVideo`

雖然 node 名稱是 `Image to Video`，它的 `first_frame` 和 `last_frame` 是 optional。兩個輸入都留空時，這條就是 T2V。

### A-3. 逐條連線

```text
UNETLoader.MODEL -> BasicGuider.model
UNETLoader.MODEL -> BasicScheduler.model
CLIPLoader.CLIP -> MiniMax H3 Image to Video.clip
video VAELoader.VAE -> MiniMax H3 Image to Video.vae
audio VAELoader.VAE -> VAEDecodeAudio.vae
MiniMax H3 Image to Video.positive -> BasicGuider.conditioning
MiniMax H3 Image to Video.LATENT -> SamplerCustomAdvanced.latent_image
RandomNoise.NOISE -> SamplerCustomAdvanced.noise
KSamplerSelect.SAMPLER -> SamplerCustomAdvanced.sampler
BasicScheduler.SIGMAS -> SamplerCustomAdvanced.sigmas
BasicGuider.GUIDER -> SamplerCustomAdvanced.guider
SamplerCustomAdvanced.output -> VAEDecode.samples
SamplerCustomAdvanced.output -> VAEDecodeAudio.samples
VAEDecode.IMAGE + VAEDecodeAudio.AUDIO -> CreateVideo
CreateVideo.VIDEO -> SaveVideo.video
```

在不同 ComfyUI 版本，socket 的中文翻譯可能略有不同；以 socket type 和顏色為準。`MiniMax H3 Image to Video.LATENT` 應連到 sampler 的 latent input，`RandomNoise.NOISE` 連到 sampler 的 noise input，不能把兩者倒轉。

### A-4. 設定 loader 和取樣參數

先使用以下固定值，不要同時加入 LoRA、ControlNet、upscale 或其他 custom node：

| Node | 設定 |
| --- | --- |
| `UNETLoader` | `minimax_h3_fl2va_pruned_int8_convrot.safetensors` |
| `CLIPLoader` | `qwen3vl_32b_heretic_minimax_h3_nvfp4.safetensors`，type 選 `minimax`，device 用 `default` |
| video `VAELoader` | `minimax_h3_video_vae_fp16.safetensors` |
| audio `VAELoader` | `minimax_h3_audio_vae_fp32.safetensors` |
| H3 width / height | `736` × `416` |
| H3 length | `124` frames，約 `5.167` 秒，`24 fps` |
| `RandomNoise` | seed `20260905` |
| `KSamplerSelect` | `res_multistep` |
| `BasicScheduler` | scheduler `simple`，steps `20`，denoise `1.0` |
| `CreateVideo` | fps `24`，bit depth `8` |
| `SaveVideo` | prefix `video/H3_Heretic_T2V` |

H3 原生畫布約為 768px short edge，並有像素上限；`736x416` 是本機 16GB VRAM 的保守起步值。先確認 pipeline 成功，再增加解析度或 duration。

### A-5. 寫入 prompt

H3 會同時理解畫面、鏡頭和聲音，所以 prompt 應按時間順序寫。以下例子是成人虛構角色，不依賴任何真人圖：

```text
Anime-style cinematic VTuber introduction. A clearly adult fictional university student in her mid-twenties, short dark-blue hair, navy blazer and white shirt, standing in a quiet campus courtyard at golden hour. Clean 2D anime linework, stable face, natural blinking and a small confident smile.

Timeline: [0s-2s] medium shot, a gentle breeze moves her hair as she looks toward the camera. [2s-4s] slow camera push-in, she raises one hand in greeting. [4s-5s] hold on the smile with subtle hair movement.

Camera: stable 24fps cinematic movement, no hard cuts, keep the character centered and anatomically consistent. Audio: soft campus ambience, light wind, subtle footsteps, a short warm chime, no dialogue, no subtitles, no logos or watermark.
```

按 `Queue` 執行。完成標準是：不是黑畫面、沒有 CUDA／VAE error、MP4 可播放，而且有 video 和 audio stream。

### A-6. 本次實測結果

這組設定已在本機成功完成一輪 smoke test：

```text
output: C:\AI\ComfyUI\output\video\H3_Heretic_Smoke_00001_.mp4
execution time: 159.17 seconds
video: H.264, 736x416, 24 fps, 5.167 seconds
audio: AAC, 32000 Hz, stereo
```

log 顯示 H3 會把部分權重 offload 到 RAM：text encoder 約載入 13,282 MiB、offload 約 1,674 MiB；H3 transformer 約載入 11,402 MiB、offload 約 8,594 MiB。32GB RAM 可以跑這個起步尺寸，但不要同時開另一條 SDXL 或大型 video workflow。這次沒有記錄到完整 host-RAM peak，因此不能把上述數字當成總 RAM 峰值。

## Workflow B：I2V 與 FL2V

T2V 是由 prompt 自行發明畫面；I2V 和 FL2V 則先提供圖像錨點。這兩條 workflow 的 H3 核心模型相同，差別在 conditioning 是否收到 frame。

### B-1. 開啟內置 I2V template

在 workflow 選擇器開啟：

```text
video_minimax_h3_i2v
```

畫面通常會看到 `Image to Video (MiniMax H3)` subgraph。先不要把它和 SDXL 的 `Load Checkpoint` workflow 混在一起；H3 要用 `UNETLoader`、`CLIPLoader` 及兩個不同用途的 `VAELoader`。

### B-2. 只做 I2V：first frame

1. 產生一張合成參考圖，或使用不含私人資料的本機圖像。
2. 把 PNG／JPG 放到 Desktop 的 input folder：

   ```text
   C:\Users\User\AppData\Local\Comfy-Desktop\ComfyUI-Shared\input
   ```

3. 在 `Load Image` 選該檔案；找不到檔案時先 refresh image list。
4. 將 `Load Image.image` 連到 H3 subgraph 的 `first_frame`。
5. `last_frame` 留空，這就是 I2V。
6. prompt 清楚描述由第一幀開始的動作、鏡頭和 audio。

I2V 會把 first frame resize 到輸出畫布。先使用 `736x416`、`5.0` 秒、`24 fps`，確認沒有失真或顯存不足，再提高尺寸。

### B-3. FL2V：first frame + last frame

1. 保留 `first_frame` 的輸入。
2. 再加入另一個 `Load Image`，選擇不含私人資料的終點參考圖。
3. 將第二個 `Load Image.image` 連到 `last_frame`。
4. prompt 以時間線描述如何由第一幀過渡到最後一幀。
5. 其他 model、VAE、fps 和 output 設定先保持和 I2V 相同。

FL2V 不是把兩張圖逐格 crossfade；它是把兩端 frame 作為 conditioning anchor，由 H3 生成中間的動作和音訊。兩張參考圖的角色、服裝和畫面比例差距太大時，容易出現跳變。

### B-4. Screenshot 中兩個紅色錯誤

![H3 I2V workflow 的實際錯誤畫面](/zach-ai-blog/images/minimax-h3-i2v-errors.png)

| 畫面現象 | 真正原因 | 修正 |
| --- | --- | --- |
| `Load Image` 紅色，顯示 image does not exist | workflow 記住的路徑已刪除、搬移或只存在另一個 instance | 把合成圖放入 Desktop input folder，重新選檔並 refresh |
| `lora_name` 紅色 | template 記住的官方 8-step Turbo LoRA 尚未完整下載，或只剩 `.part` | 先用 core H3 T2V template；若 subgraph 強制要求有效值，選本機完整的 `minimax_h3_turbo_v4_step600_ema.safetensors`，並保持 `turbo_mode` 關閉 |
| dropdown 看不到 heretic encoder | Desktop 尚未讀取共用 `extra_model_paths.yaml` | 重啟 Desktop，確認 `text_encoders` 路徑及完整檔名 |
| 1344×768 一開始就 OOM | H3 會同時載入 text encoder、transformer、video VAE 和 audio VAE | 先降至 `736x416`、batch 1、5 秒；不要同時執行 SDXL |

Screenshot 中的 `lora_name` 是該 wrapper 的 Turbo 控件，不是「參考圖」本身。`turbo_mode` 關閉時不要為了清除紅色欄位而使用未完成的下載檔；模型檔必須是完整 `.safetensors`。

## T2V、I2V、FL2V 對比

| 路線 | 必需輸入 | 適合用途 | 代價 |
| --- | --- | --- | --- |
| T2V | prompt | 首次 smoke test、自由構圖、測試 audio | 角色外觀和構圖由模型自行發明 |
| I2V | prompt + `first_frame` | 以合成角色圖作外觀及第一幀錨點 | 需要管理 input 圖及尺寸 |
| FL2V | prompt + `first_frame` + `last_frame` | 控制開場和結尾姿態、轉場或產品鏡頭 | 兩端圖像要一致，條件更容易互相衝突 |

本專案的操作順序固定為：T2V smoke test -> I2V 單一 first frame -> FL2V 雙 frame。不要在 T2V 尚未成功時先加入 LoRA、reference video、audio guide 或其他 custom nodes。

## 讓結果可以重現

每次保存 workflow 時，同步記錄：

```text
model files and exact filenames
prompt text
seed
width / height
length and fps
sampler and scheduler
steps and denoise
Turbo mode and LoRA name
output path
```

例如本次 T2V 的最小紀錄是：

```text
seed=20260905
size=736x416
length=124 frames
fps=24
sampler=res_multistep
scheduler=simple
steps=20
turbo=off
```

ComfyUI workflow 可另存為 JSON，建議放在：

```text
C:\AI\ComfyUI\workflows
```

workflow JSON 只記錄節點和參數，不會把數十 GB 的模型嵌入檔案內；其他電腦要重現時，仍要先建立相同的 model folder 和檔名。

## 限制及參考資料

- [MiniMax 官方 H3 開源公告](https://www.minimax.io/news/minimax-h3-open-source)
- [MiniMax H3 model card](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [ComfyUI H3 setup and inference](https://github.com/ModelTC/Minimax-H3-Turbo/blob/main/COMFYUI_SETUP_AND_INFERENCE.md)
- [Comfy-Org MiniMax-H3 models](https://huggingface.co/Comfy-Org/MiniMax-H3)

官方 template 可能會隨 ComfyUI Desktop 更新而改變 default steps、模型檔名或 node 介面。文章中的路徑和 T2V 結果是本機這次驗證的紀錄；如果 dropdown 或 socket 與文章不同，先以當前 Desktop 的 node schema 和完整錯誤訊息為準，不要混用舊 portable custom node 的 workflow。
