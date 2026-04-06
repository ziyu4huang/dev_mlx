#!/bin/bash
#
# PDF Backend Benchmark Script
#
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BINARY="$PROJECT_DIR/target/release/agent-builder-cli"

PDF_DIR="${1:-$PROJECT_DIR/test_pdfs}"
OUTPUT_DIR="${2:-$PROJECT_DIR/benchmark_results}"

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }

check_prerequisites() {
    if [ ! -f "$BINARY" ]; then
        log_info "Building release binary..."
        cd "$PROJECT_DIR"
        cargo build --release --bin agent-builder-cli
    fi

    PDF_COUNT=$(find "$PDF_DIR" -name "*.pdf" -type f 2>/dev/null | wc -l)
    if [ "$PDF_COUNT" -eq 0 ]; then
        echo "No PDF files found in $PDF_DIR"
        exit 1
    fi
    log_success "Found $PDF_COUNT PDF files"
}

setup_output_dir() {
    rm -rf "$OUTPUT_DIR"
    mkdir -p "$OUTPUT_DIR"/{unpdf,pdfium,pdftotext,metrics}
}

benchmark_pdf() {
    local pdf_path="$1"
    local backend="$2"
    local pdf_name=$(basename "$pdf_path" .pdf)
    local output_file="$OUTPUT_DIR/$backend/${pdf_name}.md"

    local start_time=$(date +%s.%N)

    if [ "$backend" = "pdftotext" ]; then
        pdftotext -layout "$pdf_path" - > "$output_file" 2>/dev/null || true
    else
        "$BINARY" tool pdf "$pdf_path" --mode markdown --markdown-backend "$backend" \
            > "$output_file" 2>/dev/null || true
    fi

    local end_time=$(date +%s.%N)
    local elapsed=$(echo "$end_time - $start_time" | bc)
    local file_size=$(wc -c < "$output_file" 2>/dev/null || echo "0")

    echo "${backend}: ${elapsed}s, ${file_size} bytes" >> "$OUTPUT_DIR/metrics/${pdf_name}.txt"
    log_success "  ${backend}: ${elapsed}s"
}

run_benchmarks() {
    for pdf in "$PDF_DIR"/*.pdf; do
        if [ -f "$pdf" ]; then
            pdf_name=$(basename "$pdf" .pdf)
            log_info "Processing: $pdf_name"

            benchmark_pdf "$pdf" "unpdf"
            benchmark_pdf "$pdf" "pdfium"
            command -v pdftotext &>/dev/null && benchmark_pdf "$pdf" "pdftotext"
            echo ""
        fi
    done
}

echo "PDF Backend Benchmark"
echo "====================="

check_prerequisites
setup_output_dir
run_benchmarks

echo ""
echo "Results saved to: $OUTPUT_DIR"
