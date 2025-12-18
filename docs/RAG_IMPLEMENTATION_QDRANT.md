# n8n + Qdrant RAG 구현 가이드

## 개요
n8n과 로컬 Docker Qdrant Vector Store를 사용하여 RAG(Retrieval-Augmented Generation) 시스템을 구현하는 방법입니다. 첨부 이미지의 템플릿 구조를 따라 구현합니다.

## 1. Qdrant Docker 설치

### Docker Compose 예시
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

### Docker 실행
```bash
docker-compose up -d
```

### Qdrant 상태 확인
```bash
curl http://localhost:6333/health
```

## 2. Qdrant Collection 생성

### Collection 생성 스크립트
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

### Collection 확인
```bash
curl http://localhost:6333/collections/documents
```

## 3. n8n 워크플로우 구성

### 워크플로우 구조 (이미지 템플릿 기반)

#### Load Data Flow (데이터 로딩)
1. **File Upload 노드** - 파일 업로드
2. **Text Splitter 노드** - 문서를 청크로 분할
3. **OpenAI Embeddings 노드** - 각 청크를 임베딩으로 변환
4. **HTTP Request 노드** - Qdrant에 벡터 저장

#### Retriever Flow (검색 및 응답 생성)
1. **When Chat Message Received 노드** - 채팅 메시지 수신
2. **OpenAI Embeddings 노드** - 쿼리를 임베딩으로 변환
3. **HTTP Request 노드** - Qdrant에서 유사 벡터 검색
4. **AI Agent 노드** - 컨텍스트와 함께 LLM 호출
5. **Respond to Webhook 노드** - 응답 반환

### Load Data Flow 워크플로우 JSON

```json
{
  "name": "Load Data Flow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "load-data",
        "responseMode": "responseNode"
      },
      "name": "Upload your file here",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "load-data-webhook"
    },
    {
      "parameters": {
        "operation": "splitText",
        "text": "={{ $json.body.content || $json.body.text }}",
        "options": {
          "chunkSize": 1000,
          "chunkOverlap": 200
        }
      },
      "name": "Split Text into Chunks",
      "type": "n8n-nodes-base.splitOut",
      "position": [450, 300]
    },
    {
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.text }}"
      },
      "name": "Embeddings OpenAI",
      "type": "n8n-nodes-base.openAi",
      "position": [650, 300],
      "credentials": {
        "openAiApi": {
          "id": "your-openai-credential-id",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "method": "PUT",
        "url": "http://localhost:6333/collections/documents/points",
        "authentication": "none",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "bodyParameters": {
          "parameters": []
        },
        "specifyBody": "json",
        "jsonBody": "={\n  \"points\": [{\n    \"id\": \"{{ $json.index }}\",\n    \"vector\": {{ $json.data[0].embedding }},\n    \"payload\": {\n      \"text\": \"{{ $json.text }}\",\n      \"documentId\": \"{{ $('Upload your file here').item.json.body.documentId || 'default' }}\",\n      \"chunkIndex\": {{ $json.index }}\n    }\n  }]\n}",
        "options": {}
      },
      "name": "Insert Data to Store",
      "type": "n8n-nodes-base.httpRequest",
      "position": [850, 300]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"message\": \"Data loaded successfully\" } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "Upload your file here": {
      "main": [[{ "node": "Split Text into Chunks", "type": "main", "index": 0 }]]
    },
    "Split Text into Chunks": {
      "main": [[{ "node": "Embeddings OpenAI", "type": "main", "index": 0 }]]
    },
    "Embeddings OpenAI": {
      "main": [[{ "node": "Insert Data to Store", "type": "main", "index": 0 }]]
    },
    "Insert Data to Store": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

### Retriever Flow 워크플로우 JSON

```json
{
  "name": "Retriever Flow",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chat-query",
        "responseMode": "responseNode"
      },
      "name": "When chat message received",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "webhookId": "chat-query-webhook"
    },
    {
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.body.query || $json.body.message }}"
      },
      "name": "Embeddings OpenAI",
      "type": "n8n-nodes-base.openAi",
      "position": [450, 300],
      "credentials": {
        "openAiApi": {
          "id": "your-openai-credential-id",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:6333/collections/documents/points/search",
        "authentication": "none",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"vector\": {{ $json.data[0].embedding }},\n  \"limit\": 5,\n  \"with_payload\": true,\n  \"score_threshold\": 0.7\n}",
        "options": {}
      },
      "name": "Query Data Tool",
      "type": "n8n-nodes-base.httpRequest",
      "position": [650, 300]
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
              "content": "=Context:\n{{ $('Query Data Tool').all().map(item => item.json.result.map(r => r.payload.text).join('\\n\\n')).join('\\n\\n') }}\n\nQuestion: {{ $('When chat message received').item.json.body.query || $('When chat message received').item.json.body.message }}\n\nAnswer:"
            }
          ]
        }
      },
      "name": "AI Agent",
      "type": "n8n-nodes-base.openAi",
      "position": [850, 300],
      "credentials": {
        "openAiApi": {
          "id": "your-openai-credential-id",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"response\": $json.choices[0].message.content, \"sources\": $('Query Data Tool').item.json.result } }}"
      },
      "name": "Respond to Webhook",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1050, 300]
    }
  ],
  "connections": {
    "When chat message received": {
      "main": [[{ "node": "Embeddings OpenAI", "type": "main", "index": 0 }]]
    },
    "Embeddings OpenAI": {
      "main": [[{ "node": "Query Data Tool", "type": "main", "index": 0 }]]
    },
    "Query Data Tool": {
      "main": [[{ "node": "AI Agent", "type": "main", "index": 0 }]]
    },
    "AI Agent": {
      "main": [[{ "node": "Respond to Webhook", "type": "main", "index": 0 }]]
    }
  }
}
```

## 4. 통합 워크플로우 (Load Data + Retriever)

두 플로우를 하나의 워크플로우로 통합하여 Embeddings 노드를 공유:

```json
{
  "name": "RAG Workflow with Qdrant",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "load-data",
        "responseMode": "responseNode"
      },
      "name": "Upload your file here",
      "type": "n8n-nodes-base.webhook",
      "position": [100, 200]
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "chat-query",
        "responseMode": "responseNode"
      },
      "name": "When chat message received",
      "type": "n8n-nodes-base.webhook",
      "position": [100, 500]
    },
    {
      "parameters": {
        "operation": "splitText",
        "text": "={{ $json.body.content || $json.body.text }}",
        "options": {
          "chunkSize": 1000,
          "chunkOverlap": 200
        }
      },
      "name": "Split Text",
      "type": "n8n-nodes-base.splitOut",
      "position": [300, 200]
    },
    {
      "parameters": {
        "operation": "createEmbedding",
        "model": "text-embedding-3-small",
        "text": "={{ $json.text || $json.body.query || $json.body.message }}"
      },
      "name": "Embeddings OpenAI",
      "type": "n8n-nodes-base.openAi",
      "position": [500, 350],
      "credentials": {
        "openAiApi": {
          "id": "your-openai-credential-id",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "method": "PUT",
        "url": "http://localhost:6333/collections/documents/points",
        "authentication": "none",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"points\": [{\n    \"id\": \"{{ $json.index || Math.random().toString(36).substring(7) }}\",\n    \"vector\": {{ $json.data[0].embedding }},\n    \"payload\": {\n      \"text\": \"{{ $json.text }}\",\n      \"documentId\": \"{{ $('Upload your file here').item.json.body.documentId || 'default' }}\",\n      \"chunkIndex\": {{ $json.index || 0 }}\n    }\n  }]\n}",
        "options": {}
      },
      "name": "Insert Data to Store",
      "type": "n8n-nodes-base.httpRequest",
      "position": [700, 200]
    },
    {
      "parameters": {
        "method": "POST",
        "url": "http://localhost:6333/collections/documents/points/search",
        "authentication": "none",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={\n  \"vector\": {{ $json.data[0].embedding }},\n  \"limit\": 5,\n  \"with_payload\": true,\n  \"score_threshold\": 0.7\n}",
        "options": {}
      },
      "name": "Query Data Tool",
      "type": "n8n-nodes-base.httpRequest",
      "position": [700, 500]
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
              "content": "=Context:\n{{ $('Query Data Tool').all().map(item => item.json.result.map(r => r.payload.text).join('\\n\\n')).join('\\n\\n') }}\n\nQuestion: {{ $('When chat message received').item.json.body.query || $('When chat message received').item.json.body.message }}\n\nAnswer:"
            }
          ]
        }
      },
      "name": "AI Agent",
      "type": "n8n-nodes-base.openAi",
      "position": [900, 500],
      "credentials": {
        "openAiApi": {
          "id": "your-openai-credential-id",
          "name": "OpenAI API"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"success\": true, \"message\": \"Data loaded successfully\" } }}"
      },
      "name": "Respond to Load Data",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [900, 200]
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ { \"response\": $json.choices[0].message.content, \"sources\": $('Query Data Tool').item.json.result } }}"
      },
      "name": "Respond to Chat",
      "type": "n8n-nodes-base.respondToWebhook",
      "position": [1100, 500]
    }
  ],
  "connections": {
    "Upload your file here": {
      "main": [[{ "node": "Split Text", "type": "main", "index": 0 }]]
    },
    "Split Text": {
      "main": [[{ "node": "Embeddings OpenAI", "type": "main", "index": 0 }]]
    },
    "Embeddings OpenAI": {
      "main": [
        [{ "node": "Insert Data to Store", "type": "main", "index": 0 }],
        [{ "node": "Query Data Tool", "type": "main", "index": 0 }]
      ]
    },
    "Insert Data to Store": {
      "main": [[{ "node": "Respond to Load Data", "type": "main", "index": 0 }]]
    },
    "When chat message received": {
      "main": [[{ "node": "Embeddings OpenAI", "type": "main", "index": 0 }]]
    },
    "Query Data Tool": {
      "main": [[{ "node": "AI Agent", "type": "main", "index": 0 }]]
    },
    "AI Agent": {
      "main": [[{ "node": "Respond to Chat", "type": "main", "index": 0 }]]
    }
  }
}
```

## 5. n8n 웹훅 URL 설정

`.env.local` 파일에 n8n 웹훅 URL을 설정:

```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/chat-query
USE_N8N=true
```

## 6. 사용 방법

### 문서 로딩 (Load Data Flow)
```bash
curl -X POST http://localhost:5678/webhook/load-data \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "doc-123",
    "content": "Your document content here. This will be split into chunks and embedded..."
  }'
```

### RAG 쿼리 실행 (Retriever Flow)
```bash
curl -X POST http://localhost:5678/webhook/chat-query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic of the document?",
    "message": "What is the main topic of the document?"
  }'
```

## 7. Qdrant Collection 관리

### Collection 정보 조회
```bash
curl http://localhost:6333/collections/documents
```

### Collection 통계 조회
```bash
curl http://localhost:6333/collections/documents/stats
```

### Collection 삭제
```bash
curl -X DELETE http://localhost:6333/collections/documents
```

### 특정 포인트 조회
```bash
curl -X POST http://localhost:6333/collections/documents/points/scroll \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 10
  }'
```

## 8. 성능 최적화

### 벡터 차원 설정
- OpenAI `text-embedding-3-small`: 1536차원
- OpenAI `text-embedding-3-large`: 3072차원
- OpenAI `text-embedding-ada-002`: 1536차원

Collection 생성 시 벡터 크기를 올바르게 설정해야 합니다:
```json
{
  "vectors": {
    "size": 1536,
    "distance": "Cosine"
  }
}
```

### 검색 파라미터 튜닝
```json
{
  "vector": [0.1, 0.2, ...],
  "limit": 5,
  "with_payload": true,
  "score_threshold": 0.7,
  "filter": {
    "must": [
      {
        "key": "documentId",
        "match": {
          "value": "doc-123"
        }
      }
    ]
  }
}
```

### HNSW 인덱스 설정
Collection 생성 시 HNSW 파라미터를 조정할 수 있습니다:
```json
{
  "vectors": {
    "size": 1536,
    "distance": "Cosine"
  },
  "hnsw_config": {
    "m": 16,
    "ef_construct": 100
  }
}
```

## 9. 트러블슈팅

### Qdrant 연결 확인
```bash
# Health check
curl http://localhost:6333/health

# Collection 목록 확인
curl http://localhost:6333/collections
```

### 벡터 차원 불일치
임베딩 모델과 Qdrant Collection의 벡터 차원이 일치해야 합니다. Collection을 재생성하거나 벡터 크기를 확인하세요.

### 포인트 저장 실패
- 포인트 ID가 중복되지 않는지 확인
- 벡터 배열의 길이가 Collection 설정과 일치하는지 확인
- JSON 형식이 올바른지 확인

### 검색 결과가 없는 경우
- `score_threshold` 값을 낮춰보세요 (기본값: 0.7)
- Collection에 데이터가 실제로 저장되었는지 확인
- 임베딩 모델이 동일한지 확인 (Load와 Retrieve 모두 동일한 모델 사용)

## 10. 중요 사항

### Embeddings 노드 공유
이미지 템플릿에서 강조한 것처럼, **Load Data Flow와 Retriever Flow는 반드시 동일한 Embeddings 노드를 사용해야 합니다**. 다른 임베딩 모델이나 설정을 사용하면 검색이 제대로 작동하지 않을 수 있습니다.

### 동일한 임베딩 모델 사용
- Load Data Flow: `text-embedding-3-small` 사용
- Retriever Flow: `text-embedding-3-small` 사용 (동일한 모델)

### 벡터 차원 일치
- Collection 생성 시: `size: 1536`
- 임베딩 생성 시: `text-embedding-3-small` (1536차원)

## 참고 자료
- [Qdrant 공식 문서](https://qdrant.tech/documentation/)
- [Qdrant HTTP API](https://qdrant.github.io/qdrant/redoc/index.html)
- [n8n 공식 문서](https://docs.n8n.io/)
- [OpenAI Embeddings 가이드](https://platform.openai.com/docs/guides/embeddings)
- [n8n RAG 템플릿](https://docs.n8n.io/integrations/builtin/workflows/rag/)

