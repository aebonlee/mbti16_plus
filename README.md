# mbti16_plus

MBTI 64형(XXXX + A/O + H/C) 간이 테스트

개요
- 공식 MBTI 진단이 아닌, 온라인에서 유행하는 AOHC 확장(64형)을 참고한 자가진단용 테스트입니다.
- 정적 웹(HTML/CSS/JS)로 만들어 GitHub Pages에 바로 배포할 수 있습니다.

로컬 실행
1) 폴더로 이동
2) 아래 실행
   python -m http.server 8000
3) 브라우저에서 접속
   http://localhost:8000

GitHub Pages 배포
1) 이 프로젝트를 GitHub 저장소에 업로드
2) Settings → Pages
3) Source: Deploy from branch
4) Branch: main, Folder: / (root)
5) 저장 후 Pages URL로 접속

질문 수정
- questions.js의 QUESTIONS 배열을 수정하면 됩니다.
- axis: EI, SN, TF, JP, AO, HC
- dir: +1이면 앞글자(E,S,T,J,A,H) 점수, -1이면 뒷글자(I,N,F,P,O,C) 점수

라이선스
- MIT License
