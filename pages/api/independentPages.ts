// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import run from '../../src/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const query = req.query;
    const [ titlePropertyName, entryPageTitle, databaseId ] = [
      query.titlePropertyName as string,
      query.entryPageTitle as string,
      query.databaseId as string,
    ];
    const data = await run({
      titlePropertyName, entryPageTitle, databaseId
    });
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(error);
    return res.status(error.status || 500).end(error.message);
  }
}
