export type InfoListType = {
  id: string,
  title: string,
  isEntry: boolean,
  isVisited: boolean,
  mentions: string[],
  href: string,
};

export type RunType = {
  titlePropertyName: string,
  entryPageTitle: string,
  databaseId: string,
}
