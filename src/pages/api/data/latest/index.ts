import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse } from 'types/apiResponse';
import { SheetContent } from 'types/spreadsheets/contents';
import { CacheControl, EnumSheets } from 'types/spreadsheets/enum';
import { SheetPages } from 'types/spreadsheets/pages';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const itemsPerPage: number = 4;

    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Content];
    const pageSheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Pages];

    const rows = await sheet.getRows();
    const pagesRows = await pageSheet.getRows();

    const pages: SheetPages[] = pagesRows
      .map((row) => {
        const object = row.toObject();
        if (!object.Key || !object.Name) return undefined;

        return {
          key: object.Key,
          name: object.Name,
          description: object.Description ?? null,
          image: object.Image ?? null,
        };
      })
      .filter((value) => value !== undefined) as SheetPages[];

    const data: SheetContent[] = rows
      .map((row) => {
        const object = row.toObject();
        if (
          !object.ID ||
          !object.Name ||
          !object.PageKey ||
          !object.Brand ||
          !object.Format ||
          !object.Download ||
          !object.Image ||
          !object.Date ||
          !object.Uploader
        )
          return undefined;
        const pagesData = pages.find((page) => page.key === object.PageKey);
        if (!pagesData) return undefined;

        return {
          id: object.ID,
          pageKey: object.PageKey,
          name: object.Name,
          brand: object.Brand,
          format:
            object.Format.split(',').map((format: string) => format.trim()) ??
            [],
          download: object.Download,
          image: object.Image,
          date: object.Date,
          uploader: object.Uploader,
          pages: pagesData,
        };
      })
      .filter((value) => value !== undefined)
      .sort((a, b) => b?.id - a?.id) as SheetContent[];

    const paginatedData = data.slice(0, itemsPerPage);

    const payload: APIResponse<SheetContent[]> = {
      timestamp: new Date().toISOString(),
      data: paginatedData,
    };

    res.setHeader('Cache-Control', CacheControl);
    return res.status(200).json(payload);
  } catch (error: any) {
    const payload: APIResponse = {
      timestamp: new Date().toISOString(),
      data: undefined,
      error: {
        message: error.message,
        cause: error.cause,
        stack:
          process.env.NODE_ENV === 'development'
            ? error.stack ?? null
            : undefined,
      },
    };

    return res.status(error.code ?? 500).json(payload);
  }
}

export default handler;
