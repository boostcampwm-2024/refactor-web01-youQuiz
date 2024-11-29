<div align="center">
  <h1>YOU QUIZ?</h1> 

<img src="https://github.com/user-attachments/assets/a41536e9-d1d1-4e63-8bd8-f2b43c674121"  width=300/>
<p> 실시간 수업을 도와주는 퀴즈 플랫폼</p>
</div>



 <p align=center>
  <a href="https://www.notion.so/e3906f064a574f58a7adc5bb0bf59e64?v=0f21d87970884f3db3c2541122804cba](https://lemon-scene-5c9.notion.site/e3906f064a574f58a7adc5bb0bf59e64?v=0f21d87970884f3db3c2541122804cba&pvs=4">팀 노션</a>
  &nbsp; | &nbsp; 
  <a href="https://github.com/orgs/boostcampwm-2024/projects/19">백로그</a>
  &nbsp; | &nbsp;
  <a href="https://lemon-scene-5c9.notion.site/12e622fa707b809abe4ff76038787e27?pvs=74">기획서</a>   &nbsp; | &nbsp;
  <a href="https://www.figma.com/design/4xAIQB3t5CIgQqxCVtspZy/You-Quiz?node-id=0-1&node-type=canvas&t=GaZuAbtY0GrDjO48-0">figma</a> 
  <br />
  <a href="https://github.com/boostcampwm-2024/web01-youQuiz/wiki/%EA%B7%B8%EB%9D%BC%EC%9A%B4%EB%93%9C-%EB%A3%B0">그라운드 룰</a>
  &nbsp; | &nbsp; 
  <a href="https://github.com/boostcampwm-2024/web01-youQuiz/wiki">개발 위키</a>
</p>


## ✋팀원 소개
<div align="center">
  
|[FE] J031_김도훈|[FE] J255_최병찬|[BE] J087_도성현|[BE] J289_이채원|
|--|--|--|--|
|<img src="https://avatars.githubusercontent.com/u/74540646?v=4" width=150>|<img src="https://avatars.githubusercontent.com/u/77400298?v=4" width=150 />|<img src="https://avatars.githubusercontent.com/u/52828205?v=4" width=150 />|<img src="https://avatars.githubusercontent.com/u/99425616?v=4" width=150/>|
|[@dooohun](https://github.com/dooohun)|[@chan-byeong](https://github.com/chan-byeong)|[@glaxyt](https://github.com/glaxyt)|[@nowChae](https://github.com/nowChae)|

</div>



## 🚀 프로젝트 기능 소개
**주최자**

- 퀴즈 생성 → 게임 발행 → 퀴즈 풀이 관전

**참가자**

- 게임 참가 → 퀴즈 풀이 진행

### **<게임 대기 페이지 - 공통>**  
![image](https://github.com/user-attachments/assets/79349eca-55cc-469c-b738-4195e34321eb)

- 게임 대기 페이지로 들어오면 참여자의 고유의 캐릭터가 배정되고, 자신의 캐릭터는 파란색 배경으로 확인할 수 있습니다.
- 실시간으로 채팅을 참여할 수 있으며,  `/` 버튼을 눌러서 보내고자하는 텍스트를 실시간으로 전송이 가능합니다.
- 채팅은 `Enter` 버튼을 눌러 종료할 수 있습니다.

### **<게임 진행 페이지 - 참여자>**  
![image](https://github.com/user-attachments/assets/0395c21e-c4c6-4479-b50b-d5553bd4daad)

- 정답을 제출한 참여자들은 풀이 시간에 따른 점수를 할당 받습니다.
- 이모지 기능을 통해서 퀴즈에 대한 참여자들의 반응을 실시간으로 볼 수 있습니다.

### **<정답 제출 후 게임 진행 페이지 - 참여자>**  
![image](https://github.com/user-attachments/assets/87b490b8-38a5-4f37-884c-bb2d146581ab)

- 실시간으로 변하는 총 제출, 정답률, 평균 풀이 시간, 평균 참여율 정보를 확인할 수 있습니다.
- 참여자 본인의 제출 등수를 확인할 수 있습니다.

### **<게임 진행 관리 및 통계 페이지 - 주최자>**  
![image](https://github.com/user-attachments/assets/c13b18bd-d334-4aa6-bc4f-187ff6d90965)


- 주최자는 실시간으로 퀴즈를 진행한 참여자들의 제출과 반응을 볼 수 있습니다.
- 볼 수 있는 통계 항목
    - 총 제출
    - 정답률
    - 평균 풀이 시간
    - 평균 참여율
    - 참여자들이 제출한 선택지
    - 참여자들의 제출 현황
    - 참여자들의 반응

### **<게임 중간 집계 페이지 - 참여자>**  
![image](https://github.com/user-attachments/assets/d22a3741-89f5-4d6a-9762-dcb4eaadf8e1)


- 퀴즈의 제한시간이 종료된 이후에 해당 화면을 볼 수 있습니다.
- 게임의 Top3를 점수와 함께 확인할 수 있습니다.
- 참여자 본인의 등수 및 점수를 확인할 수 있습니다.


## ⚒️ 기술 스택



### 💻 Common
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=TypeScript&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=flat-square&logo=prettier&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=flat-square&logo=ESLint&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=Jest&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat-square&logo=Socket.io&logoColor=white)

### 🎨 Frontend
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=React&logoColor=black)
![Tailwind](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=Tailwind-CSS&logoColor=white)
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=flat-square&logo=Storybook&logoColor=white)
![Tanstack Query](https://img.shields.io/badge/Tanstack_Query-FF4154?style=flat-square&logo=ReactQuery&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=Vite&logoColor=white)

### 📡 Backend
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=NestJS&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-E93424?style=flat-square&logo=TypeORM&logoColor=white)

### 💾 Database
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=MySQL&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=Redis&logoColor=white)

### 🌐 Infrastructure
![NGINX](https://img.shields.io/badge/NGINX-009639?style=flat-square&logo=NGINX&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=GitHub-Actions&logoColor=white)
![Naver Cloud Platform](https://img.shields.io/badge/Naver_Cloud-03C75A?style=flat-square&logo=Naver&logoColor=white)

