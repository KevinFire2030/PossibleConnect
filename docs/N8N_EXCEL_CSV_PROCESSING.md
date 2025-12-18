# n8n에서 Excel/CSV 파일 처리 가이드

## 문제: Excel/CSV가 벡터 스토어에 잘 저장되지 않는 이유

### 주요 원인

#### 1. 구조화된 데이터 형식
- **Excel/CSV는 테이블 형식** 데이터
- 일반 텍스트 문서와 달리 **구조화된 데이터**
- Default Data Loader가 테이블을 의미 있는 텍스트로 변환하지 못할 수 있음

#### 2. 데이터 포맷 인식 문제
- Default Data Loader가 Excel/CSV를 제대로 인식하지 못할 수 있음
- 바이너리 형식으로 읽히면 텍스트 추출이 안 될 수 있음

#### 3. 텍스트 추출 방식
- PDF/DOCX는 텍스트 추출이 명확함
- Excel/CSV는 **셀 단위 데이터**라서 처리 방식이 다름

## 해결 방법

### 방법 1: Microsoft Excel 노드 사용 (권장)

Excel/CSV 파일을 전용 노드로 처리:

```
1. Form 노드 (Upload your file here)
   ↓
2. Microsoft Excel 노드
   - Operation: Read from File
   - 파일에서 데이터 읽기
   - 테이블을 텍스트로 변환
   ↓
3. Code 노드 또는 Function 노드
   - Excel 데이터를 의미 있는 텍스트로 변환
   - 각 행을 문장으로 변환
   ↓
4. Split Text 노드
   - 변환된 텍스트를 청크로 분할
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

### 방법 2: CSV를 텍스트로 변환

CSV 파일의 경우:

```
1. Form 노드
   ↓
2. Read Binary File 노드
   - CSV 파일을 텍스트로 읽기
   ↓
3. Code 노드
   - CSV 파싱 및 텍스트 변환
   - 각 행을 의미 있는 문장으로 변환
   ↓
4. Split Text 노드
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

### 방법 3: Excel 데이터를 구조화된 텍스트로 변환

**Code 노드에서 처리 예시:**

```javascript
// Excel 데이터를 의미 있는 텍스트로 변환
const items = $input.all();

const textItems = items.map(item => {
  const data = item.json;
  
  // Excel 행 데이터를 텍스트로 변환
  const rowText = Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ');
  
  return {
    json: {
      text: rowText,
      metadata: data
    }
  };
});

return textItems;
```

### 방법 4: Excel/CSV 전용 처리 워크플로우

파일 타입에 따라 분기 처리:

```
1. Form 노드
   ↓
2. IF 노드 (파일 확장자 확인)
   ├─ .xlsx, .xls → Microsoft Excel 노드
   ├─ .csv → Read Binary File + CSV 파싱
   └─ 기타 → Default Data Loader
   ↓
3. 텍스트 변환 (Code 노드)
   ↓
4. Split Text 노드
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

## Excel/CSV 데이터 변환 전략

### 전략 1: 행 단위 변환

각 행을 하나의 문서로 변환:

```
행 1: "이름: 홍길동, 나이: 25, 직업: 개발자"
행 2: "이름: 김철수, 나이: 30, 직업: 디자이너"
```

**장점:**
- 각 행이 독립적인 문서로 저장
- 특정 행 검색 가능

**단점:**
- 행 간 관계 정보 손실

### 전략 2: 테이블 전체를 하나의 문서로

전체 테이블을 하나의 문서로 변환:

```
"주소록:
이름: 홍길동, 나이: 25, 직업: 개발자
이름: 김철수, 나이: 30, 직업: 디자이너
..."
```

**장점:**
- 전체 컨텍스트 유지
- 테이블 구조 정보 유지

**단점:**
- 대용량 테이블의 경우 청크 분할 필요

### 전략 3: 의미 있는 그룹으로 변환

관련 행을 그룹화:

```
"개발자 그룹:
- 홍길동, 25세
- 박영희, 28세

디자이너 그룹:
- 김철수, 30세
- 이영희, 27세"
```

**장점:**
- 의미 있는 그룹으로 검색 가능
- 관련 데이터 함께 검색

## 실제 구현 예시

### Excel 파일 처리 (Microsoft Excel 노드 사용)

#### 1. Microsoft Excel 노드 설정
- **Operation**: `Read from File`
- **File**: Form 노드의 파일 데이터
- **Options**: 
  - **Header Row**: `true` (첫 행이 헤더인 경우)
  - **Range**: 전체 시트 또는 특정 범위

#### 2. Code 노드로 텍스트 변환

```javascript
// Excel 데이터를 의미 있는 텍스트로 변환
const items = $input.all();

const textItems = items.map((item, index) => {
  const row = item.json;
  
  // 헤더와 값을 조합하여 문장 생성
  const textParts = Object.entries(row)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key, value]) => `${key}은(는) ${value}입니다`);
  
  const text = textParts.join('. ') + '.';
  
  return {
    json: {
      text: text,
      rowIndex: index + 1,
      originalData: row
    }
  };
});

return textItems;
```

#### 3. Split Text 노드
- **Text**: Code 노드의 `text` 필드
- **Chunk Size**: 1000
- **Chunk Overlap**: 200

### CSV 파일 처리

#### 1. Read Binary File 노드
- **Operation**: `Read`
- **File**: Form 노드의 파일 데이터

#### 2. Code 노드로 CSV 파싱 및 변환

```javascript
// CSV를 파싱하고 텍스트로 변환
const csvText = $input.first().json.data;
const lines = csvText.split('\n');

// 헤더 추출
const headers = lines[0].split(',').map(h => h.trim());

// 각 행을 텍스트로 변환
const textItems = lines.slice(1)
  .filter(line => line.trim() !== '')
  .map((line, index) => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    
    headers.forEach((header, i) => {
      row[header] = values[i] || '';
    });
    
    // 행을 의미 있는 텍스트로 변환
    const textParts = Object.entries(row)
      .filter(([key, value]) => value !== null && value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`);
    
    const text = textParts.join(', ');
    
    return {
      json: {
        text: text,
        rowIndex: index + 1,
        originalData: row
      }
    };
  });

return textItems;
```

## Default Data Loader 문제 해결

### 문제: Default Data Loader가 Excel/CSV를 제대로 처리하지 못함

**원인:**
- Excel/CSV는 구조화된 데이터
- Default Data Loader는 일반 텍스트 문서에 최적화됨

**해결:**
1. **Microsoft Excel 노드 사용** (Excel 파일)
2. **CSV 파싱 노드 사용** (CSV 파일)
3. **파일 타입별 분기 처리**

## 권장 워크플로우

### 통합 워크플로우 (모든 파일 타입 처리)

```
1. Form 노드
   ↓
2. IF 노드 (파일 확장자 확인)
   ├─ .xlsx, .xls
   │   ↓
   │   Microsoft Excel 노드
   │   ↓
   │   Code 노드 (텍스트 변환)
   │
   ├─ .csv
   │   ↓
   │   Read Binary File 노드
   │   ↓
   │   Code 노드 (CSV 파싱 및 변환)
   │
   └─ .pdf, .docx, .md 등
       ↓
       Default Data Loader
   ↓
3. Split Text 노드 (필요시)
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

## Excel/CSV 데이터 최적화 팁

### 1. 헤더 정보 포함
- 테이블의 헤더를 포함하여 의미 있는 텍스트 생성
- 예: "이름: 홍길동, 나이: 25" (헤더 포함)

### 2. 컨텍스트 추가
- 테이블 제목이나 설명 추가
- 예: "주소록 데이터: 이름: 홍길동, 나이: 25"

### 3. 청크 크기 조정
- Excel/CSV는 일반적으로 짧은 텍스트
- Chunk Size를 작게 설정 (예: 500)

### 4. 메타데이터 저장
- 원본 데이터를 payload에 저장
- 검색 후 원본 데이터 접근 가능

## 문제 해결 체크리스트

### Excel 파일이 저장되지 않는 경우
- [ ] Microsoft Excel 노드 사용
- [ ] 파일이 올바르게 읽히는지 확인
- [ ] 텍스트 변환 로직 확인
- [ ] Code 노드 출력 확인

### CSV 파일이 저장되지 않는 경우
- [ ] Read Binary File 노드 사용
- [ ] CSV 파싱 로직 확인
- [ ] 인코딩 문제 확인 (UTF-8)
- [ ] 구분자(쉼표) 확인

### 일반적인 문제
- [ ] 파일 타입이 올바르게 인식되는지 확인
- [ ] 텍스트 변환 후 데이터가 비어있지 않은지 확인
- [ ] Embeddings 생성이 성공하는지 확인
- [ ] Qdrant Collection 설정 확인

## 요약

### Excel/CSV가 잘 저장되지 않는 이유

1. **구조화된 데이터 형식**
   - 테이블 형식이라서 일반 텍스트 문서와 다름
   - Default Data Loader가 제대로 처리하지 못할 수 있음

2. **데이터 포맷 인식 문제**
   - Excel/CSV를 바이너리로 읽으면 텍스트 추출이 안 됨
   - 전용 노드 사용 필요

3. **텍스트 변환 필요**
   - 셀 데이터를 의미 있는 텍스트로 변환해야 함
   - Code 노드로 변환 로직 구현 필요

### 해결 방법

1. **Microsoft Excel 노드 사용** (Excel 파일)
2. **CSV 파싱 노드 사용** (CSV 파일)
3. **텍스트 변환 로직 구현** (Code 노드)
4. **파일 타입별 분기 처리** (IF 노드)

### 권장 워크플로우

```
Form → IF (파일 타입) → Excel/CSV 처리 → 텍스트 변환 → Split Text → Embeddings → Qdrant
```

이렇게 하면 Excel/CSV 파일도 벡터 스토어에 잘 저장됩니다!

