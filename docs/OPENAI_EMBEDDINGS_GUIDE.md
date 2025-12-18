# OpenAI Embeddings 모델 사용 가이드

## 개요

OpenAI Embeddings 모델은 텍스트를 벡터(숫자 배열)로 변환하여 의미 기반 검색, 유사도 계산, RAG 시스템 구축 등에 사용됩니다.

## 사용 가능한 모델

### 1. text-embedding-3-small
- **벡터 차원**: 1536차원 (기본값)
- **최대 토큰**: 8,191 토큰
- **용도**: 일반적인 임베딩 작업에 적합
- **성능**: 빠르고 효율적

### 2. text-embedding-3-large
- **벡터 차원**: 3072차원 (기본값)
- **최대 토큰**: 8,191 토큰
- **용도**: 더 정확한 임베딩이 필요한 경우
- **성능**: 더 높은 정확도, 더 많은 차원

### 3. text-embedding-ada-002 (레거시)
- **벡터 차원**: 1536차원 (고정)
- **최대 토큰**: 8,191 토큰
- **용도**: 기존 시스템 호환성
- **참고**: 새로운 프로젝트는 text-embedding-3-small 사용 권장

## 요금 정보 (2024년 기준)

### text-embedding-3-small
- **요금**: **$0.02 per 1M tokens** (입력 토큰 기준)
- **예시**: 
  - 100만 토큰 = $0.02
  - 1억 토큰 = $2.00
  - 10억 토큰 = $20.00

### text-embedding-3-large
- **요금**: **$0.13 per 1M tokens** (입력 토큰 기준)
- **예시**:
  - 100만 토큰 = $0.13
  - 1억 토큰 = $13.00
  - 10억 토큰 = $130.00

### text-embedding-ada-002 (레거시)
- **요금**: **$0.10 per 1M tokens** (입력 토큰 기준)

### 차원 조정 옵션
- text-embedding-3-small: 1536차원까지 조정 가능 (dimensions 파라미터)
- text-embedding-3-large: 3072차원까지 조정 가능 (dimensions 파라미터)
- 차원을 줄이면 요금이 감소하지 않음 (동일 요금)

## 비용 계산 예시

### 시나리오 1: 소규모 문서 (10,000 토큰)
- **모델**: text-embedding-3-small
- **토큰 수**: 10,000 토큰
- **비용**: 10,000 / 1,000,000 × $0.02 = **$0.0002** (약 0.3원)

### 시나리오 2: 중규모 문서 (100만 토큰)
- **모델**: text-embedding-3-small
- **토큰 수**: 1,000,000 토큰
- **비용**: **$0.02** (약 27원)

### 시나리오 3: 대규모 문서 (1억 토큰)
- **모델**: text-embedding-3-small
- **토큰 수**: 100,000,000 토큰
- **비용**: **$2.00** (약 2,700원)

### 시나리오 4: RAG 시스템 (월간 사용량)
- **문서 로딩**: 1,000개 문서 × 평균 5,000 토큰 = 500만 토큰
- **쿼리 검색**: 10,000개 쿼리 × 평균 50 토큰 = 50만 토큰
- **총 토큰**: 550만 토큰
- **비용**: 5.5 × $0.02 = **$0.11** (약 150원)

## n8n에서 OpenAI Embeddings 사용하기

### 1. API 키 발급

1. [OpenAI Platform](https://platform.openai.com/)에 접속
2. 계정 생성 또는 로그인
3. **API Keys** 메뉴로 이동
4. **Create new secret key** 클릭
5. API 키 복사 및 안전하게 보관

### 2. n8n에서 Credential 설정

1. n8n 워크플로우 편집기에서 **Embeddings OpenAI** 노드 선택
2. **Credential** 섹션에서 **Create New Credential** 클릭
3. **Credential Type**에서 **OpenAI API** 선택
4. 발급받은 API 키 입력
5. **Save** 클릭

### 3. Embeddings 노드 설정

#### 기본 설정
```json
{
  "operation": "createEmbedding",
  "model": "text-embedding-3-small",
  "text": "={{ $json.text }}"
}
```

#### 고급 설정 (차원 조정)
```json
{
  "operation": "createEmbedding",
  "model": "text-embedding-3-small",
  "text": "={{ $json.text }}",
  "dimensions": 512  // 1536에서 512로 차원 축소 가능
}
```

### 4. 워크플로우 예시

#### Load Data Flow에서 사용
```json
{
  "name": "Embeddings OpenAI",
  "type": "n8n-nodes-base.openAi",
  "parameters": {
    "operation": "createEmbedding",
    "model": "text-embedding-3-small",
    "text": "={{ $json.text }}"
  },
  "credentials": {
    "openAiApi": {
      "id": "your-credential-id",
      "name": "OpenAI API"
    }
  }
}
```

#### Retriever Flow에서 사용
```json
{
  "name": "Embeddings OpenAI",
  "type": "n8n-nodes-base.openAi",
  "parameters": {
    "operation": "createEmbedding",
    "model": "text-embedding-3-small",
    "text": "={{ $json.body.query || $json.body.message }}"
  },
  "credentials": {
    "openAiApi": {
      "id": "your-credential-id",
      "name": "OpenAI API"
    }
  }
}
```

## API 직접 호출 방법

### Python 예시
```python
import openai

# API 키 설정
openai.api_key = "your-api-key-here"

# 임베딩 생성
response = openai.embeddings.create(
    model="text-embedding-3-small",
    input="Your text here"
)

# 벡터 추출
vector = response.data[0].embedding
print(f"Vector dimension: {len(vector)}")
print(f"Vector: {vector[:5]}...")  # 처음 5개 값만 출력
```

### JavaScript/TypeScript 예시
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: 'your-api-key-here',
});

// 임베딩 생성
const response = await openai.embeddings.create({
  model: 'text-embedding-3-small',
  input: 'Your text here',
});

// 벡터 추출
const vector = response.data[0].embedding;
console.log(`Vector dimension: ${vector.length}`);
```

### cURL 예시
```bash
curl https://api.openai.com/v1/embeddings \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "text-embedding-3-small",
    "input": "Your text here"
  }'
```

## 모델 선택 가이드

### text-embedding-3-small 선택 시기
- ✅ 비용 효율성이 중요한 경우
- ✅ 일반적인 텍스트 검색 및 유사도 계산
- ✅ 대규모 데이터셋 처리
- ✅ 빠른 응답 시간이 필요한 경우

### text-embedding-3-large 선택 시기
- ✅ 최고 정확도가 필요한 경우
- ✅ 복잡한 의미 분석이 필요한 경우
- ✅ 작은 데이터셋에서 높은 품질이 중요한 경우
- ✅ 비용이 큰 문제가 아닌 경우

## 비용 절감 팁

### 1. 적절한 모델 선택
- 대부분의 경우 `text-embedding-3-small`로 충분
- 정확도가 크게 차이나지 않는다면 small 모델 사용

### 2. 배치 처리
- 여러 텍스트를 한 번에 처리하면 효율적
- API 호출 횟수 감소

```python
# 단일 호출 (비효율)
for text in texts:
    embedding = create_embedding(text)

# 배치 호출 (효율적)
embeddings = create_embedding(texts)  # 리스트로 전달
```

### 3. 차원 축소 (선택적)
- 필요에 따라 차원을 줄여 저장 공간 절약
- 요금은 동일하지만 저장 비용 절감

```python
response = openai.embeddings.create(
    model="text-embedding-3-small",
    input="Your text",
    dimensions=512  # 1536에서 512로 축소
)
```

### 4. 캐싱 활용
- 동일한 텍스트의 임베딩은 재사용
- 중복 계산 방지

### 5. 토큰 수 최적화
- 불필요한 공백 제거
- 텍스트 전처리로 토큰 수 감소

## 사용량 모니터링

### OpenAI Dashboard에서 확인
1. [OpenAI Platform](https://platform.openai.com/usage) 접속
2. **Usage** 메뉴에서 사용량 확인
3. 일별/월별 사용량 및 비용 확인
4. 모델별 사용량 분석

### API로 사용량 확인
```python
import openai

# 사용량 확인 (OpenAI API는 직접적인 사용량 조회 API를 제공하지 않음)
# Dashboard에서 확인하거나, 자체적으로 로깅 필요
```

## 제한 사항

### Rate Limits (속도 제한)
- **Free Tier**: 분당 3회 요청
- **Tier 1**: 분당 60회 요청
- **Tier 2**: 분당 3,500회 요청
- **Tier 3**: 분당 10,000회 요청

### 토큰 제한
- 최대 입력 토큰: 8,191 토큰
- 더 긴 텍스트는 분할 필요

### 동시 요청
- 계정 등급에 따라 동시 요청 수 제한
- 배치 처리로 효율성 향상

## 보안 주의사항

### API 키 보안
- ❌ API 키를 코드에 하드코딩하지 않기
- ❌ API 키를 Git에 커밋하지 않기
- ✅ 환경 변수 사용
- ✅ n8n Credential에 안전하게 저장

### 환경 변수 사용 예시
```bash
# .env 파일
OPENAI_API_KEY=sk-...

# Python
import os
api_key = os.getenv('OPENAI_API_KEY')
```

## 트러블슈팅

### 1. API 키 오류
```
Error: Invalid API key
```
**해결**: API 키가 올바른지 확인, OpenAI Platform에서 키 재발급

### 2. Rate Limit 오류
```
Error: Rate limit exceeded
```
**해결**: 요청 간격 조정, 배치 처리 사용, 계정 등급 업그레이드

### 3. 토큰 제한 오류
```
Error: Maximum context length exceeded
```
**해결**: 텍스트를 더 작은 청크로 분할

### 4. 차원 불일치 오류
```
Error: Vector dimension mismatch
```
**해결**: Qdrant Collection의 벡터 크기와 임베딩 차원이 일치하는지 확인

## 참고 자료

- [OpenAI Embeddings 문서](https://platform.openai.com/docs/guides/embeddings)
- [OpenAI Pricing](https://openai.com/api/pricing/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference/embeddings)
- [n8n OpenAI 노드 문서](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.openai/)

## 결론

OpenAI Embeddings는 **비용 효율적이고 고품질**의 임베딩을 제공합니다. `text-embedding-3-small` 모델은 대부분의 RAG 시스템에 충분하며, 100만 토큰당 $0.02의 저렴한 가격으로 사용할 수 있습니다.

**권장 사항**:
- 시작은 `text-embedding-3-small` 사용
- 필요시 `text-embedding-3-large`로 업그레이드
- 사용량 모니터링으로 비용 관리
- 배치 처리로 효율성 향상

