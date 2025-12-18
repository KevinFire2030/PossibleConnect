# Qdrant Collection Use Case 선택 가이드

## Use Case 옵션 비교

### 1. Global Search (전체 검색) ✅ **RAG에 권장**

**특징:**
- 전체 컬렉션에서 검색
- 선택적 필터링 지원
- 단일 테넌트 환경에 적합

**적합한 사용 사례:**
- ✅ **RAG (Retrieval-Augmented Generation)** 시스템
- ✅ 동아리 소개, 회칙, 사업계획, FAQ 등 여러 문서를 하나의 컬렉션에 저장하고 검색
- ✅ 이커머스 검색
- ✅ 웹사이트 검색
- ✅ 지식 베이스 검색
- ✅ 문서 검색 시스템

**예시:**
```
Collection: "possible"
├── 동아리 소개 문서
├── 회칙 문서
├── 2026년 사업계획 문서
└── FAQ 문서

→ 사용자 질문: "동아리 가입 방법은?"
→ 전체 컬렉션에서 관련 문서 검색
→ AI Agent가 검색된 문서를 컨텍스트로 사용하여 답변 생성
```

### 2. Multitenancy (멀티테넌시)

**특징:**
- 여러 테넌트 간 데이터 격리
- 테넌트별 독립적인 검색
- 데이터 보안 및 프라이버시 보장

**적합한 사용 사례:**
- ✅ 사용자별 개인 문서 검색
- ✅ 조직별 문서 격리
- ✅ 채팅 히스토리 검색 (사용자별)
- ✅ SaaS 애플리케이션 (여러 고객사 데이터 분리)
- ✅ 멀티 유저 시스템에서 사용자별 데이터 격리

**예시:**
```
Collection: "possible"
├── Tenant A (조직 1)
│   ├── 문서 1
│   └── 문서 2
├── Tenant B (조직 2)
│   ├── 문서 3
│   └── 문서 4
└── Tenant C (사용자 1)
    ├── 개인 문서 1
    └── 개인 문서 2

→ Tenant A가 검색하면 Tenant A의 문서만 검색됨
→ 다른 테넌트의 데이터는 접근 불가
```

## 당신의 경우: **Global Search 선택 권장** ✅

### 사용 사례 분석

**문서 종류:**
- 동아리 소개
- 회칙
- 2026년 사업계획
- FAQ

**요구사항:**
- 여러 문서를 하나의 컬렉션에 저장
- AI Agent가 질문에 대해 관련 문서를 검색
- 검색된 문서를 컨텍스트로 사용하여 답변 생성

**결론:**
이 경우 **Global Search**가 적합합니다.

### 이유:
1. ✅ **단일 테넌트 환경**: 동아리 관련 문서들을 하나의 컬렉션으로 관리
2. ✅ **전체 검색 필요**: 사용자 질문에 대해 모든 문서에서 관련 내용 검색
3. ✅ **RAG 패턴**: 전체 컬렉션에서 유사한 문서를 검색하여 AI Agent에 제공
4. ✅ **필터링 지원**: 필요시 문서 유형(소개, 회칙, 사업계획, FAQ)으로 필터링 가능

## Collection 생성 후 설정

### 1. Global Search 선택 후 벡터 설정

**OpenAI text-embedding-3-small 사용 시:**
- **Vector Size**: `1536`
- **Distance**: `Cosine`
- **HNSW 설정**: 기본값 사용

**OpenAI text-embedding-3-large 사용 시:**
- **Vector Size**: `3072`
- **Distance**: `Cosine`
- **HNSW 설정**: 기본값 사용

### 2. 문서 업로드 구조

각 문서를 포인트로 저장할 때 payload에 문서 유형을 포함:

```json
{
  "id": 1,
  "vector": [0.1, 0.2, ...],
  "payload": {
    "text": "동아리 소개 내용...",
    "documentType": "소개",
    "title": "동아리 소개"
  }
}
```

```json
{
  "id": 2,
  "vector": [0.2, 0.3, ...],
  "payload": {
    "text": "회칙 내용...",
    "documentType": "회칙",
    "title": "회칙"
  }
}
```

### 3. 검색 시 필터링 (선택적)

필요시 특정 문서 유형만 검색:

```json
{
  "vector": [0.1, 0.2, ...],
  "limit": 5,
  "filter": {
    "must": [
      {
        "key": "documentType",
        "match": {
          "value": "FAQ"
        }
      }
    ]
  }
}
```

## n8n 워크플로우 구성

### Load Data Flow
1. **Webhook** - 문서 업로드 수신
2. **Split Text** - 문서를 청크로 분할
3. **Embeddings OpenAI** - 각 청크 임베딩 생성
4. **Qdrant Vector Store** - `possible` Collection에 저장
   - Collection: `possible`
   - Operation: Insert Documents
   - Payload에 `documentType` 포함

### Retriever Flow
1. **Webhook** - 사용자 질문 수신
2. **Embeddings OpenAI** - 질문 임베딩 생성
3. **Qdrant Vector Store** - `possible` Collection에서 검색
   - Collection: `possible`
   - Operation: Query Documents
   - 전체 컬렉션에서 검색 (필터 없음 또는 선택적 필터)
4. **AI Agent** - 검색된 문서를 컨텍스트로 사용하여 답변 생성

## 요약

**당신의 경우:**
- ✅ **Global Search 선택**
- ✅ Collection 이름: `possible`
- ✅ Vector Size: `1536` (text-embedding-3-small) 또는 `3072` (text-embedding-3-large)
- ✅ Distance: `Cosine`

**Multitenancy는 다음 경우에 선택:**
- 여러 사용자/조직 간 데이터 격리가 필요한 경우
- 사용자별 개인 문서를 분리하여 검색해야 하는 경우
- SaaS 애플리케이션처럼 테넌트별 데이터 분리가 필요한 경우

