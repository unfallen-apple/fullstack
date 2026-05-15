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

3. Cloudtype 무료 버전의 매일 1회 중단됨
문제: 클라우드 타입 무료 버전의 경우 매일 03시~09시 사이에 서버가 중단됨 상태로 변경됩니다. 매일 서버에 직접 들어가서 키는 방법도 있지만, CI/CD를 적용하고자, Github action을 이용하여 매일 deploy를 자동으로 하는 방식으로 해결했습니다. 

## 🚧 작업 예정 사항 (To-do List)
[ ] Supabase Storage 연동 (진행 중): 클라우드 컨테이너의 휘발성(재배포 시 업로드 폴더 초기화) 문제를 해결하기 위해, 이미지 파일을 외부 저장소(Storage)로 업로드하고 URL을 렌더링하는 구조로 전면 개편.

[ ] UI/UX 디자인 디테일 수정

[ ] 상세 페이지 및 추가 기능 구현

[ ] 로그 보완 및 예외 처리 강화
