# 기정T의 기술가정 게임센터

학생용 주소: https://beefly1136-dev.github.io/kijeong-game-library/

GitHub Pages와 GitHub Actions만으로 사이트·게임·이미지·음악을 제공합니다. Cloudflare 서버, D1, KV와 연결하지 않습니다.

## 게임 관리

- 게임 목록: `site-catalog.json`. 번호, 제목, 설명, 분류, 실행 경로, 썸네일, 공개 여부를 관리합니다. 기존 번호를 변경하지 마세요.
- 새 게임: `games/영문이름/index.html`과 이미지·음악을 상대 경로 그대로 업로드하고, 목록에 새 번호로 등록합니다. ZIP 자체는 실행되지 않습니다.
- 썸네일: `covers/`에 새 파일명으로 업로드하고 목록의 `thumbnail_url`을 변경합니다.
- `play_url`은 저장소 안의 상대 경로입니다. 예: `games/new-game/index.html`.
- `is_published: 0`은 목록에서 숨깁니다. 공개 저장소 파일의 비밀 보관 기능은 아닙니다.
- `sort_order`가 작을수록 최신순 목록 앞에 표시됩니다.
- 인기순은 이전 당시 누적 플레이 횟수 기준입니다. 새 플레이 횟수는 수집하지 않습니다.

저장하면 `.github/workflows/deploy-pages.yml`이 자동으로 검증하고 배포합니다. [배포 상태](https://github.com/beefly1136-dev/kijeong-game-library/actions/workflows/deploy-pages.yml)에서 성공 여부를 확인하세요. 검증이 실패하면 직전 정상 배포가 유지됩니다.

`github-pages-build.mjs`에는 사이트 템플릿·스타일·작은 로고 폰트와 빌드 코드가 포함되어 있습니다. 실행 시 임시 `site/` 소스와 `.pages-dist/` 배포본을 만듭니다. 기존 게임 원본은 수정하지 않고 배포본에서 GitHub Pages 주소로 경로를 바꿉니다. 비밀번호·개인정보·토큰을 공개 저장소에 올리지 마세요.

주소가 바뀌므로 기존 사이트의 브라우저별 게임 저장 기록은 자동 이동되지 않습니다. 게임이 제공하는 내보내기·불러오기를 사용할 수 있습니다.
