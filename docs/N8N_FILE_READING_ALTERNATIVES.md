# n8n에서 파일 읽기 대체 방법

## 문제: Read Binary File 노드가 없음

n8n 버전이나 설정에 따라 노드 이름이 다를 수 있습니다. 대체 방법을 사용하세요.

## 대체 방법

### 방법 1: Extract from File 노드 사용 (권장)

이미지에서 보이는 **"Extract from File"** 노드를 사용하세요:

**설정:**
1. **Extract from File** 노드 추가
2. **Operation**: `Extract Text` 선택
3. **File**: Form 노드의 파일 데이터 연결

**워크플로우:**
```
1. Form 노드 (Upload your file here)
   ↓
2. Extract from File 노드
   - Operation: Extract Text
   - Markdown 파일을 텍스트로 추출
   ↓
3. Split Text 노드 (Split Out)
   - Text: $json.text
   - Chunk Size: 1000
   - Chunk Overlap: 200
   ↓
4. Embeddings OpenAI 노드
   - Text: $json.text
   ↓
5. Qdrant Vector Store 노드
```

**장점:**
- ✅ Markdown 파일을 텍스트로 자동 추출
- ✅ PDF, DOCX 등도 처리 가능
- ✅ 설정이 간단함

### 방법 2: Code 노드로 직접 처리

Form 노드의 바이너리 데이터를 직접 텍스트로 변환:

**워크플로우:**
```
1. Form 노드 (Upload your file here)
   ↓
2. Code 노드
   - 파일 바이너리 데이터를 텍스트로 변환
   ↓
3. Split Text 노드
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

**Code 노드 예시:**
```javascript
// 파일 데이터를 텍스트로 변환
const items = $input.all();

const textItems = items.map(item => {
  const binary = item.json.binary;
  
  if (!binary) {
    // 이미 텍스트인 경우
    return {
      json: {
        text: item.json.data || item.json.text || JSON.stringify(item.json)
      }
    };
  }
  
  // 바이너리 데이터를 텍스트로 변환
  const text = Buffer.from(binary.data, 'base64').toString('utf-8');
  
  return {
    json: {
      text: text,
      fileName: binary.fileName || 'unknown.md',
      mimeType: binary.mimeType || 'text/markdown'
    }
  };
});

return textItems;
```

### 방법 3: Read/Write Files from Disk 노드 사용

**주의:** 이 노드는 디스크의 파일을 읽는 노드입니다. Form 노드에서 업로드한 파일에는 직접 사용하기 어렵습니다.

**사용 시나리오:**
- 파일을 먼저 디스크에 저장한 후 읽기
- 일반적으로 권장하지 않음

## 권장 해결 방법

### Extract from File 노드 사용 (가장 권장)

이미지에서 보이는 **"Extract from File"** 노드를 사용하세요:

1. **Extract from File** 노드 추가
   - 오른쪽 사이드바에서 "Extract from File" 검색
   - 노드 추가

2. **연결 수정**
   - Form 노드 → Extract from File 노드
   - Extract from File 노드 → Split Text 노드

3. **설정**
   - **Operation**: `Extract Text` 선택
   - 입력 데이터가 Form 노드에서 오는지 확인

## 워크플로우 수정

### 현재 구조
```
Form → Qdrant Vector Store → Default Data Loader
```

### 수정된 구조 (Extract from File 사용)
```
Form → Extract from File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

### 단계별 수정

1. **Extract from File 노드 추가**
   - Form 노드와 Qdrant Vector Store 사이에 추가
   - Operation: Extract Text

2. **Split Text 노드 추가**
   - Extract from File 다음에 추가
   - Text: `$json.text`

3. **연결 수정**
   - Form → Extract from File
   - Extract from File → Split Text
   - Split Text → Embeddings OpenAI
   - Embeddings OpenAI → Qdrant Vector Store

4. **Default Data Loader 제거 또는 우회**
   - Default Data Loader 연결 제거
   - 또는 새로운 경로 사용

## Extract from File 노드 설정

### 기본 설정

1. **Operation**: `Extract Text` 선택
2. **File**: Form 노드의 파일 데이터 연결
3. **Options**: 기본값 사용

### 지원 파일 타입

Extract from File 노드는 다음 파일 타입을 지원:
- ✅ PDF (.pdf)
- ✅ Word (.docx)
- ✅ Excel (.xlsx)
- ✅ Markdown (.md) - 텍스트로 처리
- ✅ 텍스트 파일 (.txt)
- ✅ CSV (.csv) - 텍스트로 처리

## Code 노드 사용 시 주의사항

### 바이너리 데이터 접근

Form 노드에서 업로드한 파일은 `binary` 필드에 저장됩니다:

```javascript
// Form 노드의 파일 데이터 구조
{
  json: {
    binary: {
      data: "base64 인코딩된 데이터",
      fileName: "Possible 소개.md",
      mimeType: "application/octet-stream"
    }
  }
}
```

### 텍스트 변환

```javascript
const binary = $input.first().json.binary;
const text = Buffer.from(binary.data, 'base64').toString('utf-8');
```

## 문제 해결

### Extract from File 노드를 찾을 수 없는 경우

1. **노드 검색**
   - 오른쪽 사이드바에서 "Extract" 검색
   - 또는 "File" 검색

2. **노드 이름 확인**
   - "Extract from File"
   - "Extract From File"
   - "Extract Text From File"

3. **대체 노드**
   - Code 노드 사용
   - 또는 다른 파일 처리 노드 사용

### Extract from File 노드가 작동하지 않는 경우

1. **Operation 확인**
   - `Extract Text` 선택되어 있는지 확인

2. **입력 데이터 확인**
   - Form 노드의 파일 데이터가 올바르게 연결되었는지 확인

3. **Code 노드로 대체**
   - Extract from File 대신 Code 노드 사용

## 요약

### Read Binary File 노드가 없는 경우

**대체 방법:**
1. ✅ **Extract from File 노드 사용** (가장 권장)
   - 이미지에서 보이는 노드
   - Markdown 파일을 텍스트로 추출

2. ✅ **Code 노드 사용**
   - 바이너리 데이터를 직접 텍스트로 변환
   - 더 세밀한 제어 가능

3. ⚠️ Read/Write Files from Disk (권장하지 않음)
   - 디스크 파일용
   - Form 업로드 파일에는 부적합

### 권장 워크플로우

```
Form → Extract from File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

**설정:**
- Extract from File: Operation = Extract Text
- Split Text: Text = $json.text
- Embeddings OpenAI: Text = $json.text

이렇게 하면 Markdown 파일도 확실하게 처리됩니다!

