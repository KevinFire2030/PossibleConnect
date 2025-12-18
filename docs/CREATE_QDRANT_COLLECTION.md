# Qdrant Collection 생성 가이드

## "possible" Collection 생성

### 방법 1: HTTP API 사용 (권장)

#### OpenAI text-embedding-3-small 사용 시 (1536차원)
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

#### OpenAI text-embedding-3-large 사용 시 (3072차원)
```bash
curl -X PUT http://localhost:6333/collections/possible \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 3072,
      "distance": "Cosine"
    }
  }'
```

#### 768차원 모델 사용 시 (기존 my_docs와 동일)
```bash
curl -X PUT http://localhost:6333/collections/possible \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 768,
      "distance": "Cosine"
    }
  }'
```

### 방법 2: Dashboard UI 사용

1. Qdrant Dashboard 접속: `http://localhost:6333/dashboard#/collections`
2. **"+ CREATE COLLECTION"** 버튼 클릭
3. Collection 이름: `possible` 입력
4. 벡터 설정:
   - **Size**: 사용할 임베딩 모델의 차원 수
     - OpenAI `text-embedding-3-small`: `1536`
     - OpenAI `text-embedding-3-large`: `3072`
     - 기타 모델: 해당 모델의 출력 차원
   - **Distance**: `Cosine` 선택 (텍스트 임베딩에 권장)
5. **Create** 버튼 클릭

### 방법 3: Python SDK 사용

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams

# 클라이언트 생성
client = QdrantClient(host="localhost", port=6333)

# Collection 생성 (1536차원 - text-embedding-3-small)
client.create_collection(
    collection_name="possible",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)
```

### 방법 4: JavaScript/TypeScript SDK 사용

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

const client = new QdrantClient({ host: 'localhost', port: 6333 });

// Collection 생성 (1536차원 - text-embedding-3-small)
await client.createCollection('possible', {
  vectors: {
    size: 1536,
    distance: 'Cosine'
  }
});
```

## Collection 확인

### HTTP API로 확인
```bash
curl http://localhost:6333/collections/possible
```

### Dashboard에서 확인
- Collections 목록에서 `possible` Collection이 표시되는지 확인
- Status가 `green` (healthy)인지 확인

## Collection 정보 조회

```bash
# Collection 상세 정보
curl http://localhost:6333/collections/possible

# Collection 통계
curl http://localhost:6333/collections/possible/stats
```

## 기존 Collection 참고

현재 Dashboard에 있는 Collection들:
- `docs_llama32_3072`: 3072차원, Cosine
- `my_docs`: 768차원, Cosine

## 권장 설정

OpenAI Embeddings를 사용하는 경우:
- **Collection 이름**: `possible`
- **Vector Size**: `1536` (text-embedding-3-small 사용 시)
- **Distance**: `Cosine`
- **HNSW 설정**: 기본값 사용 (필요시 조정)

## n8n에서 사용하기

n8n의 Qdrant Vector Store 노드에서:
1. **Qdrant Collection** 드롭다운에서 "From list" 선택
2. `possible` 입력 또는 목록에서 선택
3. **Credential to connect with**: Local QdrantApi database 설정
4. **Operation Mode**: Insert Documents 또는 Query Documents 선택

## 트러블슈팅

### Collection이 생성되지 않는 경우
- Qdrant 서버가 실행 중인지 확인: `curl http://localhost:6333/health`
- Collection 이름이 이미 존재하는지 확인
- 벡터 크기가 올바른지 확인 (양수, 적절한 범위)

### 벡터 차원 불일치 오류
- Collection 생성 시 설정한 `size`와 실제 임베딩 벡터의 차원이 일치해야 함
- 예: Collection이 1536차원으로 생성되었으면, 1536차원 벡터만 삽입 가능

