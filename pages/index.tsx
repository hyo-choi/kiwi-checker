import type { NextPage } from "next";
import { ChangeEvent, FormEvent, useCallback, useState } from "react";
import styles from "../styles/Home.module.css";
import { InfoListType, RunType } from "../types";

const Home: NextPage = () => {
  const [information, setInformation] = useState<RunType>({
    titlePropertyName: "이름",
    entryPageTitle: "1st page",
    databaseId: "5e04401d79294b1592664dafcca583ea",
  });
  const { databaseId, entryPageTitle, titlePropertyName } = information;
  const [independentPages, setIndependentPages] = useState<InfoListType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      const getData = async () => {
        setIsLoading(true);
        const data = await fetch(
          `/api/independentPages?databaseId=${databaseId}&entryPageTitle=${entryPageTitle}&titlePropertyName=${titlePropertyName}`
        );
        const json = await data.json();
        setIndependentPages(json);
        setIsLoading(false);
      };
      getData();
    },
    [databaseId, entryPageTitle, titlePropertyName]
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
        <div className={styles.formDiv}>
          <label htmlFor="database-id">database id </label>
          <input
            id="database-id"
            name="databaseId"
            type="text"
            required
            onChange={handleChange}
            value={databaseId}
            placeholder="enter database id"
          />
        </div>
        <div className={styles.formDiv}>
          <label htmlFor="entry-page-title">entry page title </label>
          <input
            id="entry-page-title"
            name="entryPageTitle"
            type="text"
            required
            onChange={handleChange}
            value={entryPageTitle}
            placeholder="enter entry page's title"
          />
        </div>
        <div className={styles.formDiv}>
          <label htmlFor="title-property-name">title property name </label>
          <input
            id="title-property-name"
            name="titlePropertyName"
            type="text"
            required
            onChange={handleChange}
            value={titlePropertyName}
            placeholder="enter title property's name"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "loading..." : "find independent pages"}
        </button>
      </form>
      {independentPages.length > 0 && (
        <div>
          <h2>list</h2>
          <ul className={styles.list}>
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
