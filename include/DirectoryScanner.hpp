#pragma once

#include "FileAnalyzer.hpp"
#include <filesystem>
#include <memory>
#include <string>
#include <vector>

namespace cba {

class DirectoryScanner {
public:
    explicit DirectoryScanner(std::filesystem::path rootPath);
    
    void scanDirectory();
    void runAnalysis();
    
    [[nodiscard]] const std::vector<std::unique_ptr<FileAnalyzer>>& getFiles() const;
    [[nodiscard]] const std::filesystem::path& getRootPath() const;

private:
    std::filesystem::path rootPath_;
    std::vector<std::unique_ptr<FileAnalyzer>> files_;
    
    bool shouldIgnore(const std::filesystem::path& path) const;
    std::unique_ptr<FileAnalyzer> createAnalyzer(const std::filesystem::path& path) const;
};

} // namespace cba
