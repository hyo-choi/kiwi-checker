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

export type FetcherType<T, U> = (args: T) => Promise<U>;

export type PaginatedResponseType = {
  results: any;
  has_more: boolean;
  next_cursor: string | null;
}
