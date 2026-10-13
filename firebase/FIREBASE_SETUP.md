# Firebase 콘솔 설정 체크리스트

대상 강의: 코덱스에서 나만의 미니펫 만들기 · 총 50분 · 슬라이드 18장

강사 주소: https://codex-minipet-class-20261013.vercel.app/slides.html?admin

청중 주소: https://codex-minipet-class-20261013.vercel.app/slides.html

Firebase 설정이 비어 있는 동안 두 주소 모두 자유 열람. 설정 파일 반영 후 강사 로그인 사용.

## 1. 프로젝트 및 Realtime Database

- [ ] https://console.firebase.google.com/ 접속 → 프로젝트 생성 또는 이 강의용 프로젝트 선택
- [ ] Build → Realtime Database → 데이터베이스 만들기 선택; Cloud Firestore와 구분
- [ ] 사용할 지역 선택 → 잠금 모드로 시작
- [ ] 데이터 화면 상단의 전체 데이터베이스 URL 복사; HTTPS 주소와 지역 주소를 그대로 사용
- [ ] 기존 프로젝트 사용 시 기존 데이터와 규칙을 먼저 내려받아 보관; 다른 강의 규칙을 이 파일로 통째로 덮어쓰지 않기

공식 안내: https://firebase.google.com/docs/database/web/start

## 2. Authentication

- [ ] Build → Authentication → 시작하기
- [ ] Sign-in method → 이메일/비밀번호 사용 설정; 이메일 링크 로그인은 별도 설정
- [ ] Users → 사용자 추가 → 실제 강사 이메일과 본인이 정한 비밀번호 입력
- [ ] 생성된 강사 계정의 UID 복사; 이메일 주소와 다른 긴 식별값
- [ ] Settings → Authorized domains → codex-minipet-class-20261013.vercel.app 추가
- [ ] 로컬 HTTP 검증이 필요할 때만 localhost를 추가하고 수업에는 고정 공개 도메인 사용
- [ ] 비밀번호·서비스 계정 JSON·개인 키를 HTML, firebase-config.js, GitHub, 작업 기록에 입력하지 않기

공식 안내: https://firebase.google.com/docs/auth/web/password-auth

## 3. 데이터베이스 규칙

- [ ] Realtime Database → Rules(규칙) 선택
- [ ] 이 강의용 새 데이터베이스라면 같은 폴더의 database.rules.json 전체 내용 붙여넣기
- [ ] Publish(게시) 선택; 문법 오류가 있으면 게시 완료로 간주하지 않기
- [ ] 규칙 확인: 청중은 이 강의 state 읽기만 가능; state 쓰기는 admins에 등록된 로그인 계정만 가능
- [ ] 규칙 확인: 슬라이드 번호 0~17의 정수; locked/pdf는 불리언; updatedAt은 서버 시각 숫자
- [ ] 규칙 확인: 웹 브라우저에서는 admins 추가·변경 불가; Firebase 콘솔에서만 직접 등록
- [ ] 기존 강의가 있다면 기존 규칙을 보존하면서 이 강의 deck 경로와 admins 자체 UID 읽기 규칙을 합치기

공식 안내: https://firebase.google.com/docs/database/security

## 4. admins 등록

- [ ] Realtime Database → Data(데이터)에서 루트에 admins 자식 추가; 이미 있다면 기존 항목 유지
- [ ] admins 아래에 복사한 강사 UID를 키로 추가
- [ ] 값은 불리언 true 선택; 문자열 "true"와 구분
- [ ] 데이터 구조 확인

```json
{
  "admins": {
    "실제_강사_UID": true
  }
}
```

위 예시는 모양 설명용. 데이터베이스 전체에 가져오기 하지 않고 admins/실제UID 자식만 추가. 강사 계정 자체를 만든 것만으로 제어 권한이 생기지는 않음.

## 5. 웹 앱 등록 및 설정 파일

- [ ] 프로젝트 설정 → 일반 → 내 앱 → 웹 아이콘(</>) 선택
- [ ] 앱 이름 입력 후 앱 등록; 기존 Vercel 사이트 사용이므로 Firebase Hosting 설정은 필수 아님
- [ ] SDK 설정 및 구성에서 구성(config) 값 확인
- [ ] firebase/firebase-config.js의 FIREBASE_CONFIG에 apiKey, authDomain, databaseURL, projectId, appId 입력
- [ ] databaseURL이 웹 앱 구성에 없다면 Realtime Database 화면 상단에서 복사한 주소 추가
- [ ] DECK_ID는 codex-minipet-class-20261013 유지; rules의 강의 경로와 동일해야 동작
- [ ] 설정 파일 수정 전 기존 버전 보관; GitHub main 커밋·업로드 후 Vercel의 새 배포 Ready 확인
- [ ] 공개 주소 강력 새로고침; "Firebase 설정 전" 안내가 없어지는지 확인

firebase-config.js는 공개 웹 앱 식별값. 쓰기 권한은 데이터베이스 규칙으로 제한. 강사 로그인 정보와 서비스 계정 키는 구성 값에 포함하지 않음.

공식 안내: https://firebase.google.com/docs/web/setup

## 6. 강사·청중 실동작 점검

- [ ] 노트북에서 강사 주소(?admin) 열기 → 등록한 이메일·비밀번호로 로그인
- [ ] 휴대폰 또는 별도 브라우저에서 청중 기본 주소 열기
- [ ] 강사 로그인 후 잠금 ON 및 PDF ON 제어 버튼 표시 확인
- [ ] 강사 한 장 이동 → 청중의 장 번호와 화면 이동 확인
- [ ] 잠금 ON에서 청중의 버튼·키보드·무대 클릭·전체보기 이동 차단 확인
- [ ] 잠금 OFF → 청중 직접 이동 확인; 강사 이동에 청중의 개별 위치 유지 확인
- [ ] 잠금 다시 ON → 청중이 현재 강사 장으로 복귀하는지 확인
- [ ] PDF OFF → 청중 PDF 버튼 숨김·P 단축키 차단·인쇄 미리보기에서 슬라이드 미표시 확인
- [ ] PDF ON → PDF 저장 기능 복원 확인
- [ ] 강사 로그아웃 → 제어 버튼 숨김 확인
- [ ] admins 미등록 계정은 로그인해도 강사 제어 불가 확인
- [ ] 데이터에 decks/codex-minipet-class-20261013/state 생성 확인; 첫 강사 로그인 시 자동 생성

PDF 스위치는 사이트의 저장 버튼·단축키·인쇄 출력을 제어. 정적 사이트 원문 내려받기나 화면 촬영까지 차단하는 기능은 아님.

## 7. 오류별 확인 위치

- "Firebase 설정 전": 다섯 구성 값의 누락·빈칸·자리표시자·databaseURL 형식 확인
- "연결 실패": 인터넷, SDK 로드, 프로젝트 설정 값 확인
- "상태 읽기 실패": 규칙의 deck 경로와 DECK_ID 확인
- "강사 목록에 없는 계정": admins/로그인_UID 값이 불리언 true인지 확인
- "저장 실패": 네트워크, 강사 권한, 규칙 게시 여부 확인
- 두 화면이 따로 이동: 잠금 스위치 ON 여부 확인

## 현재 검증 범위

모의 Firebase SDK를 사용하는 실제 브라우저 두 창에서 강사·청중 동기화, 잠금, PDF, 로그인·로그아웃 및 미등록 계정 제어 차단 확인. 설정 전 자유 열람과 SDK 요청 0건 확인. PC·모바일 슬라이드 18장 및 강사 메뉴 넘침 0건 확인. 실제 Firebase 프로젝트 로그인·서버 규칙 적용·실물 휴대폰 동기화는 콘솔 설정 후 점검 필요.
