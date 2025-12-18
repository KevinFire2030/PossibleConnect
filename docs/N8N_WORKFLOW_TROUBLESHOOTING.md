# n8n 워크플로우 오류 해결 가이드

## "Problem running workflow" 오류 해결

이 오류는 워크플로우에 설정 문제가 있을 때 발생합니다. 다음 항목을 확인하세요.

## 일반적인 문제 및 해결 방법

### 1. 노드 연결 문제

**증상:**
- 노드 간 연결이 끊어져 있음
- 필수 입력이 연결되지 않음

**해결 방법:**
1. 각 노드의 입력 포트 확인
2. 모든 필수 입력(빨간색 표시)이 연결되었는지 확인
3. 연결선이 제대로 연결되었는지 확인

**확인 사항:**
- Form 노드 → Extract From File 노드 연결
- Extract From File 노드 → Split Text 노드 연결
- Split Text 노드 → Embeddings OpenAI 노드 연결
- Embeddings OpenAI 노드 → Qdrant Vector Store 노드 연결

### 2. Credential 설정 문제

**증상:**
- OpenAI API 키가 설정되지 않음
- Qdrant 연결 정보가 설정되지 않음

**해결 방법:**

#### OpenAI Credential 설정
1. **Embeddings OpenAI** 노드 선택
2. **Credential to connect with** 섹션 확인
3. **Create New Credential** 클릭 또는 기존 Credential 선택
4. OpenAI API 키 입력
5. **Save** 클릭

#### Qdrant Credential 설정
1. **Qdrant Vector Store** 노드 선택
2. **Credential to connect with** 섹션 확인
3. **Create New Credential** 클릭
4. **Credential Type**: "Local QdrantApi database" 선택
5. **Host**: `localhost`
6. **Port**: `6333`
7. **Save** 클릭

### 3. 필수 필드 누락

**증상:**
- 노드에 빨간색 경고 표시
- 필수 필드가 비어 있음

**해결 방법:**

#### Qdrant Vector Store 노드
- **Qdrant Collection**: `possible` 입력 또는 목록에서 선택
- **Operation Mode**: `Insert Documents` 또는 `Query Documents` 선택
- **Embedding Document**: Embeddings 노드와 연결 확인

#### Embeddings OpenAI 노드
- **Model**: `text-embedding-3-small` 선택
- **Text**: 이전 노드에서 텍스트 데이터 연결 확인

### 4. Collection 이름 불일치

**증상:**
- Qdrant에 Collection이 없음
- Collection 이름이 다름

**해결 방법:**
1. Qdrant Dashboard에서 Collection 확인
   - `http://localhost:6333/dashboard#/collections`
   - `possible` Collection이 존재하는지 확인
2. Qdrant Vector Store 노드의 **Qdrant Collection** 필드 확인
   - 정확히 `possible`로 입력 또는 목록에서 선택

### 5. 노드 설정 오류

**증상:**
- 특정 노드에 경고 아이콘 표시
- 노드 실행 시 오류 발생

**해결 방법:**

#### Form 노드
- **Form Title**: 입력 확인
- **Form Elements**: 파일 업로드 필드 설정 확인
- **Accepted File Types**: `.pdf,.csv,.doc,.md,.xlsx` 확인

#### Extract From File 노드
- **Operation**: `Extract Text` 선택
- 입력 데이터가 올바른지 확인

#### Split Text 노드
- **Text**: 이전 노드에서 텍스트 데이터 연결 확인
- **Chunk Size**: `1000` 설정
- **Chunk Overlap**: `200` 설정

## 단계별 확인 체크리스트

### 1단계: 노드 연결 확인
- [ ] Form 노드가 Extract From File 노드에 연결됨
- [ ] Extract From File 노드가 Split Text 노드에 연결됨
- [ ] Split Text 노드가 Embeddings OpenAI 노드에 연결됨
- [ ] Embeddings OpenAI 노드가 Qdrant Vector Store 노드에 연결됨

### 2단계: Credential 설정 확인
- [ ] OpenAI API 키가 설정됨
- [ ] Qdrant 연결 정보가 설정됨 (localhost:6333)

### 3단계: 노드 설정 확인
- [ ] Form 노드: 파일 업로드 필드 설정됨
- [ ] Extract From File 노드: Operation이 "Extract Text"로 설정됨
- [ ] Split Text 노드: Text 필드가 연결됨
- [ ] Embeddings OpenAI 노드: Model이 "text-embedding-3-small"로 설정됨
- [ ] Qdrant Vector Store 노드: Collection이 "possible"로 설정됨

### 4단계: Qdrant Collection 확인
- [ ] Qdrant Dashboard에서 `possible` Collection이 존재함
- [ ] Collection의 Vector Size가 1536으로 설정됨
- [ ] Collection의 Distance가 Cosine으로 설정됨

## 일반적인 오류 메시지 및 해결

### "Collection not found"
**원인:** Qdrant에 Collection이 없음
**해결:**
1. Qdrant Dashboard에서 Collection 생성
2. 또는 HTTP API로 Collection 생성:
```bash
curl -X PUT http://localhost:6333/collections/possible \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'
```

### "Invalid API key"
**원인:** OpenAI API 키가 잘못되었거나 설정되지 않음
**해결:**
1. OpenAI Platform에서 API 키 확인
2. n8n Credential에서 올바른 키 입력
3. Credential이 올바른 노드에 연결되었는지 확인

### "Connection refused"
**원인:** Qdrant 서버가 실행되지 않음
**해결:**
1. Qdrant Docker 컨테이너가 실행 중인지 확인:
```bash
docker ps | grep qdrant
```
2. Qdrant 상태 확인:
```bash
curl http://localhost:6333/health
```
3. Qdrant가 실행되지 않았다면 시작:
```bash
docker-compose up -d
```

### "Vector dimension mismatch"
**원인:** Collection의 벡터 크기와 임베딩 차원이 일치하지 않음
**해결:**
1. Collection의 Vector Size 확인 (1536)
2. Embeddings OpenAI 노드의 Model 확인 (text-embedding-3-small는 1536차원)
3. 일치하지 않으면 Collection 재생성 또는 Model 변경

## 워크플로우 테스트 방법

### 1. 각 노드 개별 테스트
1. 노드를 하나씩 선택
2. **Execute step** 버튼 클릭
3. 오류 메시지 확인
4. 문제 해결 후 다음 노드 테스트

### 2. 전체 워크플로우 테스트
1. Form 노드에서 테스트 파일 업로드
2. 각 노드의 출력 확인
3. 최종 결과 확인

## 권장 워크플로우 구조

### Load Data Flow (정상 구성)

```
1. Form 노드
   - Form Title: "Upload your data to test RAG"
   - Form Elements: File upload field
   - Accepted File Types: .pdf,.csv,.doc,.md,.xlsx
   ↓
2. Extract From File 노드
   - Operation: Extract Text
   - Input: Form 노드의 파일 데이터
   ↓
3. Split Text 노드
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
   - Embedding Document: Embeddings OpenAI 노드 연결
   - Credential: Local QdrantApi database (localhost:6333)
```

## 빠른 해결 체크리스트

워크플로우 오류 발생 시 다음을 순서대로 확인:

1. **노드 연결 확인**
   - 모든 노드가 올바르게 연결되었는지 확인

2. **Credential 설정 확인**
   - OpenAI API 키 설정
   - Qdrant 연결 정보 설정

3. **필수 필드 확인**
   - 모든 필수 필드가 채워졌는지 확인
   - 빨간색 경고 표시 확인

4. **Collection 확인**
   - Qdrant에 `possible` Collection이 존재하는지 확인

5. **Qdrant 서버 확인**
   - Qdrant가 실행 중인지 확인
   - `curl http://localhost:6333/health` 테스트

6. **노드별 테스트**
   - 각 노드를 개별적으로 테스트
   - 오류가 발생하는 노드 확인

## 추가 도움말

### n8n 로그 확인
- n8n 실행 터미널에서 오류 메시지 확인
- 브라우저 개발자 도구(F12)에서 네트워크 오류 확인

### n8n 문서 참고
- [n8n 공식 문서](https://docs.n8n.io/)
- [Qdrant 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.qdrant/)
- [OpenAI 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/)

## 요약

**"Problem running workflow" 오류 해결 순서:**

1. ✅ 노드 연결 확인
2. ✅ Credential 설정 확인
3. ✅ 필수 필드 확인
4. ✅ Collection 확인
5. ✅ Qdrant 서버 확인
6. ✅ 노드별 테스트

**가장 흔한 원인:**
- Credential 미설정
- Collection 이름 불일치
- 노드 연결 문제
- 필수 필드 누락

