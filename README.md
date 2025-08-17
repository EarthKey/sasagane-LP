# Sasagane LP (Static)

## 1) ローカル確認（WSL）
npx serve .

## 2) 画像・動画の追加
assets/ に置いて、HTMLから
<img src="/assets/xxx.jpg" alt=""> / <video src="/assets/xxx.mp4" controls>

## 3) GitHub
git init && git add . && git commit -m "init"
git branch -M main
git remote add origin https://github.com/EarthKey/sasagane-LP.git
git push -u origin main

## 4) Vercel
- Import Git Repository
- Framework: Other（静的）
- Build Command: なし
- Output Directory: ルート（index.htmlが直下）
