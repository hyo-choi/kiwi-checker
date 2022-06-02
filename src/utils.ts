import { Client } from "@notionhq/client";
import {
  ListBlockChildrenResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { NOTION_KEY } from "./constants";
import {
  FetcherType,
  InfoListType,
  PaginatedResponseType,
  RunType,
} from "./types";

const notion = new Client({ auth: NOTION_KEY });

const getAllResultFromPaginatedNotionAPI = async (
  fetcher: FetcherType<any, PaginatedResponseType>
) => {
  let cursor: string | null = null;
  const results = [];
  do {
    const response: PaginatedResponseType = await fetcher(cursor);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : null;
  } while (cursor);
  return results;
};

const makeMentionListFromBlockChildren = (
  pageId: string,
  list: ListBlockChildrenResponse[]
) => {
  const mentions = list
    .map((block: any) => block[block?.type]?.rich_text)
    .filter((richText) => !!richText)
    .flat()
    .filter(
      (richText) =>
        richText.type === "mention" && richText.mention.type === "page"
    )
    .map((richText) => richText.mention.page.id);
  return {
    pageId,
    mentions,
  };
};

const run = async ({
  titlePropertyName,
  entryPageTitle,
  databaseId,
}: RunType) => {
  const isPageTitleValid = (page: any) => {
    return (page as any).properties[titlePropertyName]?.type === "title";
  };

  const getPageTitle = (page: any): string => {
    return (
      (page as any).properties[titlePropertyName]?.title[0]?.text.content ??
      "제목 없는 문서"
    );
  };

  const pageFromDBFetcher = async (
    start_cursor: string
  ): Promise<QueryDatabaseResponse> => {
    if (start_cursor) {
      const response: QueryDatabaseResponse = await notion.databases.query({
        database_id: databaseId,
        start_cursor,
      });
      return response;
    }
    const response: QueryDatabaseResponse = await notion.databases.query({
      database_id: databaseId,
    });
    return response;
  };

  const pages = await getAllResultFromPaginatedNotionAPI(pageFromDBFetcher);
  const infoList: { [x: string]: InfoListType } = {};
  let entryPageInfo: InfoListType;
  if (!pages.length || !isPageTitleValid(pages[0])) {
    throw new Error("Invalid title property name");
  }
  const pageList = pages.map((page) => ({
    id: page.id,
    title: getPageTitle(page),
    href: (page as any).url,
  }));
  if (pageList.every(({ title }) => title !== entryPageTitle)) {
    throw new Error("Entry page not found");
  }
  pageList.forEach(({ id, title, href }) => {
    const isEntry = title === entryPageTitle;
    infoList[id] = {
      id,
      title,
      isEntry,
      isVisited: false,
      mentions: [],
      href,
    };
    if (isEntry) {
      entryPageInfo = infoList[id];
    }
  });
  const mentionList = await Promise.all(
    pageList.map(async ({ id: pageId }) => {
      const blockChildrenFetcher: FetcherType<
        string,
        ListBlockChildrenResponse
      > = async (start_cursor: string) => {
        if (start_cursor) {
          const response = await notion.blocks.children.list({
            block_id: pageId,
            start_cursor,
          });
          return response;
        }
        const response = await notion.blocks.children.list({
          block_id: pageId,
        });
        return response;
      };
      const blockChildrenList = await getAllResultFromPaginatedNotionAPI(
        blockChildrenFetcher
      );
      return makeMentionListFromBlockChildren(pageId, blockChildrenList);
    })
  );
  mentionList.forEach(({ pageId, mentions }) =>
    infoList[pageId].mentions.push(...mentions)
  );
  function findIndependentPages() {
    const toVisit: string[] = [];

    entryPageInfo.isVisited = true;
    toVisit.push(...entryPageInfo.mentions);

    while (toVisit.length) {
      const pageId = toVisit.shift()!;
      if (infoList[pageId] && !infoList[pageId].isVisited) {
        infoList[pageId].isVisited = true;
        toVisit.push(...infoList[pageId].mentions);
      }
    }
    return Object.values(infoList).filter(({ isVisited }) => !isVisited);
  }
  const independentPages = findIndependentPages();
  return independentPages;
};

export default run;
