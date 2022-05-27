import type { NextPage } from 'next';
import {
  ChangeEvent, FormEvent, useCallback, useState,
} from 'react';
import styles from '../styles/Home.module.css';
import { InfoListType, RunType } from '../src/types';
import { NOTION_DATA_BASE_ID, NOTION_ENTRY_PAGE_TITLE, NOTION_TITLE_PROPERTY_NAME } from '../src/constants';

const info: RunType = {
  titlePropertyName: NOTION_TITLE_PROPERTY_NAME ?? '',
  entryPageTitle: NOTION_ENTRY_PAGE_TITLE ?? '',
  databaseId: NOTION_DATA_BASE_ID ?? '',
};

const Home: NextPage = () => {
  const [information, setInformation] = useState<RunType>(info);
  const [independentPages, setIndependentPages] = useState<InfoListType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { databaseId, entryPageTitle, titlePropertyName } = information;

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const getData = async () => {
        setIsLoading(true);
        const data = await fetch(
          `/api/independentPages?databaseId=${databaseId}&entryPageTitle=${entryPageTitle}&titlePropertyName=${titlePropertyName}`,
        );
        const json = await data.json();
        setIndependentPages(json);
        setIsLoading(false);
      };
      getData();
    },
    [information],
  );

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;
    setInformation((prev) => ({ ...prev, [name]: value }));
  }, []);

  return (
    <div className={styles.home}>
      <h1>🥝 kiwi checker</h1>
      <p>entry와 연결되어있지 않은 문서들을 찾아줍니다.</p>
      <form
        className={styles.form}
        method="get"
        action="/api/independentPages"
        onSubmit={handleSubmit}
      >
        {Object.keys(information).map((key) => (
          <div key={key} className={styles.formDiv}>
            <label htmlFor={key}>
              {key}
              {' '}
            </label>
            <input
              id={key}
              name={key}
              type="text"
              required
              onChange={handleChange}
              value={information[key as keyof RunType]}
              placeholder={`enter ${key}`}
            />
          </div>
        ))}
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'loading...' : 'find independent pages'}
        </button>
      </form>
      {independentPages && (
        <div>
          <h2>list</h2>
          <ul className={styles.list}>
            {independentPages.length === 0 && <li>no independent page</li>}
            {independentPages.map(({ href, title }) => (
              <li key={href}>
                <a href={href} rel="noopener noreferrer" target="_blank">
                  {title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Home;
