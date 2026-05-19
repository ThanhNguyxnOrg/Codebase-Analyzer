#include "WebAnalyzer.hpp"
#include <fstream>
#include <string>

namespace cba {

WebAnalyzer::WebAnalyzer(std::filesystem::path filePath)
    : FileAnalyzer(std::move(filePath)) {}

std::string WebAnalyzer::languageName() const {
    return "Web";
}

Language WebAnalyzer::language() const {
    return Language::Web;
}

void WebAnalyzer::analyze() {
    std::ifstream file(filePath_);
    if (!file.is_open()) {
        return;
    }

    std::string line;
    bool inBlockCommentC = false;
    bool inBlockCommentHtml = false;

    while (std::getline(file, line)) {
        trim(line);
        if (line.empty()) {
            blankLines_++;
            continue;
        }

        bool isCommentLine = false;

        if (inBlockCommentC) {
            isCommentLine = true;
            size_t endPos = line.find("*/");
            if (endPos != std::string::npos) {
                inBlockCommentC = false;
                std::string remainder = line.substr(endPos + 2);
                trim(remainder);
                if (!remainder.empty()) {
                    isCommentLine = false;
                }
            }
        } else if (inBlockCommentHtml) {
            isCommentLine = true;
            size_t endPos = line.find("-->");
            if (endPos != std::string::npos) {
                inBlockCommentHtml = false;
                std::string remainder = line.substr(endPos + 3);
                trim(remainder);
                if (!remainder.empty()) {
                    isCommentLine = false;
                }
            }
        } else {
            if (line.starts_with("/*")) {
                isCommentLine = true;
                size_t endPos = line.find("*/");
                if (endPos == std::string::npos) {
                    inBlockCommentC = true;
                } else {
                    std::string remainder = line.substr(endPos + 2);
                    trim(remainder);
                    if (!remainder.empty()) {
                        isCommentLine = false;
                    }
                }
            } else if (line.starts_with("<!--")) {
                isCommentLine = true;
                size_t endPos = line.find("-->");
                if (endPos == std::string::npos) {
                    inBlockCommentHtml = true;
                } else {
                    std::string remainder = line.substr(endPos + 3);
                    trim(remainder);
                    if (!remainder.empty()) {
                        isCommentLine = false;
                    }
                }
            } else if (line.starts_with("//")) {
                isCommentLine = true;
            }
        }

        if (isCommentLine) {
            commentLines_++;
        } else {
            codeLines_++;
        }
    }
}

} // namespace cba
