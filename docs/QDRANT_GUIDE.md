# Qdrant Vector Store 완전 가이드

## 개요

Qdrant는 **고성능 벡터 검색을 위한 오픈 소스 벡터 데이터베이스**입니다. Rust 언어로 작성되어 높은 성능과 안정성을 제공하며, 대규모 벡터 데이터셋에서 빠른 유사성 검색을 지원합니다.

## 주요 특징

### 1. 고성능 검색
- **HNSW (Hierarchical Navigable Small World) 알고리즘** 사용
- 밀리초 단위의 빠른 벡터 검색
- 대규모 데이터셋에서도 일관된 성능 유지

### 2. 확장성
- **수평적 확장** 지원 (클러스터 모드)
- 수백만~수십억 개의 벡터 처리 가능
- 분산 환경에서도 효율적인 검색

### 3. 실시간 업데이트
- 벡터 데이터의 실시간 삽입, 업데이트, 삭제 지원
- 인덱스 재구성 없이 즉시 검색 가능

### 4. 다양한 API 지원
- **HTTP REST API** (포트 6333)
- **gRPC API** (포트 6334)
- Python, JavaScript, Go 등 다양한 언어 SDK 제공

### 5. 메타데이터 필터링
- 벡터와 함께 구조화된 메타데이터(payload) 저장
- 복잡한 필터 조건으로 검색 가능
- SQL과 유사한 쿼리 기능

## 아키텍처

### Collection (컬렉션)
- 벡터 데이터를 저장하는 논리적 단위
- 각 Collection은 독립적인 설정을 가짐
- 여러 Collection을 동시에 관리 가능

### Points (포인트)
- Collection 내의 개별 벡터 데이터
- 각 포인트는 다음을 포함:
  - **ID**: 고유 식별자
  - **Vector**: 벡터 데이터 (배열)
  - **Payload**: 메타데이터 (JSON 형식)

### Distance Metrics (거리 측정 방법)
- **Cosine**: 코사인 유사도 (텍스트 임베딩에 적합)
- **Euclidean**: 유클리드 거리
- **Dot Product**: 내적

## 설치 및 실행

### Docker로 실행
```yaml
version: '3.8'
services:
  qdrant:
    image: qdrant/qdrant:latest
    ports:
      - "6333:6333"  # HTTP API
      - "6334:6334"  # gRPC API
    volumes:
      - qdrant_storage:/qdrant/storage
    environment:
      - QDRANT__SERVICE__HTTP_PORT=6333
      - QDRANT__SERVICE__GRPC_PORT=6334

volumes:
  qdrant_storage:
```

### Docker Compose 실행
```bash
docker-compose up -d
```

### 상태 확인
```bash
curl http://localhost:6333/health
# 응답: {"status":"ok"}
```

## 기본 작업

### 1. Collection 생성

```bash
curl -X PUT http://localhost:6333/collections/documents \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'
```

**파라미터 설명:**
- `size`: 벡터 차원 수 (예: OpenAI text-embedding-3-small는 1536차원)
- `distance`: 거리 측정 방법 (Cosine, Euclidean, Dot)

### 2. 포인트 삽입

```bash
curl -X PUT http://localhost:6333/collections/documents/points \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.1, 0.2, 0.3, ...],  # 1536차원 벡터
        "payload": {
          "text": "문서 내용",
          "documentId": "doc-123",
          "chunkIndex": 0
        }
      }
    ]
  }'
```

### 3. 벡터 검색

```bash
curl -X POST http://localhost:6333/collections/documents/points/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, 0.3, ...],
    "limit": 5,
    "with_payload": true,
    "score_threshold": 0.7
  }'
```

**파라미터 설명:**
- `vector`: 검색할 쿼리 벡터
- `limit`: 반환할 최대 결과 수
- `with_payload`: 메타데이터 포함 여부
- `score_threshold`: 최소 유사도 점수 (0.0 ~ 1.0)

### 4. Collection 정보 조회

```bash
curl http://localhost:6333/collections/documents
```

### 5. Collection 통계

```bash
curl http://localhost:6333/collections/documents/stats
```

### 6. Collection 삭제

```bash
curl -X DELETE http://localhost:6333/collections/documents
```

## 고급 기능

### 1. 필터링 검색

메타데이터를 기반으로 검색 결과를 필터링할 수 있습니다:

```bash
curl -X POST http://localhost:6333/collections/documents/points/search \
  -H "Content-Type: application/json" \
  -d '{
    "vector": [0.1, 0.2, 0.3, ...],
    "limit": 5,
    "filter": {
      "must": [
        {
          "key": "documentId",
          "match": {
            "value": "doc-123"
          }
        },
        {
          "key": "category",
          "match": {
            "any": ["tech", "science"]
          }
        }
      ]
    }
  }'
```

### 2. HNSW 인덱스 설정

성능 최적화를 위한 HNSW 파라미터 조정:

```bash
curl -X PUT http://localhost:6333/collections/documents \
  -H "Content-Type: application/json" \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    },
    "hnsw_config": {
      "m": 16,
      "ef_construct": 100,
      "full_scan_threshold": 10000
    }
  }'
```

**파라미터 설명:**
- `m`: 각 노드의 최대 연결 수 (기본값: 16)
- `ef_construct`: 인덱스 구축 시 검색 범위 (기본값: 100)
- `full_scan_threshold`: 전체 스캔을 사용할 포인트 수 임계값

### 3. 배치 삽입

여러 포인트를 한 번에 삽입:

```bash
curl -X PUT http://localhost:6333/collections/documents/points \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.1, 0.2, ...],
        "payload": {"text": "첫 번째 청크"}
      },
      {
        "id": 2,
        "vector": [0.2, 0.3, ...],
        "payload": {"text": "두 번째 청크"}
      }
    ]
  }'
```

### 4. 포인트 업데이트

기존 포인트의 벡터나 메타데이터를 업데이트:

```bash
curl -X PUT http://localhost:6333/collections/documents/points \
  -H "Content-Type: application/json" \
  -d '{
    "points": [
      {
        "id": 1,
        "vector": [0.15, 0.25, ...],  # 업데이트된 벡터
        "payload": {
          "text": "업데이트된 텍스트"
        }
      }
    ]
  }'
```

### 5. 포인트 삭제

```bash
curl -X POST http://localhost:6333/collections/documents/points/delete \
  -H "Content-Type: application/json" \
  -d '{
    "points": [1, 2, 3]
  }'
```

### 6. 스크롤 (Scroll) - 전체 데이터 조회

```bash
curl -X POST http://localhost:6333/collections/documents/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 100,
    "with_payload": true,
    "with_vector": false
  }'
```

## 사용 사례

### 1. RAG (Retrieval-Augmented Generation)
- 문서 임베딩 저장 및 검색
- 컨텍스트 기반 AI 응답 생성

### 2. 추천 시스템
- 사용자 및 아이템 임베딩 저장
- 유사한 아이템 추천

### 3. 이미지 검색
- 이미지 임베딩 저장
- 유사 이미지 검색

### 4. 이상 탐지
- 정상 패턴 벡터 저장
- 이상 패턴 탐지

### 5. 의미 기반 검색
- 텍스트 의미 기반 검색
- 키워드 매칭 대신 의미 유사도 검색

## 성능 최적화 팁

### 1. 적절한 벡터 차원 선택
- 필요한 정확도와 성능의 균형 고려
- OpenAI `text-embedding-3-small` (1536차원) vs `text-embedding-3-large` (3072차원)

### 2. HNSW 파라미터 튜닝
- `m` 값 증가: 더 정확한 검색, 더 많은 메모리 사용
- `ef_construct` 값 증가: 더 나은 인덱스 품질, 더 느린 인덱스 구축

### 3. 배치 작업 활용
- 개별 삽입보다 배치 삽입이 효율적
- 한 번에 100~1000개 포인트 삽입 권장

### 4. 필터링 최적화
- 자주 사용하는 필터 조건에 인덱스 생성
- 필터 조건을 먼저 적용한 후 벡터 검색 수행

## 다른 벡터 데이터베이스와의 비교

| 특징 | Qdrant | Pinecone | Weaviate | Milvus |
|------|--------|----------|----------|--------|
| 오픈 소스 | ✅ | ❌ | ✅ | ✅ |
| 자체 호스팅 | ✅ | ❌ | ✅ | ✅ |
| 성능 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| 사용 편의성 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 확장성 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

## Python SDK 사용 예시

```python
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct

# 클라이언트 생성
client = QdrantClient(host="localhost", port=6333)

# Collection 생성
client.create_collection(
    collection_name="documents",
    vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
)

# 포인트 삽입
points = [
    PointStruct(
        id=1,
        vector=[0.1, 0.2, 0.3, ...],  # 1536차원
        payload={"text": "문서 내용", "documentId": "doc-123"}
    )
]
client.upsert(collection_name="documents", points=points)

# 검색
results = client.search(
    collection_name="documents",
    query_vector=[0.1, 0.2, 0.3, ...],
    limit=5
)
```

## JavaScript/TypeScript SDK 사용 예시

```typescript
import { QdrantClient } from '@qdrant/js-client-rest';

// 클라이언트 생성
const client = new QdrantClient({ host: 'localhost', port: 6333 });

// Collection 생성
await client.createCollection('documents', {
  vectors: {
    size: 1536,
    distance: 'Cosine'
  }
});

// 포인트 삽입
await client.upsert('documents', {
  points: [
    {
      id: 1,
      vector: [0.1, 0.2, 0.3, ...],
      payload: {
        text: '문서 내용',
        documentId: 'doc-123'
      }
    }
  ]
});

// 검색
const results = await client.search('documents', {
  vector: [0.1, 0.2, 0.3, ...],
  limit: 5
});
```

## 트러블슈팅

### 1. 연결 오류
```bash
# Qdrant 상태 확인
curl http://localhost:6333/health

# 포트 확인
netstat -an | grep 6333
```

### 2. 벡터 차원 불일치
- Collection 생성 시 설정한 `size`와 삽입하는 벡터의 차원이 일치해야 함
- 오류: `"Wrong input: expected vector dimension 1536, got 768"`

### 3. 메모리 부족
- 대규모 데이터셋의 경우 HNSW 파라미터 조정
- 또는 클러스터 모드로 수평 확장

### 4. 검색 결과가 없음
- `score_threshold` 값을 낮춰보기
- Collection에 데이터가 실제로 저장되었는지 확인
- 임베딩 모델이 일관되게 사용되었는지 확인

## 참고 자료

- [Qdrant 공식 문서](https://qdrant.tech/documentation/)
- [Qdrant HTTP API 레퍼런스](https://qdrant.github.io/qdrant/redoc/index.html)
- [Qdrant Python SDK](https://github.com/qdrant/qdrant-client)
- [Qdrant JavaScript SDK](https://github.com/qdrant/qdrant-js)
- [Qdrant GitHub](https://github.com/qdrant/qdrant)

## 결론

Qdrant는 **고성능, 확장 가능, 사용하기 쉬운** 벡터 데이터베이스로, RAG 시스템을 구축하는 데 이상적인 선택입니다. 오픈 소스이며 자체 호스팅이 가능하여 데이터 프라이버시와 비용 절감의 이점이 있습니다.

