# 🌐 Supported Source File Types & Parsing Rules

This document details the file extensions supported by the **Codebase Analyzer** and the specific syntax parsing logic applied to each.

---

## 📊 Extension Support & Identification

The `DirectoryScanner::createAnalyzer()` factory parses file extensions (case-insensitively) and allocates the appropriate analyzer subclass:

| Target Language / Tech Stack | Supported Extensions | Concrete Class | Comment Style |
|:---|:---|:---|:---|
| **C / C++** | `.c`, `.cpp`, `.h`, `.hpp`, `.cxx`, `.cc`, `.hxx`, `.hh` | `CppAnalyzer`, `CAnalyzer` | `//` and `/* ... */` |
| **Java** | `.java` | `JavaAnalyzer` | `//` and `/* ... */` |
| **C#** | `.cs` | `CSharpAnalyzer` | `//` and `/* ... */` |
| **Python** | `.py` | `PythonAnalyzer` | `#` and `""" ... """` / `''' ... '''` |
| **JavaScript** | `.js`, `.jsx`, `.mjs`, `.cjs` | `JavaScriptAnalyzer` | `//` and `/* ... */` |
| **TypeScript** | `.ts`, `.tsx`, `.mts`, `.cts` | `TypeScriptAnalyzer` | `//` and `/* ... */` |
| **HTML** | `.html`, `.htm` | `HtmlAnalyzer` | `<!-- ... -->` |
| **CSS** | `.css` | `CssAnalyzer` | `/* ... */` |

---

## 🧠 Line Detection & Parsing Logic

Each derived `FileAnalyzer` subclass overrides the pure virtual function:
```cpp
void analyze() override;
```

Inside this function, files are read line-by-line using high-speed standard input streams (`std::ifstream`), stripping whitespace and determining line roles:

### 1. Blank Lines
A line is counted as **Blank** if it contains only whitespace characters (spaces, tabs, carriage returns, newlines). The static helper function is:
```cpp
bool FileAnalyzer::isBlank(const std::string& line);
```

### 2. Comments
* **Single-line Comments**: Evaluated based on prefix detection (e.g. `//` for C/C++, `#` for Python) outside active string literals.
* **Multi-line Comments**: Triggers state-tracking boolean flags (e.g., `inBlockComment`). Any line processed while `inBlockComment == true` is classified as a Comment Line, incrementing the comment counter until the terminating tag (e.g. `*/` or `"""`) is parsed.

### 3. Source Code Lines
Any line that is neither pure whitespace nor a comment is treated as an executable **Code Line**, providing realistic and accurate metrics rather than mocked numbers.
