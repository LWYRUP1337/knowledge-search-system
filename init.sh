#!/bin/bash

set -e

API_URL="http://localhost:8000"
UPLOAD_ENDPOINT="${API_URL}/api/v1/documents/upload"
TMP_DIR="./tmp_pdfs"

# список открытых PDF для загрузки
URLS=(
    "https://www.w3.org/WAI/WCAG21/wcag-2.1.pdf"
    "https://pjreddie.com/media/files/papers/YOLOv3.pdf"
    "https://arxiv.org/pdf/1706.03762.pdf"
    "https://arxiv.org/pdf/1810.04805.pdf"
    "https://arxiv.org/pdf/2005.14165.pdf"
    "https://arxiv.org/pdf/1512.03385.pdf"
    "https://arxiv.org/pdf/1409.0473.pdf"
    "https://arxiv.org/pdf/1508.04025.pdf"
    "https://arxiv.org/pdf/2010.11929.pdf"
    "https://arxiv.org/pdf/1607.06450.pdf"
)

wait_for_backend() {
    echo "Waiting for backend..."
    for i in $(seq 1 30); do
        if curl -sf "${API_URL}/health" > /dev/null 2>&1; then
            echo "Backend is ready"
            return 0
        fi
        echo "Attempt ${i}/30, retrying in 5s..."
        sleep 5
    done
    echo "Backend did not respond after 150 seconds"
    exit 1
}

main() {
    echo "Knowledge Search System - init script"
    echo "======================================"

    wait_for_backend

    mkdir -p "${TMP_DIR}"

    SUCCESS=0
    FAILED=0
    INDEX=1

    for URL in "${URLS[@]}"; do
        FILENAME="document_${INDEX}.pdf"
        FILEPATH="${TMP_DIR}/${FILENAME}"

        echo ""
        echo "[${INDEX}/10] Downloading: ${URL}"

        if curl -sL --max-time 30 -o "${FILEPATH}" "${URL}" 2>/dev/null; then
            echo "Uploading: ${FILENAME}"

            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                -X POST "${UPLOAD_ENDPOINT}" \
                -F "file=@${FILEPATH}" \
                --max-time 60)

            if [ "${HTTP_STATUS}" = "200" ] || [ "${HTTP_STATUS}" = "201" ]; then
                echo "OK (HTTP ${HTTP_STATUS})"
                SUCCESS=$((SUCCESS + 1))
            else
                echo "Upload failed (HTTP ${HTTP_STATUS})"
                FAILED=$((FAILED + 1))
            fi
        else
            echo "Download failed"
            FAILED=$((FAILED + 1))
        fi

        INDEX=$((INDEX + 1))
    done

    rm -rf "${TMP_DIR}"

    echo ""
    echo "======================================"
    echo "Done. Success: ${SUCCESS}, Failed: ${FAILED}"
    echo ""
    echo "Frontend:   http://localhost"
    echo "API docs:   http://localhost:8000/docs"
    echo "Grafana:    http://localhost:3000"
    echo "Prometheus: http://localhost:9090"
}

main
