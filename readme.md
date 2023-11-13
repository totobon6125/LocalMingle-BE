# Local Mingle
로컬밍글은 사용자의 접속 위치를 기반으로 일상의 소모임을 만들 수 있는 SNS 형식의 커뮤니티 서비스 입니다.
이 프로젝트의 시작은 사회가 바빠짐에 따라 이웃에 누가 사는지 모르는 지금의 사회에서 취미나 일상의 공유 등 소모임을 통해 잊쳐져 가는 정을 회복했으면 하는 바람으로 시작된 프로젝트 입니다.

## 참가한 사람들
<table>
  <tr>
    <th style="width: 300px;">이름</th>
    <th style="width: 300px;">포지션</th>
    <th style="width: 5px;">역할</th>
    <th style="width: 200px;">깃허브</th>
    <th style="width: 200px;">블로그</th>
  </tr>
  <tr>
    <td>장소영</td>
    <td>Front-End</td>
    <td>메인페이지(카드뷰, 게시글 검색, 게시글 샐랙터 필터링, 인피니티 스크롤),<br>게시글 작성 및 수정, 1차 개발 범위에 대한 전체화면 퍼블리싱,<br>프론트 gitHub 관리, Figma 관리</td>
    <td><a href="https://github.com/ddoddiworld">장소영의 GitHub</a></td>
    <td><a href="https://velog.io/@ddoddiworld">장소영의 블로그</a></td>
  </tr>
  <tr>
  <td>김태현</td>
  <td>Front-End</td>
  <td>마이페이지(회원정보 수정, 작성 이벤트, 참여 이벤트 관리, 회원탈퇴),다국어기능<br>일반회원가입/로그인페이지, 소셜 로그인, 실시간 채팅, 게시글 상세 페이지</td>
  <td><a href="https://github.com/kimtaehyun">김태현의 GitHub</a></td>
  <td><a href="https://velog.io/@taehyun729">김태현의 블로그</a></td>
</tr>
<tr>
  <td>김대욱</td>
  <td>Back-End</td>
  <td>프로젝트 일정 조정, FE & BE CI/CD, AWS 서버 관리(Ec2, S3), 예외처리, Swagger<br>프로젝트 관련 문서 작업, 총무</td>
  <td><a href="https://github.com/totobon6125">김대욱의 GitHub</a></td>
  <td><a href="https://blog.naver.com/ackrima">김대욱의 블로그</a></td>
</tr>
<tr>
  <td>김종화</td>
  <td>Back-End</td>
  <td>이벤트 CRUD, 참가/ 취소 API 작성, 페이지네이션, 캐싱 기능 적용, test코드 작성, 행정구역 데이터 API 작성, 지역, 카테고리, 키워드별 검색 기능</td>
  <td><a href="https://github.com/kimjonghwa230412">김종화의 GitHub</a></td>
  <td><a href="https://velog.io/@ehdxka3">김종화의 블로그</a></td>
</tr>
<tr>
  <td>에릭킴</td>
  <td>Back-End</td>
  <td>마이 페이지 CRUD, 내 프로필 조회, 닉네임/한줄 자기소개/비밀번호 수정, 내가 생성한 목록 조회/수정/삭제, 내가 참가한 목록 조회/취소, 회원탈퇴, 테스트 코드 작성</td>
  <td><a href="https://github.com/erickimme/">에릭킴의 GitHub</a></td>
  <td><a href="https://everyonehasadream.tistory.com/">에릭킴의 블로그</a></td>
</tr>
<tr>
  <td>양희용</td>
  <td>Back-End</td>
  <td>OAuthLogin(카카오, 구글 , 네이버), user(로그인, 회원가입, 회원탈퇴, 회원 정보 수정, 카테고리), 회원가입시 이메일 인증및 인증번호 검증 , 실시간채팅(채팅방 생성, 유저리스트 , 입장 ,퇴장 , 오래된 채팅 삭제 스케쥴러</td>
  <td><a href="https://github.com/HeeDragoN1123">양희용의 GitHub</a></td>
  <td><a href="https://yhy7952.tistory.com/">양희용의 블로그</a></td>
</tr>
<tr>
  <td>박상현</td>
  <td>Design</td>
  <td>페이지 전체 디자인</td>
  <td>없음</td>
  <td><a href="https://www.behance.net/289871a1">박상현의 블로그</a></td>
</tr>
</table>



## 기술 아키텍처

![아키텍처 ver8](https://github.com/totobon6125/LocalMingle-BE/assets/140354427/897fd862-6f57-4f43-a2da-0423955f4195)

## 기술 의사결정
### FE
- **Vite React & TypeScript**
    - Vite는 Create React App (CRA)에 비해 빠르고 가볍습니다. 이것은 개발자가 프로젝트를 신속하게 빌드하고 실행할 수 있도록 도와줍니다.
    - TypeScript를 사용하면 코드에 엄격한 타입 지정이 가능하며, 이는 개발 중에 발생할 수 있는 휴먼에러를 사전에 방지해주는 강력한 도구입니다.
- **Axios**
    - Axios는 비동기 작업을 처리하기 위한 JavaScript 라이브러리입니다. 주로 HTTP 요청을 보내고 응답을 받는 데 사용됩니다.
    - Promise 기반으로 작동하며, 요청과 응답을 가로채고 처리할 수 있는 인터셉터를 제공합니다. 이것은 요청 전/후에 추가 작업을 수행하기 용이하게 해줍니다.
- **React Router**
    - React-Router는 리액트 애플리케이션에서 라우팅을 관리하기 위한 라이브러리입니다.
    - UI와 라우팅 규칙을 일관성 있게 정의하고 제어할 수 있도록 도와주며, 다양한 라우팅 기능을 제공합니다.
- **Recoil**
    - Recoil은 리액트 애플리케이션 내에서 상태를 전역으로 관리하는 데 도움을 주는 상태 관리 라이브러리입니다.
    - 컴포넌트 간 상태 공유를 용이하게 만들어주며, 복잡한 상태 관리 문제를 해결하는데 도움을 줍니다.
- **React Query**
    - React-Query는 서버에서 데이터를 가져와 캐시하고, 컴포넌트 간에 쉽게 공유할 수 있는 간편한 상태 관리를 제공합니다.
    - API 호출과 데이터 관리를 추상화하고, 쿼리 캐싱 및 자동 재로딩과 같은 고급 기능을 제공합니다.
- **Styled Components**
    - Styled-components는 JavaScript를 사용하여 컴포넌트 기반 스타일을 정의할 수 있는 CSS-in-JS 라이브러리입니다.
    - 리액트와 통합되며, 컴포넌트 내부에 스타일을 직접 정의하므로 CSS 클래스 이름 충돌을 방지하고 컴포넌트 스타일을 보다 모듈화하게 해줍니다.
- **GitHub Actions**

### BE
- **Nest.js**
    - **퍼포먼스 관리
    :** Nest.js는 뛰어난 성능을 제공하며, 복잡한 작업을 효과적으로 다룰 수 있습니다.
    - **타입 안정성
    :** TypeScript를 기반으로 하기 때문에 컴파일 과정에서 타입 에러를 사전에 방지할 수 있어 개발자에게 안정성을 제공합니다.
    - **API 명세서 제공
    :** Nest.js는 Swagger를 내장하여 API 명세서를 빠르게 생성하고 협업을 용이하게 합니다. Express에서는 이를 구현하기 위해 추가 설정과 라이브러리가 필요합니다.
    - **내장된 기능과 라이브러리
    :** Nest.js에는 Express의 기능과 추가 라이브러리가 내장되어 있어 기능 구현이 간편하고 편리합니다.
- **Prisma**
    - **Prisma 공식 문서의 훌륭한 정리
    :** Prisma의 공식 문서는 훌륭하게 정리되어 있어, 개발자들이 사용법을 빠르게 이해하고 적용할 수 있도록 도와줍니다. 이로 인해 러닝 커브가 낮습니다.
    - **데이터베이스 스키마를 기반으로한 타입 설정
    :** Prisma는 데이터베이스 스키마를 기반으로 TypeScript 타입을 자동 생성하므로, 개발 초기에 타입 안정성을 제공합니다. 이는 초기 개발 단계에서 발생할 수 있는 오류를 감소시켜줍니다.
    - **간단한 쿼리 API 작성
    :** Prisma는 쿼리 작성을 간단하게 만들어주며, 다양한 데이터베이스와의 호환성을 제공합니다. 이를 통해 데이터베이스와의 상호작용을 편리하게 처리할 수 있습니다.
    - **활발한 커뮤니티와 정보 접근성
    :** Prisma는 활발한 커뮤니티가 존재하여, 정보를 쉽게 얻을 수 있고 문제를 해결하기에 용이합니다. 이는 개발자들이 지원과 도움을 받을 수 있는 환경을 제공합니다.
- **MySQL**
    - **SQL과 NoSQL 비교
    :** MySQL은 데이터를 여러 테이블에 구분하여 저장하고 편집해야 하는 경우, NoSQL보다 다루기 용이합니다. 대규모 데이터의 경우 NoSQL이 효율적일 수 있지만, 현재 서비스에 적합한 선택입니다.
    - **NoSQL 다양성 및 학습 곡선
    :** NoSQL은 다양한 종류가 있고, 각각의 사용법이 다르기 때문에 학습 곡선이 높습니다. MySQL을 선택하면 이러한 다양성과 학습 부담을 줄일 수 있습니다.
    - **PostgreSQL vs MySQL
    :** PostgreSQL은 대용량 처리에 초점이 맞춰져 있지만, 현재 서비스와의 적합성이 부족합니다. MySQL은 현재 서비스에 더 적합한 기능을 제공합니다.
    - **학습 곡선과 복잡성
    :** PostgreSQL은 사용법이 복잡하고 쿼리 작성이 어려운 경우가 많아서 학습 곡선이 높습니다. MySQL은 사용이 더 간편합니다.
    - **읽기 중심 서비스에 적합
    :** 현재 서비스에서는 유저 데이터를 받고 게시글을 생성하는 기능보다 읽는 기능에 초점이 있으며, MySQL은 읽기 중심 서비스에 적합한 선택입니다.
- **Swagger**
    - **자동 문서화**
    : Swagger는 API를 자동으로 문서화하여 개발자들이 API의 엔드포인트, 파라미터, 응답 형식 등을 쉽게 이해할 수 있도록 도와드립니다.
    - **시각적 디자인**
    : API를 시각적으로 디자인하고 관리할 수 있는 기능이 강화되어, 이는 개발자들이 API의 구조를 시각적으로 파악하고 필요에 따라 수정할 수 있도록 도와줍니다.
    - **통합 테스트 환경**
    : Swagger는 기본적인 테스트 환경을 제공하여 API의 동작을 테스트하고 디버깅할 수 있습니다. 다만, 다른 테스트 도구들에 비해 다소 제한적일 수 있습니다.
    - **확장성**
    : Swagger는 다양한 확장 기능을 지원하여 개발자들이 필요한 기능을 추가할 수 있도록 합니다. 이는 Swagger를 더 유연하게 사용할 수 있도록 도와줍니다.
    - **커뮤니티 지원**
    : Swagger는 활발한 개발자 커뮤니티를 가지고 있어서 사용 중에 문제가 발생하면 도움을 받기 쉬운 특징이 있습니다.
- **GitHub Actions**
    - 다른 CD 에 비해서 learning curve 가 낮습니다.
- **AWS**

## ERD
<img width="819" alt="erd" src="https://github.com/totobon6125/LocalMingle-BE/assets/140354427/b27726d2-1c05-47bc-8cb1-0442b3ca63eb">

