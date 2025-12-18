# Default Data Loader에서 Markdown 파일 처리 방법

## 문제: Type of Data에 Text 옵션이 없음

### 현재 상황
- **Type of Data** 옵션: `Binary`, `JSON`만 있음
- `Text` 옵션이 없음
- Markdown 파일 처리 방법 찾기

## 해결 방법

### 방법 1: Binary + Data Format: Text (시도)

**설정:**
1. **Type of Data**: `Binary` 선택
2. **Data Format**: `Text` 선택 (가능한 경우)
3. 또는 **Data Format**: `Automatically Detect by Mime Type` 선택

**주의:**
- Binary로 선택하되, Data Format에서 Text를 명시적으로 선택
- MIME 타입 자동 감지가 실패할 수 있으므로 Text로 강제 지정

### 방법 2: Binary + Data Format: Automatically Detect (시도)

**설정:**
1. **Type of Data**: `Binary` 선택
2. **Data Format**: `Automatically Detect by Mime Type` 선택

**문제:**
- MIME 타입이 `application/octet-stream`으로 잘못 인식되면 실패
- Markdown 파일의 경우 자동 감지가 실패할 수 있음

### 방법 3: JSON 선택은 권장하지 않음 ❌

**이유:**
- ❌ JSON은 구조화된 데이터 형식
- ❌ Markdown은 일반 텍스트 파일
- ❌ JSON 파서가 Markdown을 파싱하려고 하면 오류 발생
- ❌ JSON 형식이 아니므로 파싱 실패

**결론:** JSON 선택은 **권장하지 않습니다**.

## 권장 해결 방법

### 가장 확실한 방법: Read Binary File 노드 사용

Default Data Loader 대신 **Read Binary File** 노드를 사용하는 것이 가장 확실합니다:

```
1. Form 노드 (Upload your file here)
   ↓
2. Read Binary File 노드
   - Operation: Read
   - 파일을 텍스트로 직접 읽기
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

**장점:**
- ✅ MIME 타입 문제 없음
- ✅ Markdown 파일을 확실하게 처리
- ✅ 설정이 간단함
- ✅ 안정적

### 대안: Extract From File 노드 사용

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

## Default Data Loader 설정 시도 (Binary 선택)

### 설정 방법

1. **Default Data Loader** 노드 선택
2. **Parameters** 탭
3. **Type of Data**: `Binary` 선택
4. **Data Format**: 가능한 옵션 확인
   - `Text`가 있으면 선택
   - 없으면 `Automatically Detect by Mime Type` 선택
5. **Text Splitting**: `Simple` 선택
6. 저장 후 실행

### 예상 결과

**성공 가능성:**
- ⚠️ Data Format에 `Text` 옵션이 있으면 성공 가능
- ⚠️ `Automatically Detect`만 있으면 MIME 타입 문제로 실패 가능

**실패 시:**
- Read Binary File 노드 사용 권장

## 워크플로우 수정 방법

### 현재 구조 (오류 발생)
```
Form → Qdrant Vector Store → Default Data Loader
```

### 수정된 구조 (권장)
```
Form → Read Binary File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

### 단계별 수정

1. **Default Data Loader 노드 제거 또는 우회**
   - Default Data Loader 연결 제거
   - 또는 새로운 경로 추가

2. **Read Binary File 노드 추가**
   - Form 노드와 Qdrant Vector Store 사이에 추가
   - Operation: Read

3. **Split Text 노드 추가**
   - Read Binary File 다음에 추가
   - Text: `$json.data`

4. **연결 수정**
   - Form → Read Binary File
   - Read Binary File → Split Text
   - Split Text → Embeddings OpenAI
   - Embeddings OpenAI → Qdrant Vector Store

## 파일 타입별 권장 방법

### Markdown 파일 (.md)
- ✅ **Read Binary File 노드** (가장 확실)
- ✅ **Extract From File 노드** (자동 감지)
- ⚠️ Default Data Loader (Binary + Text Format 시도)

### 텍스트 파일 (.txt)
- ✅ Read Binary File 노드
- ✅ Extract From File 노드
- ⚠️ Default Data Loader (Binary + Text Format)

### PDF 파일 (.pdf)
- ✅ Extract From File 노드
- ✅ Default Data Loader (Binary + 자동 감지)

### Word 파일 (.docx)
- ✅ Extract From File 노드
- ✅ Default Data Loader (Binary + 자동 감지)

## 요약

### 질문: JSON을 선택하면 될까?

**답변: 아니요, JSON은 권장하지 않습니다.** ❌

**이유:**
- JSON은 구조화된 데이터 형식
- Markdown은 일반 텍스트 파일
- JSON 파서가 Markdown을 파싱하려고 하면 오류 발생

### 권장 해결 방법

1. **Binary + Data Format: Text** (가능한 경우)
   - Type of Data: Binary
   - Data Format: Text 선택

2. **Read Binary File 노드 사용** (가장 확실) ✅
   - Default Data Loader 대신 사용
   - Markdown 파일을 확실하게 처리

3. **Extract From File 노드 사용** (대안)
   - 파일 타입 자동 감지
   - 텍스트 추출

### 최종 권장

**Default Data Loader가 Markdown을 처리하지 못하는 경우:**
- ✅ **Read Binary File 노드 사용**
- ✅ 가장 확실하고 안정적인 방법
- ✅ MIME 타입 문제 없음

**워크플로우:**
```
Form → Read Binary File → Split Text → Embeddings OpenAI → Qdrant Vector Store
```

이렇게 하면 Markdown 파일도 확실하게 처리됩니다!

