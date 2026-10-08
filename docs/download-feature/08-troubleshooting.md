# 08 · Troubleshooting & OS Warnings Guide

This guide details how to resolve common browser and operating system security prompts when downloading or installing PaperForge desktop installers and APK packages.

---

## 1. Windows SmartScreen Warning
Because PaperForge releases are distributed without costly code-signing certificates, Windows SmartScreen may display a warning on unrecognised `.exe` files.

### Symptoms
A blue prompt appears stating: *"Windows protected your PC — Microsoft Defender SmartScreen prevented an unrecognized app from starting."*

### Resolution
1. Click **"More info"** on the prompt.
2. Click **"Run anyway"** at the bottom of the window.
3. PaperForge Setup will launch normally.

---

## 2. Chrome / Edge "File May Be Dangerous" Warning
Modern browsers display safety warnings when downloading executable files (`.exe`) or Android package files (`.apk`).

### Symptoms
Browser download bar shows: *"PaperForge-Setup.exe isn't commonly downloaded and may be dangerous"* or *"This file type can harm your device."*

### Resolution
1. Click the **Option Menu (three dots)** or click on the download item.
2. Select **"Keep"** or **"Keep anyway"**.
3. Locate the file in your `Downloads` folder and launch/install it.

---

## 3. Android "Install Unknown Apps" Permission
Android blocks direct installation of `.apk` files downloaded from web browsers by default.

### Symptoms
When tapping `paperforge.apk`, Android displays: *"For your security, your phone is not allowed to install unknown apps from this source."*

### Resolution
1. Tap **Settings** on the prompt dialog.
2. Toggle ON **"Allow from this source"** (or enable for Google Chrome / Files app).
3. Return to the installer prompt and tap **Install**.

---

## 4. Android Google Play Protect Warning
Google Play Protect scans side-loaded APK packages not installed via the Play Store.

### Symptoms
A warning dialog states: *"Blocked by Play Protect — Unrecognised app developer."*

### Resolution
1. Tap **"Install anyway"** (or tap *More details* → *Install anyway*).
2. The app will finish installing and run offline.

---

## 5. In-App WebViews (Instagram, Facebook, WhatsApp, Line)
Opening download links inside social media in-app browsers can break direct file downloads.

### Symptoms
Tapping the download button inside Instagram or Facebook WebViews displays the notice:
> **"In-App Browser Detected: Open in Chrome / your browser to download"**

### Resolution
1. Tap the **three dots (...)** menu icon in the top-right corner of the in-app screen.
2. Tap **"Open in Chrome"** or **"Open in System Browser"**.
3. Click the download button in your primary browser.
