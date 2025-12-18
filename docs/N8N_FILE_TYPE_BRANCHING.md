# n8n 파일 타입별 분기 처리 가이드

## 문제: 모든 파일 타입을 하나의 노드로 처리하기 어려움

### Extract from File 노드의 한계

**Extract from File 노드는:**
- ✅ PDF, DOCX, 텍스트 파일 등은 잘 처리
- ⚠️ Excel/CSV 같은 구조화된 데이터는 별도 처리 필요
- ⚠️ Markdown은 텍스트로 처리되지만 MIME 타입 문제 가능

**따라서 파일 타입별로 분기 처리가 필요할 수 있습니다.**

## 해결 방법: 파일 타입별 분기 처리

### 방법 1: IF 노드로 파일 타입 분기 (권장)

파일 확장자에 따라 다른 처리:

```
1. Form 노드 (Upload your file here)
   ↓
2. IF 노드 (파일 확장자 확인)
   ├─ .pdf, .docx, .md, .txt
   │   ↓
   │   Extract from File 노드
   │   - Operation: Extract Text
   │   - 일반 문서 파일 처리
   │
   ├─ .xlsx, .xls
   │   ↓
   │   Microsoft Excel 노드
   │   - Operation: Read from File
   │   - Excel 데이터 읽기
   │   ↓
   │   Code 노드
   │   - Excel 데이터를 텍스트로 변환
   │
   └─ .csv
       ↓
       Read Binary File 노드 (또는 Code 노드)
       - CSV를 텍스트로 읽기
       ↓
       Code 노드
       - CSV 파싱 및 텍스트 변환
   ↓
3. Split Text 노드 (통합)
   - 모든 경로에서 텍스트 데이터 수집
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

### 방법 2: Switch 노드 사용

여러 파일 타입을 더 세밀하게 분기:

```
1. Form 노드
   ↓
2. Code 노드 (파일 확장자 추출)
   - 파일 확장자를 별도 필드로 추출
   ↓
3. Switch 노드 (파일 확장자별 분기)
   ├─ .pdf → Extract from File (PDF)
   ├─ .docx → Extract from File (DOCX)
   ├─ .md → Extract from File (Text)
   ├─ .xlsx → Microsoft Excel 노드
   ├─ .csv → CSV 파싱 노드
   └─ 기타 → Extract from File (자동 감지)
   ↓
4. 텍스트 통합 (Merge 노드 또는 Code 노드)
   ↓
5. Split Text 노드
   ↓
6. Embeddings OpenAI 노드
   ↓
7. Qdrant Vector Store 노드
```

## 실제 구현 예시

### IF 노드 설정

**조건 1: 일반 문서 파일**
```
파일 확장자가 다음 중 하나:
- .pdf
- .docx
- .md
- .txt
→ Extract from File 노드 사용
```

**조건 2: Excel 파일**
```
파일 확장자가 다음 중 하나:
- .xlsx
- .xls
→ Microsoft Excel 노드 사용
```

**조건 3: CSV 파일**
```
파일 확장자가:
- .csv
→ Code 노드로 CSV 파싱
```

### Code 노드로 파일 확장자 추출

```javascript
// 파일 확장자 추출
const items = $input.all();

const itemsWithExtension = items.map(item => {
  const binary = item.json.binary;
  const fileName = binary?.fileName || item.json.fileName || '';
  const extension = fileName.split('.').pop()?.toLowerCase() || '';
  
  return {
    json: {
      ...item.json,
      fileExtension: extension,
      fileName: fileName
    }
  };
});

return itemsWithExtension;
```

### IF 노드 조건 설정

**조건 1: 일반 문서**
```
{{ $json.fileExtension }} in ['pdf', 'docx', 'md', 'txt']
```

**조건 2: Excel 파일**
```
{{ $json.fileExtension }} in ['xlsx', 'xls']
```

**조건 3: CSV 파일**
```
{{ $json.fileExtension }} === 'csv'
```

## 파일 타입별 처리 노드

### 1. 일반 문서 파일 (.pdf, .docx, .md, .txt)

**Extract from File 노드 사용:**
- Operation: Extract Text
- 자동으로 텍스트 추출

### 2. Excel 파일 (.xlsx, .xls)

**Microsoft Excel 노드 사용:**
- Operation: Read from File
- Excel 데이터를 구조화된 데이터로 읽기

**Code 노드로 텍스트 변환:**
```javascript
const items = $input.all();

const textItems = items.map(item => {
  const row = item.json;
  
  // Excel 행을 텍스트로 변환
  const textParts = Object.entries(row)
    .filter(([key, value]) => value !== null && value !== '')
    .map(([key, value]) => `${key}: ${value}`);
  
  const text = textParts.join(', ');
  
  return {
    json: {
      text: text,
      originalData: row
    }
  };
});

return textItems;
```

### 3. CSV 파일 (.csv)

**Code 노드로 CSV 파싱:**
```javascript
const items = $input.all();

const textItems = items.map(item => {
  const binary = item.json.binary;
  
  if (!binary) {
    // 이미 텍스트인 경우
    const csvText = item.json.data || item.json.text;
    const lines = csvText.split('\n');
    
    // 헤더 추출
    const headers = lines[0].split(',').map(h => h.trim());
    
    // 각 행을 텍스트로 변환
    return lines.slice(1)
      .filter(line => line.trim() !== '')
      .map((line, index) => {
        const values = line.split(',').map(v => v.trim());
        const row = {};
        
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        
        const textParts = Object.entries(row)
          .filter(([key, value]) => value !== null && value !== '')
          .map(([key, value]) => `${key}: ${value}`);
        
        return {
          json: {
            text: textParts.join(', '),
            rowIndex: index + 1,
            originalData: row
          }
        };
      });
  }
  
  // 바이너리 데이터를 텍스트로 변환
  const csvText = Buffer.from(binary.data, 'base64').toString('utf-8');
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1)
    .filter(line => line.trim() !== '')
    .map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      const row = {};
      
      headers.forEach((header, i) => {
        row[header] = values[i] || '';
      });
      
      const textParts = Object.entries(row)
        .filter(([key, value]) => value !== null && value !== '')
        .map(([key, value]) => `${key}: ${value}`);
      
      return {
        json: {
          text: textParts.join(', '),
          rowIndex: index + 1,
          originalData: row
        }
      };
    });
}).flat();

return textItems;
```

## 통합 워크플로우

### 완전한 워크플로우 구조

```
1. Form 노드 (Upload your file here)
   ↓
2. Code 노드 (파일 확장자 추출)
   - fileExtension 필드 추가
   ↓
3. IF 노드 (파일 타입 분기)
   ├─ 일반 문서 (.pdf, .docx, .md, .txt)
   │   ↓
   │   Extract from File 노드
   │   - Operation: Extract Text
   │
   ├─ Excel 파일 (.xlsx, .xls)
   │   ↓
   │   Microsoft Excel 노드
   │   - Operation: Read from File
   │   ↓
   │   Code 노드 (텍스트 변환)
   │
   └─ CSV 파일 (.csv)
       ↓
       Code 노드 (CSV 파싱 및 변환)
   ↓
4. Merge 노드 또는 Code 노드 (텍스트 통합)
   - 모든 경로의 텍스트 데이터 수집
   ↓
5. Split Text 노드
   - Text: $json.text
   - Chunk Size: 1000
   - Chunk Overlap: 200
   ↓
6. Embeddings OpenAI 노드
   - Text: $json.text
   ↓
7. Qdrant Vector Store 노드
   - Document 입력: Split Text 노드 연결
   - Embedding Document 입력: Embeddings OpenAI 노드 연결
```

## 간소화된 방법 (선택적)

### 대부분의 파일 타입을 Extract from File로 처리

일부 파일 타입만 별도 처리:

```
1. Form 노드
   ↓
2. IF 노드
   ├─ Excel/CSV 파일
   │   ↓
   │   별도 처리 (Microsoft Excel 또는 CSV 파싱)
   │
   └─ 기타 파일
       ↓
       Extract from File 노드
   ↓
3. Split Text 노드
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

## 요약

### 질문: Extract from File 노드를 사용할 경우 모든 타입의 파일에 대해 다 처리해 줘야 하는거 아냐?

**답변: 네, 맞습니다!** ✅

**Extract from File 노드의 한계:**
- ✅ PDF, DOCX, 텍스트 파일은 잘 처리
- ⚠️ Excel/CSV는 구조화된 데이터라서 별도 처리 필요
- ⚠️ Markdown은 텍스트로 처리되지만 MIME 타입 문제 가능

**해결 방법:**
1. ✅ **파일 타입별 분기 처리** (IF 노드 사용)
2. ✅ 일반 문서: Extract from File 노드
3. ✅ Excel: Microsoft Excel 노드 + 텍스트 변환
4. ✅ CSV: Code 노드로 CSV 파싱

**권장 워크플로우:**
```
Form → IF (파일 타입) → 각 파일 타입별 처리 → 통합 → Split Text → Embeddings → Qdrant
```

이렇게 하면 모든 파일 타입을 올바르게 처리할 수 있습니다!

