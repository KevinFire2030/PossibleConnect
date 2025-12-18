# Qdrant Payload Indexes 가이드

## Payload Indexes란?

**Payload Indexes**는 벡터와 함께 저장된 메타데이터(payload)를 빠르게 검색하기 위한 인덱스입니다.

### 기본 개념

**Payload (페이로드)**는 벡터와 함께 저장되는 추가 정보입니다:

```json
{
  "id": 1,
  "vector": [0.1, 0.2, 0.3, ...],
  "payload": {
    "text": "동아리 소개 내용...",
    "documentType": "소개",
    "title": "동아리 소개",
    "createdAt": "2024-01-01"
  }
}
```

**Payload Index**는 이 메타데이터를 빠르게 검색하기 위한 인덱스입니다.

## 왜 필요한가?

### 인덱스 없이 검색할 때
```
질문: "FAQ 문서만 검색해줘"
→ 모든 문서를 하나씩 확인
→ documentType이 "FAQ"인지 체크
→ 느림 ❌
```

### 인덱스가 있을 때
```
질문: "FAQ 문서만 검색해줘"
→ 인덱스를 통해 즉시 FAQ 문서만 찾음
→ 빠름 ✅
```

## 필터링 검색 (Filtered Search)이란?

벡터 검색과 함께 메타데이터로 필터링하는 검색입니다.

### 예시 1: 문서 유형으로 필터링
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

→ FAQ 문서만 검색

### 예시 2: 날짜로 필터링
```json
{
  "vector": [0.1, 0.2, ...],
  "limit": 5,
  "filter": {
    "must": [
      {
        "key": "createdAt",
        "range": {
          "gte": "2024-01-01",
          "lte": "2024-12-31"
        }
      }
    ]
  }
}
```

→ 2024년에 생성된 문서만 검색

### 예시 3: 여러 조건 조합
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
      },
      {
        "key": "createdAt",
        "range": {
          "gte": "2024-01-01"
        }
      }
    ]
  }
}
```

→ FAQ 문서이면서 2024년 이후에 생성된 문서만 검색

## 인덱스가 필요한 경우

### 인덱스 없이도 가능한 경우
- ✅ 단순 벡터 검색만 수행
- ✅ 필터링이 필요 없는 경우
- ✅ 전체 컬렉션에서 검색

### 인덱스가 필요한 경우
- ✅ **특정 문서 유형만 검색** (예: FAQ만)
- ✅ **날짜 범위로 필터링** (예: 2024년 문서만)
- ✅ **복잡한 필터 조건** 사용
- ✅ **빠른 필터링 성능**이 필요한 경우

## 당신의 경우: 인덱스가 유용할 수 있음

### 사용 사례
- 동아리 소개, 회칙, 2026년 사업계획, FAQ 문서

### 인덱스가 유용한 경우
1. ✅ **"FAQ만 검색해줘"** 같은 요청
2. ✅ **"회칙 문서만 보여줘"** 같은 요청
3. ✅ **특정 문서 유형으로 필터링**

### 인덱스가 필요 없는 경우
- 전체 문서에서 의미 기반 검색만 수행
- 필터링 없이 모든 문서에서 검색

## Payload Index 생성 방법

### 방법 1: Dashboard에서 생성

1. **"+ Add"** 버튼 클릭
2. **Field name** 입력 (예: `documentType`)
3. **Field type** 선택:
   - **Keyword**: 문자열 매칭 (예: "FAQ", "소개")
   - **Integer**: 정수 범위 (예: 1, 2, 3)
   - **Float**: 실수 범위 (예: 1.5, 2.3)
   - **Bool**: 불린 값 (예: true, false)
   - **Geo**: 지리적 좌표
   - **Text**: 텍스트 검색 (부분 매칭)

4. **Save** 클릭

### 방법 2: HTTP API로 생성

```bash
curl -X PUT http://localhost:6333/collections/possible/index \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "documentType",
    "field_schema": {
      "type": "keyword"
    }
  }'
```

### 방법 3: Python SDK로 생성

```python
from qdrant_client import QdrantClient
from qdrant_client.models import PayloadSchemaType

client = QdrantClient(host="localhost", port=6333)

# Keyword 인덱스 생성
client.create_payload_index(
    collection_name="possible",
    field_name="documentType",
    field_schema=PayloadSchemaType.KEYWORD
)
```

## 인덱스 타입별 사용 사례

### 1. Keyword (키워드)
**용도**: 정확한 문자열 매칭

**예시:**
```json
{
  "documentType": "FAQ"  // 정확히 "FAQ"인 문서만
}
```

**필터 예시:**
```json
{
  "key": "documentType",
  "match": {
    "value": "FAQ"
  }
}
```

### 2. Integer (정수)
**용도**: 숫자 범위 검색

**예시:**
```json
{
  "year": 2026,
  "priority": 1
}
```

**필터 예시:**
```json
{
  "key": "year",
  "range": {
    "gte": 2024,
    "lte": 2026
  }
}
```

### 3. Float (실수)
**용도**: 실수 범위 검색

**예시:**
```json
{
  "score": 0.95,
  "rating": 4.5
}
```

### 4. Bool (불린)
**용도**: true/false 값

**예시:**
```json
{
  "isPublic": true,
  "isActive": false
}
```

**필터 예시:**
```json
{
  "key": "isPublic",
  "match": {
    "value": true
  }
}
```

### 5. Text (텍스트)
**용도**: 부분 문자열 검색

**예시:**
```json
{
  "title": "동아리 소개",
  "description": "동아리에 대한 설명입니다"
}
```

**필터 예시:**
```json
{
  "key": "title",
  "match": {
    "text": "동아리"  // "동아리"가 포함된 문서
  }
}
```

## 실제 사용 예시

### 문서 저장 시 Payload 포함

```json
{
  "id": 1,
  "vector": [0.1, 0.2, ...],
  "payload": {
    "text": "동아리 소개 내용...",
    "documentType": "소개",
    "title": "동아리 소개",
    "createdAt": "2024-01-01"
  }
}
```

### 인덱스 생성

```bash
# documentType 인덱스 생성
curl -X PUT http://localhost:6333/collections/possible/index \
  -H "Content-Type: application/json" \
  -d '{
    "field_name": "documentType",
    "field_schema": {
      "type": "keyword"
    }
  }'
```

### 필터링 검색

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

→ FAQ 문서만 검색

## n8n에서 사용하기

### Qdrant Vector Store 노드 설정

**Query Documents 모드에서:**
1. **Filter** 섹션에서 필터 조건 추가
2. 인덱스가 생성된 필드로 필터링 가능

**예시:**
```json
{
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

## 권장 사항

### 시작 단계
1. **인덱스 없이 시작** ✅
2. 전체 문서에서 의미 기반 검색
3. 필요시 인덱스 추가

### 인덱스가 필요한 경우
- 특정 문서 유형으로 필터링이 필요할 때
- 날짜 범위로 필터링이 필요할 때
- 복잡한 필터 조건이 필요할 때

### 인덱스 생성 권장 필드
- `documentType`: 문서 유형 (소개, 회칙, 사업계획, FAQ)
- `title`: 문서 제목
- `createdAt`: 생성 날짜 (날짜 범위 검색용)

## 요약

**Payload Indexes란?**
- 메타데이터를 빠르게 검색하기 위한 인덱스
- 필터링 검색의 성능을 향상시킴

**필요한 경우:**
- ✅ 특정 문서 유형만 검색 (예: FAQ만)
- ✅ 날짜 범위로 필터링
- ✅ 복잡한 필터 조건 사용

**필요 없는 경우:**
- ✅ 전체 문서에서 의미 기반 검색만 수행
- ✅ 필터링이 필요 없는 경우

**당신의 경우:**
- 시작은 인덱스 없이 진행 가능
- 나중에 "FAQ만 검색" 같은 기능이 필요하면 인덱스 추가
- `documentType` 필드에 Keyword 인덱스 생성 권장

## 결론

**지금은 인덱스를 생성하지 않아도 됩니다.**
- 전체 문서에서 의미 기반 검색만 수행한다면 인덱스 불필요
- 나중에 필터링이 필요하면 인덱스 추가 가능

**인덱스를 생성하려면:**
- "+ Add" 버튼 클릭
- `documentType` 필드에 Keyword 인덱스 생성
- 나중에 FAQ, 회칙 등으로 필터링 가능

