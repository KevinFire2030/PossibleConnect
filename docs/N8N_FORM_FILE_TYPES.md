# n8n Form 노드 파일 타입 설정 가이드

## 파일 타입 추가 방법

### 현재 설정
```
Accepted File Types: .pdf, .csv
```

### 추가할 파일 타입
- `.doc` - Microsoft Word 문서 (구버전)
- `.md` - Markdown 파일
- `.xlsx` - Microsoft Excel 파일

## 설정 방법

### 1. Form 노드에서 설정

1. **"Upload your file here"** 노드 선택
2. **Parameters** 탭에서 **Form Elements** 섹션으로 이동
3. **"Accepted File Types"** 필드 찾기
4. 기존 값 수정:

**수정 전:**
```
.pdf, .csv
```

**수정 후:**
```
.pdf, .csv, .doc, .md, .xlsx
```

또는

```
.pdf,.csv,.doc,.md,.xlsx
```

### 2. 주의사항

- **쉼표로 구분**: 각 확장자를 쉼표로 구분
- **점(.) 포함**: 확장자 앞에 점(.) 포함
- **대소문자 구분 없음**: `.doc`와 `.DOC` 모두 허용
- **공백 선택**: `.pdf, .csv` 또는 `.pdf,.csv` 모두 가능

### 3. 모든 파일 타입 허용

모든 파일 타입을 허용하려면:
- **"Accepted File Types"** 필드를 **비워두기**
- 또는 `*` 입력

## 지원되는 파일 타입 목록

### 문서 파일
- `.pdf` - PDF 문서
- `.doc` - Microsoft Word (구버전)
- `.docx` - Microsoft Word (신버전)
- `.md` - Markdown 파일
- `.txt` - 텍스트 파일
- `.rtf` - Rich Text Format

### 스프레드시트
- `.xlsx` - Microsoft Excel (신버전)
- `.xls` - Microsoft Excel (구버전)
- `.csv` - Comma Separated Values

### 기타
- `.json` - JSON 파일
- `.xml` - XML 파일
- `.html` - HTML 파일

## 실제 설정 예시

### 예시 1: 기본 문서 타입
```
.pdf, .doc, .docx, .md, .txt
```

### 예시 2: 문서 + 스프레드시트
```
.pdf, .doc, .docx, .md, .xlsx, .xls, .csv
```

### 예시 3: 당신의 경우 (권장)
```
.pdf, .csv, .doc, .md, .xlsx
```

### 예시 4: 모든 Office 문서 포함
```
.pdf, .doc, .docx, .xlsx, .xls, .csv, .md, .txt
```

## n8n에서 파일 처리 방법

### 파일 업로드 후 처리

n8n Form 노드에서 파일을 업로드하면:
1. 파일이 임시 저장소에 저장됨
2. 워크플로우에서 파일 경로 또는 바이너리 데이터로 접근 가능
3. 다음 노드에서 파일 내용 읽기 가능

### 파일 읽기 예시

**Code 노드에서 파일 읽기:**
```javascript
// PDF 파일 읽기
const fileData = $input.item.json.binary;
const fileContent = Buffer.from(fileData.data, 'base64').toString('utf-8');
```

**또는 n8n의 파일 처리 노드 사용:**
- **Read Binary File** 노드
- **Extract From File** 노드 (PDF, DOCX 등)

## 파일 타입별 처리 방법

### PDF 파일
- **Extract From File** 노드 사용
- 또는 PDF 파싱 라이브러리 사용

### Markdown 파일
- 직접 텍스트로 읽기 가능
- Markdown 파서 사용 가능

### Excel 파일 (.xlsx)
- **Microsoft Excel** 노드 사용
- 또는 Excel 파싱 라이브러리 사용

### Word 파일 (.doc, .docx)
- **Extract From File** 노드 사용
- 또는 Word 파싱 라이브러리 사용

## 워크플로우 구성 예시

### Load Data Flow

```
1. Form 노드 (Upload your file here)
   ↓
2. Extract From File 노드 (PDF, DOCX 등)
   ↓
3. Split Text 노드 (텍스트를 청크로 분할)
   ↓
4. Embeddings OpenAI 노드 (임베딩 생성)
   ↓
5. Qdrant Vector Store 노드 (벡터 저장)
```

### 파일 타입별 분기 처리

```
1. Form 노드
   ↓
2. IF 노드 (파일 확장자 확인)
   ├─ .pdf → PDF 처리 노드
   ├─ .docx → DOCX 처리 노드
   ├─ .md → 직접 텍스트 처리
   └─ .xlsx → Excel 처리 노드
   ↓
3. 텍스트 통합
   ↓
4. Split Text 노드
   ↓
5. Embeddings OpenAI 노드
   ↓
6. Qdrant Vector Store 노드
```

## 주의사항

### 파일 크기 제한
- n8n Form 노드의 기본 파일 크기 제한 확인
- 대용량 파일의 경우 추가 설정 필요

### 보안
- 업로드된 파일의 바이러스 스캔 고려
- 파일 타입 검증 (확장자만으로는 부족)

### 성능
- 대용량 파일 처리 시 시간이 걸릴 수 있음
- 파일 크기에 따라 타임아웃 설정 조정

## 권장 설정

### 당신의 경우

**Accepted File Types:**
```
.pdf, .csv, .doc, .md, .xlsx
```

**이유:**
- 동아리 문서에 필요한 모든 파일 타입 포함
- FAQ, 소개, 회칙, 사업계획 등 다양한 형식 지원

### 추가 고려사항

필요하다면 다음도 추가 가능:
- `.docx` - Word 신버전
- `.xls` - Excel 구버전
- `.txt` - 텍스트 파일

## 요약

**파일 타입 추가 방법:**
1. Form 노드의 "Accepted File Types" 필드 수정
2. 쉼표로 구분하여 확장자 추가
3. 예: `.pdf, .csv, .doc, .md, .xlsx`

**당신의 경우:**
- `.pdf, .csv, .doc, .md, .xlsx` 추가
- 모든 동아리 문서 형식 지원

**다음 단계:**
- 파일 업로드 테스트
- 각 파일 타입별 처리 워크플로우 구성
- Qdrant에 벡터 저장 확인

