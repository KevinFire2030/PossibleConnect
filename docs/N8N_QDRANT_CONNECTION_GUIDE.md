# Qdrant Vector Store 노드 연결 가이드

## 문제: "No node connected to required input 'Document'"

Qdrant Vector Store 노드는 **두 가지 입력**이 필요합니다:
1. **Document 입력** - 실제 문서 데이터 (텍스트)
2. **Embedding Document 입력** - 임베딩된 벡터 (Embeddings OpenAI 노드에서)

## 올바른 워크플로우 구성

### 방법 1: Extract From File 노드 추가 (권장)

```
1. Form 노드 (Upload your file here)
   ↓
2. Extract From File 노드 (파일에서 텍스트 추출)
   ↓
3. Split Text 노드 (텍스트를 청크로 분할)
   ↓
4. Embeddings OpenAI 노드 (임베딩 생성)
   ↓
5. Qdrant Vector Store 노드
   ├─ Document 입력: Split Text 노드 연결
   └─ Embedding Document 입력: Embeddings OpenAI 노드 연결
```

### 방법 2: 현재 구조 수정

현재 구조에서:
- "Upload your file here" → "Qdrant Vector Store" (Document 입력)
- "Embeddings OpenAI" → "Qdrant Vector Store" (Embedding Document 입력) ← **이 연결이 필요함**

**해결 방법:**
1. **Embeddings OpenAI** 노드의 출력 포트를 찾기
2. **Qdrant Vector Store** 노드의 **"Embeddi Document*"** 입력 포트에 연결
3. 연결선을 드래그하여 완전히 연결

## 단계별 연결 방법

### 1단계: Extract From File 노드 추가

현재 워크플로우에 **Extract From File** 노드를 추가하세요:

1. 노드 추가
   - "+" 버튼 클릭
   - "Extract From File" 검색
   - 노드 추가

2. 연결
   - "Upload your file here" → "Extract From File"
   - "Extract From File" → "Split Text" (또는 직접 Embeddings OpenAI)

### 2단계: Split Text 노드 추가 (선택적)

텍스트를 청크로 분할하려면:

1. 노드 추가
   - "Split Text" 또는 "Split Out" 검색
   - 노드 추가

2. 연결
   - "Extract From File" → "Split Text"
   - "Split Text" → "Embeddings OpenAI"

### 3단계: Embeddings OpenAI 노드 연결

**중요:** Embeddings OpenAI 노드를 Qdrant Vector Store에 연결:

1. **Embeddings OpenAI** 노드 선택
2. 출력 포트 확인 (보통 "Embeddings" 또는 다이아몬드 모양)
3. **Qdrant Vector Store** 노드의 **"Embeddi Document*"** 입력 포트로 드래그
4. 연결선이 완전히 연결되었는지 확인

### 4단계: Document 입력 연결

Qdrant Vector Store 노드의 **Document 입력**에 텍스트 데이터 연결:

- **Extract From File** 노드의 출력 → **Qdrant Vector Store** 노드의 Document 입력
- 또는
- **Split Text** 노드의 출력 → **Qdrant Vector Store** 노드의 Document 입력

## 완전한 워크플로우 구조

### 권장 구성

```
1. Form 노드 (Upload your file here)
   - 파일 업로드
   ↓
2. Extract From File 노드
   - Operation: Extract Text
   - PDF, DOCX, XLSX 등 자동 처리
   ↓
3. Split Text 노드 (Split Out)
   - Text: Extract From File 노드의 텍스트
   - Chunk Size: 1000
   - Chunk Overlap: 200
   ↓
4. Embeddings OpenAI 노드
   - Model: text-embedding-3-small
   - Text: Split Text 노드의 텍스트 청크
   - Credential: OpenAI API 키 설정
   ↓
5. Qdrant Vector Store 노드
   - Collection: possible
   - Operation: Insert Documents
   - Document 입력: Split Text 노드 연결
   - Embedding Document 입력: Embeddings OpenAI 노드 연결
   - Credential: Local QdrantApi database
```

## 연결 확인 체크리스트

### 필수 연결
- [ ] Form 노드 → Extract From File 노드
- [ ] Extract From File 노드 → Split Text 노드
- [ ] Split Text 노드 → Embeddings OpenAI 노드
- [ ] **Split Text 노드 → Qdrant Vector Store (Document 입력)** ✅
- [ ] **Embeddings OpenAI 노드 → Qdrant Vector Store (Embedding Document 입력)** ✅

### 입력 포트 확인
Qdrant Vector Store 노드에는 두 개의 입력 포트가 있습니다:
1. **메인 입력** (위쪽) - Document 데이터
2. **"Embeddi Document*" 입력** (아래쪽 다이아몬드 모양) - Embeddings 데이터

**둘 다 연결되어야 합니다!**

## 문제 해결

### 문제 1: "No node connected to required input 'Document'"

**원인:** Document 입력에 노드가 연결되지 않음

**해결:**
1. Extract From File 노드 또는 Split Text 노드를 추가
2. 해당 노드의 출력을 Qdrant Vector Store 노드의 Document 입력에 연결

### 문제 2: "No node connected to required input 'Embedding Document'"

**원인:** Embedding Document 입력에 노드가 연결되지 않음

**해결:**
1. Embeddings OpenAI 노드 추가
2. Embeddings OpenAI 노드의 출력을 Qdrant Vector Store 노드의 "Embeddi Document*" 입력에 연결

### 문제 3: 연결선이 끊어짐

**원인:** 노드 간 연결이 완전히 연결되지 않음

**해결:**
1. 연결선을 다시 드래그
2. 입력 포트와 출력 포트가 정확히 맞는지 확인
3. 연결선이 완전히 연결되었는지 시각적으로 확인

## 빠른 해결 방법

### 현재 구조에서 빠르게 수정

1. **Extract From File 노드 추가**
   - "Upload your file here"와 "Qdrant Vector Store" 사이에 추가
   - "Upload your file here" → "Extract From File" 연결
   - "Extract From File" → "Qdrant Vector Store" (Document 입력) 연결

2. **Embeddings OpenAI 노드 연결 확인**
   - "Embeddings OpenAI" 노드의 출력을 찾기
   - "Qdrant Vector Store" 노드의 "Embeddi Document*" 입력에 연결
   - 연결선이 완전히 연결되었는지 확인

3. **Split Text 노드 추가 (선택적)**
   - "Extract From File"와 "Embeddings OpenAI" 사이에 추가
   - 텍스트를 청크로 분할하여 처리

## 시각적 확인

워크플로우에서 다음을 확인하세요:

1. **Qdrant Vector Store 노드**
   - 위쪽 입력 포트에 연결선이 있는지 확인 (Document)
   - 아래쪽 다이아몬드 모양 입력 포트에 연결선이 있는지 확인 (Embedding Document)
   - 빨간색 경고 아이콘이 사라졌는지 확인

2. **모든 노드**
   - 경고 아이콘이 없는지 확인
   - 모든 필수 입력이 연결되었는지 확인

## 요약

**질문: Document에 노드를 추가해야 할까?**

**답변: 네, 두 가지 입력이 모두 필요합니다!**

1. **Document 입력**: Extract From File 노드 또는 Split Text 노드 연결
2. **Embedding Document 입력**: Embeddings OpenAI 노드 연결

**권장 워크플로우:**
```
Form → Extract From File → Split Text → Embeddings OpenAI
                                    ↓              ↓
                              Qdrant Vector Store (Document 입력)
                                    ↑
                              Qdrant Vector Store (Embedding Document 입력)
```

**빠른 해결:**
1. Extract From File 노드 추가
2. Embeddings OpenAI 노드를 Qdrant Vector Store의 "Embeddi Document*" 입력에 연결
3. Extract From File 노드를 Qdrant Vector Store의 Document 입력에 연결

