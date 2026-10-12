# Blue Peace 홈페이지 미리보기

Next.js App Router와 Tailwind CSS로 만든 블루피스 메인 페이지입니다. Node.js 20.9 이상과 npm이 필요합니다.

## 1. 내 컴퓨터에서 보기

PowerShell에서 이 폴더로 이동한 뒤 실행하세요.

```powershell
cd "C:\Users\BluePeace\Documents\ChatGPT\블루피스 홈페이지"
npm install
npm run dev
```

브라우저에서 <http://localhost:3000>을 엽니다. 서버를 끄려면 터미널에서 `Ctrl+C`를 누르세요.

배포 전 빌드 확인:

```powershell
npm run build
```

## 2. Vercel CLI로 미리보기 주소 만들기

Vercel 계정에 로그인할 수 있어야 합니다. 프로젝트 폴더에서 다음 명령을 실행하세요.

```powershell
npx vercel@latest
```

첫 실행에서 로그인과 프로젝트 연결 질문에 답하면 배포가 진행되고 미리보기 URL이 출력됩니다. `--prod` 옵션은 실제 운영 주소에 배포할 때만 사용하세요.

## 3. GitHub를 통해 Vercel에 올리기

1. GitHub에서 `free-diving-homepage`라는 빈 저장소를 만듭니다. README나 `.gitignore` 자동 생성 옵션은 선택하지 마세요.
2. 이 폴더에서 아래 명령을 실행하고 `<사용자명>`을 자신의 GitHub 사용자명으로 바꿉니다.

```powershell
git add .
git commit -m "Initial free diving homepage"
git branch -M main
git remote add origin https://github.com/<사용자명>/free-diving-homepage.git
git push -u origin main
```

3. [Vercel 대시보드](https://vercel.com/new)에서 **Add New → Project**를 선택하고 GitHub 저장소를 가져옵니다.
4. Framework Preset이 **Next.js**, Root Directory가 저장소 루트인지 확인한 후 **Deploy**를 누릅니다.
5. 배포가 끝나면 Vercel이 제공하는 URL을 브라우저에서 엽니다. 이후 GitHub에 변경 사항을 push하면 새 배포가 만들어집니다.

## 공개 전에 수정할 내용

- `app/page.js`의 `hello@example.com`은 예시 주소입니다. 실제 교육 문의 이메일로 바꾸세요.
- 히어로와 갤러리 배경은 외부 Unsplash 이미지 URL을 사용합니다. 운영용 사진으로 교체할 수 있습니다.
