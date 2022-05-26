import type { NextPage } from "next";
import { FormEvent, useState } from "react";
import styles from "../styles/Home.module.css";
import { InfoListType } from "../types/types";

const Home: NextPage = () => {
  const [databaseId, setDatabaseId] = useState(
    "5e04401d79294b1592664dafcca583ea"
  );
  const [entryPageTitle, setEntryPageTitle] = useState("1st page");
  const [titlePropertyName, setTitlePropertyName] = useState("이름");
  const [independentPages, setIndependentPages] = useState<InfoListType[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: FormEvent) => {
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
  };

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
            onChange={(e) => setDatabaseId(e.target.value)}
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
            onChange={(e) => setEntryPageTitle(e.target.value)}
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
            onChange={(e) => setTitlePropertyName(e.target.value)}
            value={titlePropertyName}
            placeholder="enter title property's name"
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "loading..." : "find independent pages"}
        </button>
      </form>
      {independentPages.length > 0 && (
        <ul className={styles.list}>
          {independentPages.map(({ href, title }) => (
            <li key={href}>
              <a href={href} rel="noopener noreferrer" target="_blank">{title}</a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Home;
