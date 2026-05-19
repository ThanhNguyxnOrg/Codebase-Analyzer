#pragma once

#include "FileAnalyzer.hpp"

namespace cba {

class WebAnalyzer : public FileAnalyzer {
public:
    explicit WebAnalyzer(std::filesystem::path filePath);
    void analyze() override;
    [[nodiscard]] std::string languageName() const override;
    [[nodiscard]] Language language() const override;
};

} // namespace cba
