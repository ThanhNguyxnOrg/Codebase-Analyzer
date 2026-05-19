#include "PythonAnalyzer.hpp"
#include <fstream>
#include <string>

namespace cba {

PythonAnalyzer::PythonAnalyzer(std::filesystem::path filePath)
    : FileAnalyzer(std::move(filePath)) {}

std::string PythonAnalyzer::languageName() const {
    return "Python";
}

Language PythonAnalyzer::language() const {
    return Language::Python;
}

void PythonAnalyzer::analyze() {
    std::ifstream file(filePath_);
    if (!file.is_open()) {
        return;
    }

    std::string line;
    bool inDocstringSingle = false;
    bool inDocstringDouble = false;

    while (std::getline(file, line)) {
        trim(line);
        if (line.empty()) {
            blankLines_++;
            continue;
        }

        bool isCommentLine = false;

        if (inDocstringDouble) {
            isCommentLine = true;
            size_t endPos = line.find("\"\"\"");
            if (endPos != std::string::npos) {
                inDocstringDouble = false;
                std::string remainder = line.substr(endPos + 3);
                trim(remainder);
                if (!remainder.empty()) {
                    isCommentLine = false;
                }
            }
        } else if (inDocstringSingle) {
            isCommentLine = true;
            size_t endPos = line.find("'''");
            if (endPos != std::string::npos) {
                inDocstringSingle = false;
                std::string remainder = line.substr(endPos + 3);
                trim(remainder);
                if (!remainder.empty()) {
                    isCommentLine = false;
                }
            }
        } else {
            if (line.starts_with("\"\"\"")) {
                isCommentLine = true;
                size_t endPos = line.find("\"\"\"", 3);
                if (endPos == std::string::npos) {
                    inDocstringDouble = true;
                } else {
                    std::string remainder = line.substr(endPos + 3);
                    trim(remainder);
                    if (!remainder.empty()) {
                        isCommentLine = false;
                    }
                }
            } else if (line.starts_with("'''")) {
                isCommentLine = true;
                size_t endPos = line.find("'''", 3);
                if (endPos == std::string::npos) {
                    inDocstringSingle = true;
                } else {
                    std::string remainder = line.substr(endPos + 3);
                    trim(remainder);
                    if (!remainder.empty()) {
                        isCommentLine = false;
                    }
                }
            } else if (line.starts_with("#")) {
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
