# 📥 Installation & Setup Guide

This guide details how to install and run the **Codebase Analyzer** in both **Desktop UI** and **CLI Core** modes across different operating systems (Windows, macOS, and Linux).

---

## 🖥️ Mode 1: Desktop UI App (Recommended)

Perfect for normal users, presentations, and interactive folder traversal with visual charts and dashboards.

### ⬇️ Download Latest Release
* 📦 **[Download Latest Desktop Release](https://github.com/ThanhNguyn/Codebase-Analyzer/releases/latest)**
* 📂 **[All Published Releases](https://github.com/ThanhNguyn/Codebase-Analyzer/releases)**

### 🪟 Windows Installation
1. Go to the **Latest Release** page.
2. Download the Windows installer (`Codebase-Analyzer-Setup.exe`) or the portable ZIP file (`Codebase-Analyzer-win-unpacked.zip`).
3. **If using the installer:** Double-click the `.exe` file → follow the setup steps → open the app.
4. **If using the ZIP file:** Extract the archive → run `Codebase-Analyzer.exe` in the extracted folder.
5. Inside the app, click **Choose Local Folder**, select a real project, and explore the dashboard!

### 🍎 macOS Installation
1. Go to the **Latest Release** page.
2. Download the macOS installer (`Codebase-Analyzer.dmg`) or equivalent archive.
3. Open the `.dmg` file and drag **Codebase Analyzer** to your `Applications` folder.
4. Launch the application.
> ⚠️ **Note**: macOS Gatekeeper may warn about an unsigned application. You can bypass this in System Settings > Privacy & Security > Open Anyway (standard for student projects without paid Apple Developer signatures).

### 🐧 Linux Installation
1. Go to the **Latest Release** page.
2. Download the `Codebase-Analyzer.AppImage` package.
3. Grant execution permissions to the downloaded file:
   ```bash
   chmod +x Codebase-Analyzer.AppImage
   ```
4. Run the package:
   ```bash
   ./Codebase-Analyzer.AppImage
   ```

---

## ⚙️ Mode 2: C++ CLI Core (Build from Source)

Ideal for developer testing, automated pipeline runs, or inspecting standard C++ OOP behavior without loading the Electron UI.

### 🧱 Prerequisites

Ensure your system has the following toolchains installed:

| Operating System | Compiler Required | Build Tools |
|:---|:---|:---|
| **🪟 Windows** | MSVC (Visual Studio 2022) or MinGW-w64 | CMake 3.20+ |
| **🍎 macOS** | Apple Clang (Xcode CLI tools) | CMake 3.20+ (`brew install cmake`) |
| **🐧 Linux** | GCC 13+ or Clang 16+ | CMake 3.20+ (`sudo apt install build-essential cmake`) |

### 📥 Clone & Setup

```bash
git clone https://github.com/ThanhNguyn/Codebase-Analyzer.git
cd Codebase-Analyzer
```

### 🔨 Build & Run Instructions by OS

#### 🪟 Windows (Powershell / Command Prompt)
```powershell
# 1. Configure the build directory
cmake -S . -B build

# 2. Build the C++ executable (Release mode)
cmake --build build --config Release

# 3. Run the analyzer on your project directory
.\build\Release\codebase_analyzer.exe .\your-project
```

#### 🍎 macOS (Terminal)
```bash
# 1. Configure the build directory
cmake -S . -B build

# 2. Build the C++ executable
cmake --build build --config Release

# 3. Run the analyzer on your project directory
./build/codebase_analyzer ./your-project
```

#### 🐧 Linux (Terminal)
```bash
# 1. Configure the build directory
cmake -S . -B build

# 2. Build the C++ executable
cmake --build build --config Release

# 3. Run the analyzer on your project directory
./build/codebase_analyzer ./your-project
```

---

## 📝 Generated Output

After running the C++ CLI analyzer, it automatically generates a high-quality Markdown report in the root directory named:
```txt
codebase_report.md
```

The report includes:
* 📁 Total source folders & scanned files
* 🧾 Line metrics: Code, Comments, and Blank lines
* 📊 Interactive language distribution breakdown
