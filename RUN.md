# 실행 방법

## 1. 의존성 설치

프로젝트는 `pnpm`을 사용합니다. 의존성을 설치합니다:

```bash
pnpm install
```

## 2. 데이터베이스 설정

데이터베이스를 마이그레이션합니다:

```bash
pnpm db:migrate
```

## 3. 개발 서버 실행

개발 모드로 서버를 실행합니다:

```bash
pnpm dev
```

서버가 실행되면 브라우저에서 [http://localhost:3000](http://localhost:3000)으로 접속할 수 있습니다.

## 추가 명령어

### 프로덕션 빌드
```bash
pnpm build
pnpm start
```

### 코드 포맷팅 및 린팅
```bash
pnpm format  # 자동 수정
pnpm lint    # 체크만
```

### 데이터베이스 관리
```bash
pnpm db:studio   # 데이터베이스 스튜디오 실행
pnpm db:push     # 스키마 푸시
```

## 환경 변수

환경 변수가 필요한 경우 `.env.local` 파일을 생성하고 필요한 변수를 설정하세요.




