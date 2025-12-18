# n8n에서 Markdown 파일 처리 가이드

## 문제: "Unsupported mime type: application/octet-stream"

### 원인 분석

**현재 상황:**
- 파일명: `Possible 소개.md`
- File Extension: `bin` (잘못 인식됨)
- MIME Type: `application/octet-stream` (일반 바이너리로 인식)
- 오류: Default Data Loader가 이 MIME 타입을 지원하지 않음

**문제점:**
1. .md 파일이 올바른 MIME 타입으로 인식되지 않음
2. `application/octet-stream`은 일반 바이너리 파일로 인식
3. Default Data Loader가 이 타입을 처리하지 못함

## 해결 방법

### 방법 1: Default Data Loader 설정 변경 (시도)

#### Data Format 설정 확인
1. **Default Data Loader** 노드 선택
2. **Parameters** 탭에서 **Data Format** 확인
3. **"Automatically Detect by Mime Type"** 선택되어 있는지 확인
4. 만약 다른 값이면 **"Text"** 또는 **"Automatically Detect by Mime Type"**으로 변경

#### Type of Data 설정
- **Type of Data**: `Text`로 변경 시도
- Markdown은 텍스트 파일이므로 Text로 처리 가능

### 방법 2: Read Binary File 노드 사용 (권장)

Default Data Loader 대신 직접 텍스트로 읽기:

```
1. Form 노드 (Upload your file here)
   ↓
2. Read Binary File 노드
   - Operation: Read
   - File: Form 노드의 파일 데이터
   - 파일을 텍스트로 직접 읽기
   ↓
3. Code 노드 (선택적)
   - 텍스트 데이터 정리
   - 필요시 Markdown 파싱
   ↓
4. Split Text 노드
   - Text: Read Binary File 노드의 텍스트
   - Chunk Size: 1000
   - Chunk Overlap: 200
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

### 방법 3: Code 노드로 직접 처리

Form 노드에서 직접 텍스트 추출:

```
1. Form 노드
   ↓
2. Code 노드
   - 파일 데이터를 텍스트로 변환
   - Markdown 파일 직접 읽기
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
const fileData = $input.first().json.binary;

if (!fileData) {
  throw new Error('No file data found');
}

// 바이너리 데이터를 텍스트로 변환
const text = Buffer.from(fileData.data, 'base64').toString('utf-8');

return [{
  json: {
    text: text,
    fileName: fileData.fileName || 'unknown.md',
    mimeType: fileData.mimeType || 'text/markdown'
  }
}];
```

### 방법 4: Extract From File 노드 사용

n8n의 Extract From File 노드는 Markdown을 지원할 수 있음:

```
1. Form 노드
   ↓
2. Extract From File 노드
   - Operation: Extract Text
   - Markdown 파일을 텍스트로 추출
   ↓
3. Split Text 노드
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

## Default Data Loader 설정 확인

### 현재 설정 확인

**Default Data Loader 노드에서:**
1. **Type of Data**: `Binary` → `Text`로 변경 시도
2. **Data Format**: `Automatically Detect by Mime Type` 확인
3. **Text Splitting**: `Simple` 확인

### 설정 변경 방법

1. **Default Data Loader** 노드 선택
2. **Parameters** 탭
3. **Type of Data** 드롭다운에서 **"Text"** 선택
4. **Data Format**을 **"Text"** 또는 **"Automatically Detect by Mime Type"** 선택
5. 저장 후 다시 실행

## 권장 해결 방법

### 가장 확실한 방법: Read Binary File + Split Text

Markdown 파일은 텍스트 파일이므로 직접 읽기가 가장 확실합니다:

```
1. Form 노드 (Upload your file here)
   ↓
2. Read Binary File 노드
   - Operation: Read
   - 파일을 텍스트로 읽기
   ↓
3. Split Text 노드 (Split Out)
   - Text: $json.data
   - Chunk Size: 1000
   - Chunk Overlap: 200
   ↓
4. Embeddings OpenAI 노드
   - Text: $json.text
   ↓
5. Qdrant Vector Store 노드
   - Document 입력: Split Text 노드 연결
   - Embedding Document 입력: Embeddings OpenAI 노드 연결
```

## MIME 타입 문제 해결

### 문제: application/octet-stream으로 인식

**원인:**
- Form 노드가 파일의 MIME 타입을 올바르게 감지하지 못함
- 서버가 파일 확장자만 보고 MIME 타입을 추측

**해결:**
1. **Read Binary File 노드 사용** - MIME 타입 무시하고 텍스트로 읽기
2. **Code 노드에서 강제 변환** - 바이너리를 텍스트로 변환
3. **Extract From File 노드 사용** - 파일 타입 자동 감지

## 워크플로우 수정 예시

### 현재 구조 (오류 발생)
```
Form → Qdrant Vector Store → Default Data Loader
```

### 수정된 구조 (권장)
```
Form → Read Binary File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

또는

```
Form → Extract From File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

## 파일 타입별 처리 전략

### Markdown 파일 (.md)
- ✅ **Read Binary File 노드** 사용 (가장 확실)
- ✅ **Extract From File 노드** 사용 (자동 감지)
- ⚠️ Default Data Loader (MIME 타입 문제 가능)

### 텍스트 파일 (.txt)
- ✅ Read Binary File 노드
- ✅ Extract From File 노드
- ✅ Default Data Loader (Text 타입 설정)

### PDF 파일 (.pdf)
- ✅ Extract From File 노드
- ✅ Default Data Loader (Binary 타입, 자동 감지)

### Word 파일 (.docx)
- ✅ Extract From File 노드
- ✅ Default Data Loader (Binary 타입, 자동 감지)

## 문제 해결 체크리스트

### Markdown 파일이 처리되지 않는 경우
- [ ] Default Data Loader의 Type of Data를 "Text"로 변경
- [ ] Data Format을 "Text" 또는 "Automatically Detect"로 설정
- [ ] Read Binary File 노드 사용 시도
- [ ] Extract From File 노드 사용 시도
- [ ] Code 노드로 직접 텍스트 변환 시도

### MIME 타입 오류 해결
- [ ] Read Binary File 노드 사용 (MIME 타입 무시)
- [ ] Code 노드에서 강제 텍스트 변환
- [ ] 파일 확장자 확인 (.md가 맞는지)
- [ ] 파일 인코딩 확인 (UTF-8)

## 빠른 해결 방법

### 즉시 해결 (권장)

1. **Default Data Loader 노드 제거**
2. **Read Binary File 노드 추가**
   - Form 노드 다음에 배치
   - Operation: Read
3. **Split Text 노드 추가**
   - Read Binary File 다음에 배치
   - Text: `$json.data`
4. **연결 수정**
   - Form → Read Binary File
   - Read Binary File → Split Text
   - Split Text → Embeddings OpenAI
   - Embeddings OpenAI → Qdrant Vector Store

이렇게 하면 Markdown 파일이 확실하게 처리됩니다!

## 요약

### 문제: .md 파일이 Default Data Loader에서 인식되지 않음

**원인:**
- MIME 타입이 `application/octet-stream`으로 잘못 인식됨
- Default Data Loader가 이 타입을 지원하지 않음

**해결 방법:**
1. ✅ **Read Binary File 노드 사용** (가장 확실)
2. ✅ **Extract From File 노드 사용** (자동 감지)
3. ⚠️ Default Data Loader 설정 변경 (Type of Data: Text)

**권장 워크플로우:**
```
Form → Read Binary File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

이렇게 하면 Markdown 파일도 확실하게 처리됩니다!

