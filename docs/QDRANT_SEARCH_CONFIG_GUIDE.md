# Qdrant Search Configuration 가이드

## "What to use for search?" 옵션 비교

### 1. Simple Single embedding ✅ **RAG에 권장**

**특징:**
- 가장 간단한 구성
- 문서당 하나의 벡터 필드만 사용
- 의미 기반 검색 (Semantic Search)
- OpenAI Embeddings와 완벽하게 호환

**구조:**
```
Document
└── Vector (1536차원 또는 3072차원)
    └── 의미 기반 검색만 수행
```

**장점:**
- ✅ 설정이 간단함
- ✅ OpenAI Embeddings와 직접 호환
- ✅ 빠른 검색 성능
- ✅ RAG 시스템에 최적화
- ✅ 유지보수가 쉬움

**단점:**
- ❌ 키워드 기반 검색은 제한적
- ❌ 정확한 키워드 매칭이 어려울 수 있음

**적합한 사용 사례:**
- ✅ **RAG (Retrieval-Augmented Generation)** 시스템
- ✅ 의미 기반 문서 검색
- ✅ 유사한 의미의 문서 찾기
- ✅ OpenAI Embeddings 사용
- ✅ 동아리 소개, 회칙, 사업계획, FAQ 검색 (당신의 경우)

### 2. Simple Hybrid Search

**특징:**
- Dense 벡터 (의미 기반) + Sparse 벡터 (키워드 기반) 동시 검색
- 의미 검색과 키워드 검색을 결합
- 더 정확한 검색 결과

**구조:**
```
Document
├── Dense Vector (의미 기반)
│   └── OpenAI Embeddings
└── Sparse Vector (키워드 기반)
    └── BM25, TF-IDF 등
```

**장점:**
- ✅ 의미 검색 + 키워드 검색 결합
- ✅ 정확한 키워드 매칭 가능
- ✅ 더 정확한 검색 결과

**단점:**
- ❌ 설정이 복잡함
- ❌ 두 가지 벡터를 모두 생성해야 함
- ❌ 저장 공간이 더 필요함
- ❌ 검색 시간이 약간 더 걸릴 수 있음

**적합한 사용 사례:**
- ✅ 키워드 매칭이 중요한 경우
- ✅ 제품명, 코드명 등 정확한 매칭이 필요한 경우
- ✅ 의미 검색과 키워드 검색을 모두 활용하고 싶은 경우
- ✅ 검색 정확도가 매우 중요한 경우

### 3. Custom

**특징:**
- 사용자 정의 구성
- 완전한 제어 가능
- 고급 사용자를 위한 옵션

**구조:**
```
사용자가 직접 정의
- 여러 벡터 필드
- 다양한 거리 측정 방법
- 복잡한 인덱스 설정
```

**장점:**
- ✅ 완전한 커스터마이징
- ✅ 특수한 요구사항에 맞춤 설정 가능

**단점:**
- ❌ 설정이 매우 복잡함
- ❌ 전문 지식 필요
- ❌ 초기 설정 시간이 오래 걸림

**적합한 사용 사례:**
- ✅ 특수한 벡터 구성이 필요한 경우
- ✅ 여러 종류의 벡터를 동시에 사용하는 경우
- ✅ 고급 사용자

## 당신의 경우: **Simple Single embedding 선택 권장** ✅

### 사용 사례 분석

**문서 종류:**
- 동아리 소개
- 회칙
- 2026년 사업계획
- FAQ

**요구사항:**
- OpenAI Embeddings 사용
- 의미 기반 검색
- RAG 시스템 구축
- 간단한 설정

**결론:**
**Simple Single embedding**이 가장 적합합니다.

### 이유:
1. ✅ **간단한 설정**: RAG 시스템 구축에 집중 가능
2. ✅ **OpenAI Embeddings 호환**: text-embedding-3-small/large와 직접 호환
3. ✅ **의미 기반 검색**: "동아리 가입 방법은?" 같은 질문에 적합
4. ✅ **빠른 성능**: 단일 벡터 검색으로 빠름
5. ✅ **유지보수 용이**: 설정이 단순하여 관리가 쉬움

## 설정 예시

### Simple Single embedding 선택 시

**Collection 설정:**
```json
{
  "vectors": {
    "size": 1536,  // text-embedding-3-small
    "distance": "Cosine"
  }
}
```

**또는**
```json
{
  "vectors": {
    "size": 3072,  // text-embedding-3-large
    "distance": "Cosine"
  }
}
```

### n8n에서 사용

**Load Data Flow:**
1. 문서 업로드
2. 텍스트 분할
3. **Embeddings OpenAI** → Dense Vector 생성
4. **Qdrant Vector Store** → Simple Single embedding으로 저장

**Retriever Flow:**
1. 사용자 질문
2. **Embeddings OpenAI** → 질문을 Dense Vector로 변환
3. **Qdrant Vector Store** → 의미 기반 검색
4. **AI Agent** → 검색 결과를 컨텍스트로 사용

## Hybrid Search가 필요한 경우

다음과 같은 경우에만 Hybrid Search를 고려하세요:

1. ✅ **정확한 키워드 매칭이 중요한 경우**
   - 예: "2026년 사업계획" 문서를 정확히 찾아야 함
   - 예: 특정 코드명이나 약어를 정확히 매칭해야 함

2. ✅ **의미 검색만으로는 부족한 경우**
   - 예: "FAQ"라는 키워드로 FAQ 문서만 필터링하고 싶음
   - 예: 특정 날짜나 숫자를 포함한 문서를 찾아야 함

3. ✅ **검색 정확도가 매우 중요한 경우**
   - 예: 법률 문서, 의료 문서 등 정확한 매칭이 필수

## 비교표

| 특징 | Simple Single embedding | Simple Hybrid Search | Custom |
|------|-------------------------|---------------------|--------|
| 설정 난이도 | ⭐ 매우 쉬움 | ⭐⭐ 보통 | ⭐⭐⭐ 어려움 |
| OpenAI 호환 | ✅ 완벽 | ⚠️ 추가 설정 필요 | ⚠️ 복잡 |
| 검색 속도 | ⭐⭐⭐ 빠름 | ⭐⭐ 보통 | ⭐⭐ 보통 |
| 검색 정확도 | ⭐⭐⭐ 좋음 | ⭐⭐⭐⭐ 매우 좋음 | ⭐⭐⭐⭐ 매우 좋음 |
| RAG 적합성 | ✅ 최적 | ✅ 좋음 | ⚠️ 과도함 |
| 유지보수 | ⭐⭐⭐ 쉬움 | ⭐⭐ 보통 | ⭐ 어려움 |

## 권장 사항

### 시작 단계
1. **Simple Single embedding 선택** ✅
2. OpenAI Embeddings 사용
3. RAG 시스템 구축
4. 테스트 및 평가

### 필요시 업그레이드
- 검색 정확도가 부족하다고 판단되면
- 키워드 매칭이 중요해지면
- → Hybrid Search로 업그레이드 고려

## 요약

**당신의 경우:**
- ✅ **Simple Single embedding 선택**
- ✅ Collection 이름: `possible`
- ✅ Vector Size: `1536` (text-embedding-3-small) 또는 `3072` (text-embedding-3-large)
- ✅ Distance: `Cosine`
- ✅ Use Case: `Global Search`

**이유:**
- RAG 시스템에 최적화
- OpenAI Embeddings와 완벽 호환
- 설정이 간단하고 유지보수가 쉬움
- 의미 기반 검색으로 충분함

**Hybrid Search는 다음 경우에 고려:**
- 정확한 키워드 매칭이 필수인 경우
- 의미 검색만으로는 부족한 경우
- 검색 정확도가 매우 중요한 경우

