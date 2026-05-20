#include "DirectoryScanner.hpp"
#include "CppAnalyzer.hpp"
#include "PythonAnalyzer.hpp"
#include "WebAnalyzer.hpp"
#include "JavaAnalyzer.hpp"
#include "CSharpAnalyzer.hpp"
#include <algorithm>

namespace cba {

DirectoryScanner::DirectoryScanner(std::filesystem::path rootPath)
    : rootPath_(std::move(rootPath)) {}

bool DirectoryScanner::shouldIgnore(const std::filesystem::path& path) const {
    std::string filename = path.filename().string();
    if (filename == ".git" || filename == "node_modules" || 
        filename == "build" || filename == "dist" || 
        filename == "bin" || filename == "venv") {
        return true;
    }
    return false;
}

std::unique_ptr<FileAnalyzer> DirectoryScanner::createAnalyzer(const std::filesystem::path& path) const {
    if (!std::filesystem::is_regular_file(path)) {
        return nullptr;
    }

    std::string ext = path.extension().string();
    std::transform(ext.begin(), ext.end(), ext.begin(), [](unsigned char c) { return std::tolower(c); });

    if (ext == ".cpp" || ext == ".h" || ext == ".hpp" || ext == ".c") {
        return std::make_unique<CppAnalyzer>(path);
    } else if (ext == ".py") {
        return std::make_unique<PythonAnalyzer>(path);
    } else if (ext == ".html" || ext == ".css" || ext == ".js" || ext == ".ts") {
        return std::make_unique<WebAnalyzer>(path);
    } else if (ext == ".java") {
        return std::make_unique<JavaAnalyzer>(path);
    } else if (ext == ".cs") {
        return std::make_unique<CSharpAnalyzer>(path);
    }

    return nullptr;
}

void DirectoryScanner::scanDirectory() {
    if (!std::filesystem::exists(rootPath_)) {
        return;
    }

    auto it = std::filesystem::recursive_directory_iterator(rootPath_, std::filesystem::directory_options::skip_permission_denied);
    for (auto& entry : it) {
        if (entry.is_directory() && shouldIgnore(entry.path())) {
            it.disable_recursion_pending();
            continue;
        }

        if (entry.is_regular_file()) {
            if (auto analyzer = createAnalyzer(entry.path())) {
                files_.push_back(std::move(analyzer));
            }
        }
    }
}

void DirectoryScanner::runAnalysis() {
    for (auto& file : files_) {
        file->analyze();
    }
}

const std::vector<std::unique_ptr<FileAnalyzer>>& DirectoryScanner::getFiles() const {
    return files_;
}

const std::filesystem::path& DirectoryScanner::getRootPath() const {
    return rootPath_;
}

} // namespace cba
