# n8n 파일 처리 가이드

## 파일 타입별 처리 방법

### 간단한 답변: **대부분 자동 처리 가능** ✅

n8n의 **Extract From File** 노드나 **Qdrant Vector Store** 노드가 많은 파일 타입을 자동으로 처리합니다.

## 자동 처리 가능한 파일 타입

### 1. Extract From File 노드 사용

**Extract From File** 노드는 다음 파일 타입을 **자동으로 처리**합니다:

- ✅ **PDF** (.pdf) - 자동 텍스트 추출
- ✅ **Word** (.doc, .docx) - 자동 텍스트 추출
- ✅ **Excel** (.xlsx, .xls) - 자동 텍스트 추출
- ✅ **Markdown** (.md) - 직접 텍스트로 읽기
- ✅ **CSV** (.csv) - 직접 텍스트로 읽기
- ✅ **텍스트 파일** (.txt) - 직접 텍스트로 읽기

### 2. Qdrant Vector Store 노드 사용

**Qdrant Vector Store** 노드의 **Insert Documents** 모드에서:
- 파일을 자동으로 읽고 처리
- 텍스트 추출 후 임베딩 생성
- 벡터로 변환하여 저장

## 단일 워크플로우로 모든 파일 처리 가능

### 방법 1: Extract From File 노드 사용 (권장)

```
1. Form 노드 (Upload your file here)
   ↓
2. Extract From File 노드
   - 모든 파일 타입 자동 처리
   - PDF, DOCX, XLSX 등 자동 텍스트 추출
   ↓
3. Split Text 노드 (텍스트를 청크로 분할)
   ↓
4. Embeddings OpenAI 노드 (임베딩 생성)
   ↓
5. Qdrant Vector Store 노드 (벡터 저장)
```

**장점:**
- ✅ 하나의 워크플로우로 모든 파일 타입 처리
- ✅ 별도 분기 처리 불필요
- ✅ 설정이 간단함

### 방법 2: Qdrant Vector Store 노드 직접 사용

**Qdrant Vector Store** 노드가 자동으로 파일을 처리할 수 있는 경우:

```
1. Form 노드 (Upload your file here)
   ↓
2. Qdrant Vector Store 노드
   - Operation: Insert Documents
   - 파일 자동 처리 및 임베딩 생성
   ↓
3. 완료
```

**주의:**
- Qdrant Vector Store 노드가 파일을 직접 처리하는지 확인 필요
- 일부 버전에서는 Extract From File 노드가 필요할 수 있음

## 파일 타입별 상세 처리 방법

### PDF 파일 (.pdf)

**자동 처리:**
```
Extract From File 노드
→ Operation: Extract Text From PDF
→ 자동으로 텍스트 추출
```

**수동 처리 (필요시):**
- PDF 파싱 라이브러리 사용
- Code 노드에서 PDF 처리

### Word 파일 (.doc, .docx)

**자동 처리:**
```
Extract From File 노드
→ Operation: Extract Text From DOCX
→ 자동으로 텍스트 추출
```

**주의:**
- `.doc` (구버전)은 일부 제한이 있을 수 있음
- `.docx` (신버전)는 완벽하게 지원

### Excel 파일 (.xlsx, .xls)

**자동 처리:**
```
Extract From File 노드
→ Operation: Extract Text From XLSX
→ 자동으로 텍스트 추출
```

**또는:**
```
Microsoft Excel 노드
→ 데이터를 읽어서 텍스트로 변환
```

### Markdown 파일 (.md)

**가장 간단:**
```
파일을 직접 텍스트로 읽기
→ 별도 처리 불필요
→ 바로 Split Text 노드로 전달 가능
```

### CSV 파일 (.csv)

**가장 간단:**
```
파일을 직접 텍스트로 읽기
→ 또는 CSV 파싱 후 텍스트로 변환
```

## 실제 워크플로우 구성 예시

### 통합 워크플로우 (모든 파일 타입 처리)

```json
{
  "nodes": [
    {
      "name": "Upload your file here",
      "type": "n8n-nodes-base.form",
      "parameters": {
        "formTitle": "Upload your data to test RAG",
        "formElements": {
          "values": [
            {
              "fieldName": "Upload your file(s)",
              "elementType": "File",
              "acceptedFileTypes": ".pdf,.csv,.doc,.md,.xlsx",
              "multipleFiles": true,
              "required": true
            }
          ]
        }
      }
    },
    {
      "name": "Extract From File",
      "type": "n8n-nodes-base.extractFromFile",
      "parameters": {
        "operation": "extractText",
        "options": {}
      }
    },
    {
      "name": "Split Text",
      "type": "n8n-nodes-base.splitOut",
      "parameters": {
        "operation": "splitText",
        "text": "={{ $json.text }}",
        "options": {
          "chunkSize": 1000,
          "chunkOverlap": 200
        }
      }
    },
    {
      "name": "Embeddings OpenAI",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.text }}"
      }
    },
    {
      "name": "Qdrant Vector Store",
      "type": "n8n-nodes-base.qdrant",
      "parameters": {
        "operation": "insertDocuments",
        "collection": "possible",
        "embeddingDocument": "={{ $json }}"
      }
    }
  ]
}
```

## 파일 타입별 분기 처리 (선택적)

**필요한 경우에만** 파일 타입별로 분기 처리:

```
1. Form 노드
   ↓
2. IF 노드 (파일 확장자 확인)
   ├─ .pdf → PDF 전용 처리 (필요시)
   ├─ .docx → DOCX 전용 처리 (필요시)
   ├─ .md → 직접 텍스트 처리
   ├─ .xlsx → Excel 전용 처리 (필요시)
   └─ 기타 → Extract From File 노드
   ↓
3. 텍스트 통합
   ↓
4. Split Text 노드
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

**이 방법은 일반적으로 불필요합니다.** Extract From File 노드가 대부분 자동으로 처리합니다.

## 권장 워크플로우

### 가장 간단한 방법 (권장) ✅

```
1. Form 노드
   ↓
2. Extract From File 노드
   (모든 파일 타입 자동 처리)
   ↓
3. Split Text 노드
   ↓
4. Embeddings OpenAI 노드
   ↓
5. Qdrant Vector Store 노드
```

**이 하나의 워크플로우로 모든 파일 타입 처리 가능!**

## 주의사항

### 파일 크기 제한
- 대용량 파일의 경우 처리 시간이 오래 걸릴 수 있음
- 타임아웃 설정 확인

### 특수한 경우
- 복잡한 Excel 파일 (여러 시트, 수식 등)
- 스캔된 PDF (이미지 기반)
- 암호화된 파일

이런 경우 추가 처리 필요할 수 있음

## 실제 테스트

### 테스트 방법
1. 각 파일 타입별로 업로드 테스트
2. Extract From File 노드가 정상 작동하는지 확인
3. 텍스트가 올바르게 추출되는지 확인

### 문제 발생 시
- 파일 타입별로 분기 처리 추가
- 또는 Code 노드에서 직접 처리

## 요약

### 질문: 파일 종류에 따라 다르게 처리해야 하나요?

**답변: 대부분 자동 처리 가능합니다!** ✅

1. **Extract From File 노드** 사용
   - PDF, DOCX, XLSX 등 자동 처리
   - 하나의 워크플로우로 모든 파일 타입 처리 가능

2. **별도 분기 처리 불필요**
   - 대부분의 경우 하나의 워크플로우로 충분
   - 파일 타입별로 다른 처리가 필요하지 않음

3. **예외적인 경우**
   - 복잡한 Excel 파일
   - 스캔된 PDF
   - 특수한 형식의 파일
   - → 이 경우에만 추가 처리 필요

## 결론

**당신의 경우:**
- ✅ **Extract From File 노드 하나로 충분**
- ✅ PDF, DOC, MD, XLSX 모두 자동 처리
- ✅ 별도 분기 처리 불필요
- ✅ 간단한 워크플로우 구성 가능

**권장 워크플로우:**
```
Form → Extract From File → Split Text → Embeddings → Qdrant
```

이 하나의 워크플로우로 모든 파일 타입을 처리할 수 있습니다!

