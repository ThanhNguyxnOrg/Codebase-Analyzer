# 🚀 Getting Started for Development & Contribution

This document details how to set up the development environment, compile releases, automate builds, and understand the academic context.

---

## 🖥️ Local Desktop UI Development

The Desktop interface is built using Electron, React, TypeScript, and Vite.

### 🧱 Dev Environment Setup
Ensure you have **Node.js (LTS)** installed, then run:

```bash
# Navigate to the Desktop UI project
cd ui_design

# Install development dependencies
npm install

# Run the local Vite dev server
npm run dev
```

### 📦 Compile Desktop Release Binaries

To package the application into platform-native desktop installers (built with `electron-builder` under the hood):

```bash
cd ui_design
npm run build
npm run dist
```

Native platform binaries will be generated inside the directory:
```txt
ui_design/release/
```
> ⚠️ **Note**: Do not commit the `release/` folder to GitHub. Binaries are compiled and published directly as release assets.

---

## 🤖 Continuous Integration (GitHub Actions)

We utilize automated GitHub Actions pipelines to generate cross-platform build artifacts.

* 🚀 **CI Pipelines**: [GitHub Actions Dashboard](https://github.com/ThanhNguyn/Codebase-Analyzer/actions)
* 📦 **Release Builds**: [Latest Release Packages](https://github.com/ThanhNguyn/Codebase-Analyzer/releases/latest)

---

## 🗺️ Roadmap & Current Goals

- [x] **C++ CLI Analyzer Core** (abstraction, scanner, OOP classes)
- [x] **Recursive Directory Scanner** (skip node_modules, build, ignore rules)
- [x] **Markdown Report Generation** (`codebase_report.md` output)
- [x] **Desktop UI Core Prototype** (Electron + React, directory pick flow)
- [x] **Windows Desktop Installer Build**
- [x] **GitHub Releases & Walkthrough video integration**
- [ ] 🔜 Connect Electron UI directly to C++ executable
- [ ] 🔜 Add PDF & HTML report export functions
- [ ] 🔜 Add interactive visual charts for language distributions
- [ ] 🔜 Add more custom programming language analyzers

---

## 🎓 Academic Project Context

This application was developed as a term project for the **Object-Oriented Programming (OOP)** university course.

### 👨‍💻 Team — 404 Team Not Found

| Name | Student ID | Academic Role |
|:---|:---|:---|
| **Nguyễn Tuấn Thành** | `25112107` | 👑 Team Leader / Lead Backend Engineer |
| **Đoàn Ngọc Bích** | `25112138` | Frontend Engineer / UX Designer |
| **Nguyễn Đăng Khoa** | `25112163` | QA Engineer / Test Writer |

---

## 📜 License & Usage

This project is licensed under the academic and educational usage guidelines. All rights reserved for school submission.
