#pragma once

#include "FileAnalyzer.hpp"

namespace cba {

class PythonAnalyzer : public FileAnalyzer {
public:
    explicit PythonAnalyzer(std::filesystem::path filePath);
    void analyze() override;
    [[nodiscard]] std::string languageName() const override;
    [[nodiscard]] Language language() const override;
};

} // namespace cba
