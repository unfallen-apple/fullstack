## 🚀 Full-Stack Portfolio Project
개인 프로젝트를 전시하고 관리하기 위한 풀스택 포트폴리오 웹사이트입니다.
https://junyoungkim.vercel.app

## 🛠 Tech Stack
현재 구축된 기술 스택입니다.

Frontend: React.js, Vercel (Deployment)

Backend: Java Spring Boot, Cloudtype (Deployment)

Database: Supabase (PostgreSQL)

## 🌐 Live Demo
Frontend URL: https://junyoungkim.vercel.app

API Server URL: https://port-0-kimjunyoung-mp46398g3f283d23.sel3.cloudtype.app

## 📌 주요 구현 내용 (Current Status)
지금까지 진행된 핵심 작업들입니다.

풀스택 아키텍처 구축: React - Spring Boot - PostgreSQL 연동 및 CORS 정책 설정 완료.

클라우드 서버 배포: Cloudtype 플랫폼을 활용한 Spring Boot 네이티브 빌드 및 배포 자동화.

CI/CD 환경 설정: GitHub Push 시 Vercel(프론트) 및 Cloudtype(백엔드) 파이프라인을 통한 자동 배포 환경 구축.

데이터 CRUD 기초: Supabase를 활용한 포트폴리오 데이터 저장 및 API 통신 검증.

관리자 모드: 기본적인 인증을 통한 관리자 기능 진입 로직 구현.

## 💡 시행착오 및 트러블슈팅 (Troubleshooting)
프로젝트를 진행하며 겪은 문제와 해결 과정입니다.

1. 배포 플랫폼 마이그레이션 (Render ➡️ Cloudtype)

문제: 초기 백엔드 배포를 Render에서 진행했으나, Java 네이티브 환경 미지원으로 인한 복잡한 Dockerfile 설정, 런타임 환경 충돌(Node.js 오인식), 그리고 512MB의 타이트한 메모리 제한으로 인해 빌드 및 실행 실패가 잦았습니다.

해결: Spring Boot(JVM) 네이티브 환경을 공식 지원하고 무료 1GB 메모리를 제공하는 Cloudtype으로 마이그레이션을 결정했습니다. 불필요한 Docker 설정 없이 GitHub 연동만으로 빠르고 안정적인 배포에 성공하여 개발 생산성을 높였습니다.

2. Supabase DB 커넥션 충돌 (Prepared Statement Error)

문제: 클라우드 배포 후 ERROR: prepared statement "S_1" already exists 에러와 함께 서버가 종료되는 현상 발생. 분석 결과, Supabase의 커넥션 풀러(PgBouncer/6543 포트)와 Spring Boot(JPA)의 쿼리문 이름 캐싱(Prepared Statement) 기능이 충돌하여 발생한 문제였습니다.

해결: DB 연결 환경변수(JDBC URL) 맨 끝에 &prepareThreshold=0 옵션을 추가하여, JPA가 쿼리 캐싱을 무시하고 매번 새로 통신하도록 설정함으로써 DB 연결 에러를 완벽하게 해결했습니다.

3. Cloudtype 무료 버전의 매일 1회 중단되는 문제 (GitHub Actions CI/CD 활용)

문제: Cloudtype 무료 플랜 정책상 매일 03시~09시 사이에 컨테이너가 강제 중지(Sleep) 상태로 전환됩니다. 포트폴리오 특성상 언제 접속이 발생할지 모르는 상황에서 매일 수동으로 대시보드에 접속해 서버를 재시작하는 것은 비효율적이라고 판단했습니다.

해결: GitHub Actions의 cron 스케줄러를 활용해 매일 아침 자동으로 서버를 깨우는 파이프라인을 구축했습니다. 단순 API 호출로는 잠든 서버를 깨울 수 없다는 점을 파악하고, cloudtype-github-actions/deploy를 이용해 '전체 설정(YAML) 기반 강제 재배포 매크로'를 작성했습니다. 보안을 위해 환경변수(DB 정보 등)는 GitHub Secrets로 격리 주입하여, 보안성과 편의성을 모두 챙긴 유사 무중단 서비스를 구현했습니다.

4. 클라우드 컨테이너의 휘발성 디스크 문제 해결 (Local ➡️ Supabase Storage)
문제: Cloudtype 프리티어 특성상 매일 서버가 재배포되는데, 이때 서버 로컬 디스크(uploads/ 폴더)에 저장된 사용자 업로드 이미지가 모두 삭제되는 현상 발생.

원인 분석: 컨테이너 기반 배포 환경은 재빌드 시 내부 스토리지가 초기화되는 휘발성(Ephemeral) 구조임을 파악. 데이터 영속성(Persistence) 보장을 위해 외부 스토리지 도입이 필수적이었음.

해결: * 기존 로컬 저장 로직을 Supabase Storage API 연동 방식으로 전면 개편.

보안 강화를 위해 Supabase API Key와 URL 정보를 GitHub Secrets에 격리 저장 후, CI/CD 파이프라인(GitHub Actions)을 통해 런타임에 동적으로 주입.

Storage RLS(Row Level Security) Policy를 설정하여 외부 호출 권한을 제어함으로써 이미지 조회 및 업로드 기능을 안정화함.

결과: 서버가 재배포되거나 중지 후 재시작되어도 업로드된 미디어 데이터가 영구적으로 보존되는 인프라 구조 확립.


## 🚧 작업 예정 사항 (To-do List)
[ ] Supabase Storage 연동 (진행 중): 클라우드 컨테이너의 휘발성(재배포 시 업로드 폴더 초기화) 문제를 해결하기 위해, 이미지 파일을 외부 저장소(Storage)로 업로드하고 URL을 렌더링하는 구조로 전면 개편.

[ ] UI/UX 디자인 디테일 수정

[ ] 상세 페이지 및 추가 기능 구현

[ ] 로그 보완 및 예외 처리 강화
