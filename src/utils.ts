import { Client } from '@notionhq/client';
import { QueryDatabaseResponse } from '@notionhq/client/build/src/api-endpoints';
import { NOTION_KEY } from './constants';
import { InfoListType, RunType } from './types';

const notion = new Client({ auth: NOTION_KEY });

const fetchPagesFromDB = async (databaseId: string): Promise<QueryDatabaseResponse['results']> => {
  const response: QueryDatabaseResponse = await notion.databases.query({
    database_id: databaseId,
  });
  return response.results;
};

const fetchBlockChildren = async (pageId: string) => {
  const response = await notion.blocks.children.list({ block_id: pageId });
  const mentions = response.results
    .map((block: any) => {
      if (!block?.type) {
        console.log(block);
      }
      return block[block?.type]?.rich_text
    })
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
  titlePropertyName, entryPageTitle, databaseId
}: RunType) => {
  const isPageTitleValid = (page: any) => {
    return (page as any).properties[titlePropertyName]?.type === 'title';
  };

  const getPageTitle = (page: any): string => {
    return (page as any).properties[titlePropertyName]?.title[0].text.content;
  };

  const pages = await fetchPagesFromDB(databaseId);
  const infoList: {[x: string]: InfoListType} = {};
  let entryPageInfo: InfoListType;
  if (!pages.length || !isPageTitleValid(pages[0])) {
    throw new Error('Invalid title property name');
  }
  const pageList = pages
    .map((page) => ({ id: page.id, title: getPageTitle(page), href: (page as any).url }));
  if (pageList.every(({ title }) => title !== entryPageTitle)) {
    throw new Error('Entry page not found');
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
  const mentionList = await Promise.all(pageList.map(({ id }) => fetchBlockChildren(id)));
  mentionList.forEach(({ pageId, mentions }) => infoList[pageId].mentions.push(...mentions));
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
