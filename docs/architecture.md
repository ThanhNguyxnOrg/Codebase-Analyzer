# 🧱 Architecture & OOP Design Patterns

This document details the software architecture, class design, and Object-Oriented Programming (OOP) principles implemented within the **Codebase Analyzer** project.

---

## 🎨 System Flow

The system features two main traversal paths: the local Electron + React frontend desktop flow, and the backend high-performance C++ CLI Core scanner.

### 🖥️ Desktop UI Flow
```mermaid
flowchart TD
    A[🚀 Open Desktop App] --> B[📂 Choose Local Folder]
    B --> C[🔍 Scan Project Directory]
    C --> D[🧠 Analyze Source Files]
    D --> E[📊 Display Dashboard]
    E --> F[📝 Export Markdown Report]
```

### 🧱 Component Interactions
```mermaid
flowchart LR
    UI[🖥️ Electron + React UI] --> LocalScan[📂 Local Folder Scanner]
    LocalScan --> Analysis[🧠 Analysis Engine]
    Analysis --> Dashboard[📊 Dashboard View]
    Analysis --> Report[📝 Markdown Report]

    CLI[⚙️ C++ CLI Core] --> Scanner[📂 DirectoryScanner]
    Scanner --> Analyzer[🧩 FileAnalyzer Classes]
    Analyzer --> CLIReport[📝 ReportGenerator]
```

---

## 📊 Class Structure Diagram

The C++ Core Engine is built entirely using OOP principles with clean abstraction, strong type-safety, and modular composition:

```mermaid
classDiagram
    class FileAnalyzer {
        <<abstract>>
        #filePath_ : filesystem::path
        #fileName_ : string
        #fileSize_ : uintmax_t
        #codeLines_ : size_t
        #commentLines_ : size_t
        #blankLines_ : size_t
        +analyze()* void
        +languageName()* string
        +language()* Language
        +totalLines() size_t
        +filePath() const path&
        +fileName() const string&
        +codeLines() size_t
        +commentLines() size_t
        +blankLines() size_t
        #isBlank(line) bool$
        #trim(s) void$
    }

    class DirectoryScanner {
        -rootPath_ : filesystem::path
        -files_ : vector~unique_ptr~FileAnalyzer~~
        -ignoredDirectories_ : size_t
        -ignoredFiles_ : size_t
        -unsupportedFiles_ : size_t
        -defaultIgnoreRules_ : vector~string~
        -gitignoreRules_ : vector~string~
        -appliedIgnoreRules_ : vector~string~
        +scanDirectory() void
        +runAnalysis() void
        +getFiles() const vector&
        +getRootPath() const path&
        +ignoredDirectoriesCount() size_t
        +ignoredFilesCount() size_t
        +unsupportedFilesCount() size_t
        -loadIgnoreRules() void
        -shouldIgnore(path, isDir) bool
        -createAnalyzer(path) unique_ptr
    }

    class ReportGenerator {
        -scanner_ : const DirectoryScanner&
        +printConsoleReport() void
        +generateMarkdownReport(path) void
    }

    class CppAnalyzer
    class CAnalyzer
    class PythonAnalyzer
    class JavaAnalyzer
    class CSharpAnalyzer
    class JavaScriptAnalyzer
    class TypeScriptAnalyzer
    class WebAnalyzer
    class HtmlAnalyzer
    class CssAnalyzer

    FileAnalyzer <|-- CppAnalyzer
    FileAnalyzer <|-- CAnalyzer
    FileAnalyzer <|-- PythonAnalyzer
    FileAnalyzer <|-- JavaAnalyzer
    FileAnalyzer <|-- CSharpAnalyzer
    FileAnalyzer <|-- JavaScriptAnalyzer
    FileAnalyzer <|-- TypeScriptAnalyzer
    FileAnalyzer <|-- WebAnalyzer
    FileAnalyzer <|-- HtmlAnalyzer
    FileAnalyzer <|-- CssAnalyzer

    DirectoryScanner *-- FileAnalyzer : Composition
    ReportGenerator --> DirectoryScanner : Dependency
```

---

## 🧩 Core OOP Principles Applied

| OOP Principle | Implementation Detail in Codebase |
|:---|:---|
| 🧊 **Abstraction** | The abstract base class `FileAnalyzer` defines a rigid interface for analyzing files (`analyze()`, `languageName()`, metrics accessors) without dictating concrete implementation details. |
| 🧬 **Inheritance** | Platform/Language-specific classes (e.g. `CppAnalyzer`, `PythonAnalyzer`, `JavaAnalyzer`) derive from `FileAnalyzer`, reusing properties and defining syntax-specific parser logic. |
| 🔁 **Polymorphism** | Dynamic binding is achieved by storing pointers to derived objects in a `std::vector<std::unique_ptr<FileAnalyzer>>`. The scanner fires `file->analyze()` polymorphically. |
| 🔒 **Encapsulation** | Each class guards its private members. For example, `DirectoryScanner` keeps ignore rules and file lists private, exposing them only via secure read-only accessors (`getFiles()`). |
| 🧱 **Composition** | `DirectoryScanner` exhibits **composition** by managing the complete lifecycle of `FileAnalyzer` objects via `std::unique_ptr` smart containers. |
| 🛠️ **Dependency Injection** | `ReportGenerator` utilizes dependency injection via reference (`const DirectoryScanner&`) to generate reports from scanner results, decoupling scanning and reporting concerns. |
