#!/bin/bash
# curl을 사용한 공공데이터 API 활성화 여부 확인 스크립트

echo "========================================"
echo "curl로 공공데이터 API 확인"
echo "========================================"
echo ""

# .env.local 파일 확인
ENV_FILE=".env.local"

if [ ! -f "$ENV_FILE" ]; then
    echo "[X] .env.local 파일이 없습니다."
    echo "    프로젝트 루트에 .env.local 파일을 생성하고 DATA_GO_KR_SERVICE_KEY를 설정하세요."
    echo ""
    exit 1
fi

echo "[OK] .env.local 파일을 찾았습니다."

# 서비스 키 읽기
SERVICE_KEY=$(grep "^DATA_GO_KR_SERVICE_KEY=" "$ENV_FILE" | cut -d'=' -f2- | tr -d ' ' | tr -d '"')

if [ -z "$SERVICE_KEY" ]; then
    echo "[X] DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다."
    echo "    .env.local 파일에 다음을 추가하세요:"
    echo "    DATA_GO_KR_SERVICE_KEY=여기에_서비스_키_입력"
    echo ""
    exit 1
fi

# 서비스 키 일부만 표시 (보안)
if [ ${#SERVICE_KEY} -gt 15 ]; then
    MASKED_KEY="${SERVICE_KEY:0:10}...${SERVICE_KEY: -5}"
else
    MASKED_KEY="${SERVICE_KEY:0:5}***"
fi

echo "[OK] 서비스 키 발견: $MASKED_KEY"
echo ""

# URL 인코딩 (Python 사용)
ENCODED_KEY=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$SERVICE_KEY'))" 2>/dev/null || python -c "import urllib.parse; print(urllib.parse.quote('$SERVICE_KEY'))" 2>/dev/null || echo "$SERVICE_KEY")

API_URL="https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=${ENCODED_KEY}&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20"

echo "----------------------------------------"
echo "curl로 API 호출 중..."
echo "----------------------------------------"
echo ""
echo "API URL: https://apis.data.go.kr/...GetGeneralProductInfoService/getGnrlPrdctClpr"
echo "파라미터: itmKndCd=20 (금 시세)"
echo ""

# curl 명령어 실행
HTTP_CODE=$(curl -s -o /tmp/api_response.json -w "%{http_code}" -X GET "$API_URL" 2>&1)
RESPONSE=$(cat /tmp/api_response.json 2>/dev/null || echo "")

echo "=== 응답 결과 ==="
echo "HTTP 상태 코드: $HTTP_CODE"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "[OK] HTTP 응답 성공 - 200 OK"
    echo ""
    
    # JSON 파싱 (jq 사용 가능하면)
    if command -v jq &> /dev/null; then
        RESULT_CODE=$(echo "$RESPONSE" | jq -r '.response.header.resultCode // "N/A"' 2>/dev/null)
        RESULT_MSG=$(echo "$RESPONSE" | jq -r '.response.header.resultMsg // "N/A"' 2>/dev/null)
        
        echo "=== API 응답 결과 ==="
        echo "resultCode: $RESULT_CODE"
        echo "resultMsg: $RESULT_MSG"
        echo ""
        
        if [ "$RESULT_CODE" = "00" ]; then
            echo "[SUCCESS] API 호출 성공! 공공데이터 API가 정상적으로 활성화되어 있습니다!"
            echo ""
            
            # 데이터 확인
            BAS_DT=$(echo "$RESPONSE" | jq -r '.response.body.items.item[0].basDt // "N/A"' 2>/dev/null)
            CLPR=$(echo "$RESPONSE" | jq -r '.response.body.items.item[0].clpr // "N/A"' 2>/dev/null)
            VS=$(echo "$RESPONSE" | jq -r '.response.body.items.item[0].vs // "N/A"' 2>/dev/null)
            FLT_RT=$(echo "$RESPONSE" | jq -r '.response.body.items.item[0].fltRt // "N/A"' 2>/dev/null)
            
            if [ "$BAS_DT" != "N/A" ]; then
                echo "=== 최신 금 시세 데이터 ==="
                echo "기준일자: $BAS_DT"
                echo "종가: $CLPR 원/g"
                echo "전일대비: $VS 원"
                echo "등락률: $FLT_RT %"
            fi
        elif [ "$RESULT_CODE" = "03" ]; then
            echo "[ERROR] 서비스 키 오류 (CODE-03)"
            echo "  원인: 서비스 키가 잘못되었거나 인코딩 문제"
            echo "  해결: 공공데이터 포털에서 '일반 인증키(Encoding)'를 다시 복사하세요"
        elif [ "$RESULT_CODE" = "01" ]; then
            echo "[ERROR] API 신청 미승인 (CODE-01)"
            echo "  원인: '금융위원회_일반상품시세정보' API 신청이 승인되지 않음"
            echo "  해결: 마이페이지 > 오픈API > 활용신청 내역에서 승인 상태 확인"
        elif [ "$RESULT_CODE" = "05" ]; then
            echo "[ERROR] 일일 트래픽 초과 (CODE-05)"
            echo "  원인: 일일 API 호출 한도를 초과했습니다"
            echo "  해결: 내일 다시 시도하거나 유료 플랜을 고려하세요"
        else
            echo "[ERROR] API 오류 (CODE-$RESULT_CODE)"
            echo "  메시지: $RESULT_MSG"
        fi
    else
        echo "[INFO] jq가 설치되어 있지 않아 JSON 파싱을 건너뜁니다."
        echo "응답 내용 (처음 500자):"
        echo "$RESPONSE" | head -c 500
        echo ""
        echo ""
        echo "jq 설치: sudo apt-get install jq (Ubuntu/Debian) 또는 brew install jq (macOS)"
    fi
elif [ "$HTTP_CODE" = "404" ]; then
    echo "[ERROR] API 엔드포인트를 찾을 수 없습니다 (404)"
    echo ""
    echo "  원인 분석:"
    echo "  - API 엔드포인트가 잘못되었거나"
    echo "  - API 신청이 승인되지 않았거나"
    echo "  - 서비스 키가 잘못되었을 수 있습니다"
    echo ""
    echo "  해결 방법:"
    echo "  1. 공공데이터 포털에서 '일반 인증키(Encoding)' 확인"
    echo "  2. API 신청 승인 상태 확인"
    echo "  3. 서비스 키를 .env.local에 다시 입력"
else
    echo "[ERROR] HTTP 응답 실패 - $HTTP_CODE"
    echo "응답 내용 (처음 500자):"
    echo "$RESPONSE" | head -c 500
    echo ""
fi

# 임시 파일 정리
rm -f /tmp/api_response.json

echo ""
echo "========================================"
echo "확인 완료"
echo "========================================"
echo ""
