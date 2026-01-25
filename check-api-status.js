// 공공데이터 API 활성화 여부 확인 스크립트
const fs = require('fs');
const https = require('https');
const { URL } = require('url');

console.log('========================================');
console.log('공공데이터 API 활성화 여부 확인');
console.log('========================================\n');

// .env.local 파일 확인
const envFilePath = '.env.local';

if (!fs.existsSync(envFilePath)) {
  console.log('[X] .env.local 파일이 없습니다.');
  console.log('    프로젝트 루트에 .env.local 파일을 생성하고 DATA_GO_KR_SERVICE_KEY를 설정하세요.\n');
  process.exit(1);
}

console.log('[OK] .env.local 파일을 찾았습니다.');

// 서비스 키 읽기
const envContent = fs.readFileSync(envFilePath, 'utf-8');
const serviceKeyLine = envContent.split('\n').find(line => line.startsWith('DATA_GO_KR_SERVICE_KEY='));

if (!serviceKeyLine) {
  console.log('[X] DATA_GO_KR_SERVICE_KEY를 찾을 수 없습니다.');
  console.log('    .env.local 파일에 다음을 추가하세요:');
  console.log('    DATA_GO_KR_SERVICE_KEY=여기에_서비스_키_입력\n');
  process.exit(1);
}

const serviceKey = serviceKeyLine.split('=')[1].trim();

if (!serviceKey) {
  console.log('[X] 서비스 키가 비어있습니다.\n');
  process.exit(1);
}

// 서비스 키 일부만 표시 (보안)
const maskedKey = serviceKey.length > 15
  ? serviceKey.substring(0, 10) + '...' + serviceKey.substring(serviceKey.length - 5)
  : serviceKey.substring(0, Math.min(5, serviceKey.length)) + '***';

console.log(`[OK] 서비스 키 발견: ${maskedKey}\n`);

// API 테스트
console.log('----------------------------------------');
console.log('공공데이터 API 테스트 중...');
console.log('----------------------------------------\n');

// URL 인코딩
const encodedKey = encodeURIComponent(serviceKey);
const testUrl = `https://apis.data.go.kr/1160100/service/GetGeneralProductInfoService/getGnrlPrdctClpr?serviceKey=${encodedKey}&numOfRows=10&pageNo=1&resultType=json&itmKndCd=20`;

console.log('API 엔드포인트: GetGeneralProductInfoService/getGnrlPrdctClpr');
console.log('파라미터: itmKndCd=20 (금 시세)\n');

const url = new URL(testUrl);

const options = {
  hostname: url.hostname,
  path: url.pathname + url.search,
  method: 'GET',
  headers: {
    'Accept': 'application/json',
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('[OK] HTTP 응답 성공 - 200 OK\n');

      try {
        const json = JSON.parse(data);

        if (json.response && json.response.header) {
          const header = json.response.header;
          console.log('=== API 응답 결과 ===');
          console.log(`resultCode: ${header.resultCode}`);
          console.log(`resultMsg: ${header.resultMsg}\n`);

          if (header.resultCode === '00') {
            console.log('[SUCCESS] API 호출 성공! 공공데이터 API가 정상적으로 활성화되어 있습니다!\n');

            // 데이터 확인
            if (json.response.body && json.response.body.items) {
              const items = json.response.body.items.item;
              if (items) {
                const itemArray = Array.isArray(items) ? items : [items];
                if (itemArray.length > 0) {
                  const latest = itemArray[0];
                  console.log('=== 최신 금 시세 데이터 ===');
                  console.log(`기준일자: ${latest.basDt}`);
                  console.log(`종가: ${latest.clpr} 원/g`);
                  console.log(`전일대비: ${latest.vs} 원`);
                  console.log(`등락률: ${latest.fltRt} %`);
                }
              }
            }
          } else if (header.resultCode === '03') {
            console.log('[ERROR] 서비스 키 오류 (CODE-03)');
            console.log('  원인: 서비스 키가 잘못되었거나 인코딩 문제');
            console.log('  해결: 공공데이터 포털에서 "일반 인증키(Encoding)"를 다시 복사하세요');
          } else if (header.resultCode === '01') {
            console.log('[ERROR] API 신청 미승인 (CODE-01)');
            console.log('  원인: "금융위원회_일반상품시세정보" API 신청이 승인되지 않음');
            console.log('  해결: 마이페이지 > 오픈API > 활용신청 내역에서 승인 상태 확인');
          } else if (header.resultCode === '05') {
            console.log('[ERROR] 일일 트래픽 초과 (CODE-05)');
            console.log('  원인: 일일 API 호출 한도를 초과했습니다');
            console.log('  해결: 내일 다시 시도하거나 유료 플랜을 고려하세요');
          } else {
            console.log(`[ERROR] API 오류 (CODE-${header.resultCode})`);
            console.log(`  메시지: ${header.resultMsg}`);
          }
        } else {
          console.log('[WARNING] 예상하지 못한 응답 형식입니다.');
          console.log('응답 내용:', data.substring(0, 500));
        }
      } catch (parseError) {
        console.log('[ERROR] JSON 파싱 실패');
        console.log('응답 내용:', data.substring(0, 500));
      }
    } else {
      console.log(`[ERROR] HTTP 응답 실패 - ${res.statusCode}`);
      console.log('응답 내용:', data.substring(0, 500));
    }

    console.log('\n========================================');
    console.log('확인 완료');
    console.log('========================================\n');
  });
});

req.on('error', (error) => {
  console.log('[ERROR] API 호출 실패');
  console.log(`  오류: ${error.message}\n`);

  if (error.message.includes('404')) {
    console.log('  원인 분석:');
    console.log('  - API 엔드포인트가 잘못되었거나');
    console.log('  - 서비스 키가 잘못되었을 수 있습니다');
    console.log('');
    console.log('  해결 방법:');
    console.log('  1. 공공데이터 포털에서 "일반 인증키(Encoding)" 확인');
    console.log('  2. API 신청 승인 상태 확인');
    console.log('  3. 서비스 키를 .env.local에 다시 입력');
  }

  console.log('\n========================================');
  console.log('확인 완료');
  console.log('========================================\n');
});

req.end();
