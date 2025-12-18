# n8n Default Data Loader 노드 가이드

## Default Data Loader란?

**Default Data Loader**는 n8n의 RAG 템플릿에서 제공하는 **통합 노드**입니다. 여러 단계를 하나로 통합하여 파일 처리 과정을 간소화합니다.

## 역할

### Default Data Loader가 하는 일

1. ✅ **파일 로드** - 업로드된 파일을 읽음
2. ✅ **텍스트 추출** - 파일에서 텍스트를 자동으로 추출 (PDF, DOCX, XLSX 등)
3. ✅ **텍스트 분할** - 텍스트를 청크로 자동 분할
4. ✅ **데이터 포맷 변환** - 벡터 스토어에 적합한 형식으로 변환

### 기존 노드와의 비교

**기존 방법 (수동 구성):**
```
Form → Extract From File → Split Text → Embeddings → Qdrant
```

**Default Data Loader 사용 (간소화):**
```
Form → Default Data Loader → Embeddings → Qdrant
```

## 워크플로우 구조

### RAG Starter Template 구조

```
1. Upload your file here (Form 노드)
   ↓
2. Insert Data to Store (Qdrant Vector Store 노드)
   ↓
3. Default Data Loader 노드
   - Document 입력: Insert Data to Store에서 받음
   - 파일 로드, 텍스트 추출, 분할 자동 처리
   ↓
4. Embeddings OpenAI 노드
   - Embeddings 입력: Default Data Loader에서 받음
   ↓
5. Insert Data to Store (Qdrant Vector Store 노드)
   - Embedding Document 입력: Embeddings OpenAI에서 받음
```

## Default Data Loader 설정

### 주요 설정 옵션

#### 1. Type of Data
- **Binary**: 바이너리 파일 (PDF, DOCX, XLSX 등)
- **Text**: 텍스트 파일
- **JSON**: JSON 파일

**권장:** `Binary` (대부분의 문서 파일)

#### 2. Mode
- **Load All Input Data**: 모든 입력 데이터 로드
- **Load Single Item**: 단일 항목만 로드

**권장:** `Load All Input Data`

#### 3. Data Format
- **Automatically Detect by Mime Type**: MIME 타입으로 자동 감지 ✅ **권장**
- **PDF**: PDF 전용
- **DOCX**: Word 전용
- **XLSX**: Excel 전용
- **CSV**: CSV 전용
- **Text**: 텍스트 전용

**권장:** `Automatically Detect by Mime Type`
- PDF, DOCX, XLSX, CSV, MD 등 자동 감지
- 별도 설정 불필요

#### 4. Text Splitting
- **Simple**: 간단한 분할 (기본값)
- **Recursive**: 재귀적 분할 (더 정교함)
- **Custom**: 사용자 정의

**권장:** `Simple` (시작 시)
- 필요시 `Recursive`로 변경 가능

### 고급 옵션

#### Chunk Size (Text Splitting이 Simple일 때)
- 기본값: 1000
- 조정 가능

#### Chunk Overlap (Text Splitting이 Simple일 때)
- 기본값: 200
- 조정 가능

## 장점

### 1. 간소화된 워크플로우
- ✅ 여러 노드 대신 하나의 노드로 처리
- ✅ 설정이 간단함
- ✅ 연결이 단순함

### 2. 자동 처리
- ✅ 파일 타입 자동 감지
- ✅ 텍스트 추출 자동 처리
- ✅ 텍스트 분할 자동 처리

### 3. RAG 템플릿 최적화
- ✅ RAG 시스템에 최적화된 설정
- ✅ 벡터 스토어와 호환되는 형식

## 단점

### 1. 세밀한 제어 제한
- ❌ 개별 단계별 세밀한 제어가 어려움
- ❌ 복잡한 커스터마이징이 제한적

### 2. 디버깅 어려움
- ❌ 각 단계별 중간 결과 확인이 어려움
- ❌ 문제 발생 시 원인 파악이 어려울 수 있음

## 사용 시나리오

### Default Data Loader 사용 권장
- ✅ RAG 템플릿 사용 시
- ✅ 간단한 파일 처리
- ✅ 빠른 프로토타이핑
- ✅ 표준적인 문서 처리

### 수동 노드 구성 권장
- ✅ 세밀한 제어가 필요한 경우
- ✅ 각 단계별 커스터마이징이 필요한 경우
- ✅ 복잡한 파일 처리 로직
- ✅ 디버깅이 중요한 경우

## 실제 설정 예시

### 기본 설정 (권장)

```
Type of Data: Binary
Mode: Load All Input Data
Data Format: Automatically Detect by Mime Type
Text Splitting: Simple
```

### 고급 설정

```
Type of Data: Binary
Mode: Load All Input Data
Data Format: Automatically Detect by Mime Type
Text Splitting: Recursive
Chunk Size: 1000
Chunk Overlap: 200
```

## 워크플로우 연결

### 올바른 연결 방법

```
1. Upload your file here
   ↓ (메인 연결)
2. Insert Data to Store (Qdrant Vector Store)
   - Operation: Insert Documents
   - Document 입력: Upload your file here에서 받음
   ↓ (Document 출력 - 점선)
3. Default Data Loader
   - Document 입력: Insert Data to Store에서 받음
   ↓ (Embeddings 출력 - 점선)
4. Embeddings OpenAI
   - Embeddings 입력: Default Data Loader에서 받음
   ↓ (Embedding 출력 - 점선)
5. Insert Data to Store (Qdrant Vector Store)
   - Embedding Document 입력: Embeddings OpenAI에서 받음
```

## 주의사항

### 1. 연결 순서
- Default Data Loader는 **Insert Data to Store 노드 다음**에 위치
- Document 출력을 Default Data Loader에 연결

### 2. Embeddings 노드 공유
- Load Data Flow와 Retriever Flow에서 **동일한 Embeddings 노드** 사용
- 다른 임베딩을 사용하면 검색이 제대로 작동하지 않음

### 3. Collection 설정
- Qdrant Collection이 올바르게 설정되었는지 확인
- Vector Size와 Distance가 올바른지 확인

## 문제 해결

### 문제 1: "No input data"
**원인:** 이전 노드가 실행되지 않음
**해결:**
1. "Execute previous nodes" 버튼 클릭
2. 또는 전체 워크플로우 실행

### 문제 2: 텍스트가 추출되지 않음
**원인:** Data Format 설정 문제
**해결:**
1. "Automatically Detect by Mime Type" 선택
2. 또는 특정 파일 타입 선택 (PDF, DOCX 등)

### 문제 3: 청크 크기가 적절하지 않음
**원인:** Text Splitting 설정 문제
**해결:**
1. Text Splitting을 "Recursive"로 변경
2. Chunk Size와 Chunk Overlap 조정

## 요약

### 질문: Default Data Loader가 Extract From File과 Split Text를 대신하나요?

**답변: 네, 맞습니다!** ✅

**Default Data Loader는:**
- ✅ Extract From File 노드의 역할 (파일 로드, 텍스트 추출)
- ✅ Split Text 노드의 역할 (텍스트 분할)
- ✅ 두 가지를 모두 자동으로 처리

**장점:**
- 간소화된 워크플로우
- 자동 파일 타입 감지
- RAG 템플릿 최적화

**사용 권장:**
- RAG 템플릿 사용 시
- 간단한 파일 처리
- 빠른 프로토타이핑

**수동 노드 구성 권장:**
- 세밀한 제어가 필요한 경우
- 복잡한 커스터마이징이 필요한 경우

## 결론

**당신의 경우:**
- ✅ **Default Data Loader 사용 권장**
- ✅ Extract From File과 Split Text 노드 불필요
- ✅ 더 간단한 워크플로우 구성 가능

**워크플로우:**
```
Form → Qdrant Vector Store → Default Data Loader → Embeddings OpenAI → Qdrant Vector Store
```

이렇게 하면 RAG 템플릿의 의도대로 간단하게 구성할 수 있습니다!

