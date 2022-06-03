# notion wiki dependency checker

노션에서 database를 기반으로 작성한 위키가 entry page를 통해 접근 가능한지 확인해줍니다.

`git clone && yarn` 후 아래 환경변수들을 세팅해주고 `yarn dev`를 실행시키면 됩니다.<br/>(`.env.local`에 환경변수를 등록하거나 vercel 등에 환경변수를 세팅하는 등)

```javascript
// required
NEXT_PUBLIC_NOTION_KEY=notion integration key
// optional (설정시 input의 default value로 사용됩니다)
NEXT_PUBLIC_NOTION_DATABASE_ID=database page url path (do not include parameters)
NEXT_PUBLIC_NOTION_ENTRY_PAGE_TITLE=entry page title (need to be unique in wiki)
NEXT_PUBLIC_NOTION_TITLE_PROPERTY_NAME=title field name in database
```
