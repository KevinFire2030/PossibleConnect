# n8n + PostgreSQL RAG 구현 가이드

## 개요
n8n과 로컬 Docker PostgreSQL을 사용하여 RAG(Retrieval-Augmented Generation) 시스템을 구현하는 방법입니다.

## 1. PostgreSQL pgvector 확장 설치

### Docker Compose 예시
```yaml
version: '3.8'
services:
  postgres:
    image: pgvector/pgvector:pg16
    environment:
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: your_database
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 또는 기존 PostgreSQL에 확장 설치
```sql
-- pgvector 확장 설치
CREATE EXTENSION IF NOT EXISTS vector;
```

## 2. 데이터베이스 스키마 추가

### 벡터 임베딩 저장 테이블 생성
```sql
-- 문서 임베딩 테이블
CREATE TABLE IF NOT EXISTS "DocumentEmbedding" (
  "id" uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  "documentId" uuid NOT NULL,
  "documentCreatedAt" timestamp NOT NULL,
  "chunkText" text NOT NULL,
  "embedding" vector(1536), -- OpenAI text-embedding-3-small: 1536차원
  "chunkIndex" integer NOT NULL,
  "createdAt" timestamp DEFAULT NOW() NOT NULL,
  FOREIGN KEY ("documentId", "documentCreatedAt") 
    REFERENCES "Document"("id", "createdAt") ON DELETE CASCADE
);

-- 벡터 검색을 위한 인덱스 생성 (HNSW 알고리즘 사용)
CREATE INDEX IF NOT EXISTS "DocumentEmbedding_embedding_idx" 
ON "DocumentEmbedding" 
USING hnsw ("embedding" vector_cosine_ops);

-- 또는 IVFFlat 인덱스 (더 빠른 생성, 약간 느린 검색)
-- CREATE INDEX IF NOT EXISTS "DocumentEmbedding_embedding_idx" 
-- ON "DocumentEmbedding" 
-- USING ivfflat ("embedding" vector_cosine_ops) 
-- WITH (lists = 100);
```

## 3. n8n 워크플로우 구성

### 워크플로우 구조
1. **Webhook 노드** - 사용자 쿼리 수신
2. **OpenAI 노드** - 쿼리를 임베딩으로 변환
3. **PostgreSQL 노드** - 벡터 유사도 검색
4. **PostgreSQL 노드** - 관련 문서 조회
5. **OpenAI 노드** - 컨텍스트와 함께 LLM 호출
6. **Respond to Webhook 노드** - 응답 반환

### n8n 워크플로우 JSON 예시
```json
{
  "name": "RAG Workflow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "rag-query",
        "responseMode": "responseNode"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300]
    },
    {
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.body.query }}"
      },
      "name": "Create Query Embedding",
      "type": "n8n-nodes-base.openAi",
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT de.\"documentId\", de.\"documentCreatedAt\", de.\"chunkText\", de.\"chunkIndex\", 1 - (de.embedding <=> $1::vector) as similarity FROM \"DocumentEmbedding\" de ORDER BY de.embedding <=> $1::vector LIMIT 5",
        "additionalFields": {
          "queryParameters": "={{ JSON.stringify([$json.data[0].embedding]) }}"
        }
      },
      "name": "Vector Search",
      "type": "n8n-nodes-base.postgres",
      "position": [650, 300],
      "credentials": {
        "postgres": {
          "id": "your-postgres-credential-id",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "SELECT d.id, d.title, d.content, d.\"createdAt\" FROM \"Document\" d WHERE d.id = $1 AND d.\"createdAt\" = $2",
        "additionalFields": {
          "queryParameters": "={{ JSON.stringify([$json.documentId, $json.documentCreatedAt]) }}"
        }
      },
      "name": "Get Document",
      "type": "n8n-nodes-base.postgres",
      "position": [850, 300],
      "credentials": {
        "postgres": {
          "id": "your-postgres-credential-id",
          "name": "PostgreSQL"
        }
      }
    },
    {
      "parameters": {
        "operation": "chat",
        "model": "gpt-4o",
        "messages": {
          "values": [
            {
              "role": "system",
              "content": "You are a helpful assistant. Use the following context to answer the user's question. If the context doesn't contain relevant information, say so."
            },
            {
              "role": "user",
              "content": "Context:\n{{ $json.content }}\n\nQuestion: {{ $('Webhook').item.json.body.query }}\n\nAnswer:"
            }
          ]
        }
      },
      "name": "Generate Response",
      "type": "n8n-nodes-base.openAi",
      "position": [1050, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"response\": $json.choices[0].message.content, \"sources\": $('Get Document').all() } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1250, 300]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [[{ "node": "Create Query Embedding", "type": "main", "index": 0 }]]
    },
    "Create Query Embedding": {
      "main": [[{ "node": "Vector Search", "type": "main", "index": 0 }]]
    },
    "Vector Search": {
      "main": [[{ "node": "Get Document", "type": "main", "index": 0 }]]
    },
    "Get Document": {
      "main": [[{ "node": "Generate Response", "type": "main", "index": 0 }]]
    },
    "Generate Response": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

## 4. 문서 임베딩 생성 워크플로우

문서를 저장할 때 자동으로 임베딩을 생성하는 워크플로우:

```json
{
  "name": "Document Embedding Generator",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "embed-document"
      },
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook"
    },
    {
      "parameters": {
        "operation": "splitText",
        "text": "={{ $json.body.content }}",
        "options": {
          "chunkSize": 1000,
          "chunkOverlap": 200
        }
      },
      "name": "Split Text",
      "type": "n8n-nodes-base.splitOut"
    },
    {
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.text }}"
      },
      "name": "Create Embedding",
      "type": "n8n-nodes-base.openAi"
    },
    {
      "parameters": {
        "operation": "executeQuery",
        "query": "INSERT INTO \"DocumentEmbedding\" (\"documentId\", \"documentCreatedAt\", \"chunkText\", \"embedding\", \"chunkIndex\") VALUES ($1, $2, $3, $4::vector, $5)",
        "additionalFields": {
          "queryParameters": "={{ JSON.stringify([$('Webhook').item.json.body.documentId, $('Webhook').item.json.body.documentCreatedAt, $json.text, $json.data[0].embedding, $json.index]) }}"
        }
      },
      "name": "Save Embedding",
      "type": "n8n-nodes-base.postgres"
    }
  ]
}
```

## 5. n8n 웹훅 URL 설정

`.env.local` 파일에 n8n 웹훅 URL을 설정:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/rag-query
USE_N8N=true
```

## 6. 사용 방법

### 문서 임베딩 생성
```bash
curl -X POST http://localhost:5678/webhook/embed-document \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "your-document-id",
    "documentCreatedAt": "2024-01-01T00:00:00Z",
    "content": "Your document content here..."
  }'
```

### RAG 쿼리 실행
```bash
curl -X POST http://localhost:5678/webhook/rag-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the document?"
  }'
```

## 7. 성능 최적화

### 인덱스 튜닝
- **HNSW 인덱스**: 빠른 검색, 느린 인덱스 생성
- **IVFFlat 인덱스**: 빠른 인덱스 생성, 약간 느린 검색

### 벡터 차원
- OpenAI `text-embedding-3-small`: 1536차원
- OpenAI `text-embedding-3-large`: 3072차원
- OpenAI `text-embedding-ada-002`: 1536차원

### 검색 파라미터
```sql
-- 유사도 임계값 설정
SELECT * FROM "DocumentEmbedding" 
WHERE 1 - (embedding <=> $1::vector) > 0.7  -- 70% 이상 유사도
ORDER BY embedding <=> $1::vector 
LIMIT 5;
```

## 8. 트러블슈팅

### pgvector 확장이 설치되지 않은 경우
```sql
-- 확장 확인
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 확장 설치
CREATE EXTENSION vector;
```

### 벡터 차원 불일치
임베딩 모델과 데이터베이스 스키마의 벡터 차원이 일치해야 합니다.

### 인덱스가 작동하지 않는 경우
```sql
-- 인덱스 재생성
DROP INDEX IF EXISTS "DocumentEmbedding_embedding_idx";
CREATE INDEX "DocumentEmbedding_embedding_idx" 
ON "DocumentEmbedding" 
USING hnsw ("embedding" vector_cosine_ops);
```

## 참고 자료
- [pgvector 공식 문서](https://github.com/pgvector/pgvector)
- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI Embeddings 가이드](https://platform.openai.com/docs/guides/embeddings)

