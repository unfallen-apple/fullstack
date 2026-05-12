# 🔐 Admin Authentication Setup Guide

## 개요
프로젝트는 Spring Security의 HTTP Basic Authentication을 사용하여 어드민 기능을 보호합니다.  
계정 정보는 **환경 변수**로 관리되므로 Git에 커밋되지 않습니다.

## 환경 변수 설정

### Windows PowerShell에서 설정
```powershell
# 커맨드로 직접 설정 (현재 세션에만 적용)
$env:ADMIN_USERNAME = 'youradmin'
$env:ADMIN_PASSWORD = 'yourpassword'

# 백엔드 시작
./gradlew bootRun
```

### Windows 시스템 환경 변수에 영구 설정
1. **제어판** → **시스템** → **고급 시스템 설정**
2. **환경 변수(N)** 클릭
3. **사용자 변수** 또는 **시스템 변수**에서:
   - 새로 만들기 → `ADMIN_USERNAME` = `youradmin`
   - 새로 만들기 → `ADMIN_PASSWORD` = `yourpassword`
4. **확인** 클릭 후 **PowerShell 재시작**

### macOS/Linux에서 설정
```bash
export ADMIN_USERNAME=youradmin
export ADMIN_PASSWORD=yourpassword
./gradlew bootRun
```

### `.env.local` 파일 사용 (선택사항)
프로젝트 루트에 `.env.local` 파일을 생성하여 다음과 같이 입력:
```
ADMIN_USERNAME=youradmin
ADMIN_PASSWORD=yourpassword
```

**주의**: `.env.local`은 이미 `.gitignore`에 추가되어 있으므로 자동으로 Git에서 제외됩니다.

## 기본 계정
환경 변수를 설정하지 않으면 다음 기본값으로 실행됩니다:
- **ID**: `admin`
- **Password**: `admin`

⚠️ **프로덕션 환경에서는 반드시 환경 변수를 설정하세요!**

## 프론트엔드에서 로그인
1. 브라우저에서 `http://localhost:3000` 접속
2. 상단 네비게이션의 **"🔒 보기 모드"** 버튼 클릭
3. 로그인 모달에서 아이디/비밀번호 입력
4. 로그인 성공 시 **"🔓 관리자 모드 ON"**으로 변경
5. 이제 프로필 및 프로젝트 편집 가능

## 백엔드 API 테스트 (curl)
```bash
# 로그인 확인
curl -u admin:admin http://localhost:8080/api/admin/verify

# 응답 예시
{"user":"admin","status":"ok"}
```

## 보안 주의사항
✅ 하지 말 것:
- 비밀번호를 Java 코드에 하드코딩
- `.env.local` 파일을 Git에 커밋
- 기본 계정(`admin/admin`)을 프로덕션에서 사용

✅ 권장:
- 환경 변수로 관리
- 프로덕션에서는 강력한 비밀번호 사용
- CI/CD 시스템에서는 `secrets` 또는 `vault`로 관리
