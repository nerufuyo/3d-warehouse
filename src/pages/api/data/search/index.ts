import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse, HttpError } from 'types/apiResponse';
import { SheetContent } from 'types/spreadsheets/contents';
import { CacheControl, EnumSheets } from 'types/spreadsheets/enum';
import { SheetPages } from 'types/spreadsheets/pages';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { keyword, page: _page }: Partial<{ keyword: string; page: string }> =
      req.query;
    if (!keyword) {
      throw new HttpError('Keyword is required', 400);
    }
    const page: number = Number(_page ?? '1');
    const itemsPerPage: number = 8;

    const limit = page * itemsPerPage;
    const offset = limit - itemsPerPage;

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

        if (
          !object.Name.toLowerCase().includes(keyword) ||
          !object.Brand.toLowerCase().includes(keyword)
        )
          return undefined;

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

    const totalRows = data.length;
    const totalPages = Math.ceil(totalRows / itemsPerPage);

    if (page > totalPages && totalPages !== 0) {
      const payload: APIResponse<SheetContent[]> = {
        timestamp: new Date().toISOString(),
        data: [],
      };
      return res.status(404).json(payload);
    }

    const paginatedData: SheetContent[] = data.slice(offset, limit);

    const payload: APIResponse<SheetContent[]> = {
      timestamp: new Date().toISOString(),
      data: paginatedData,
      pagination: {
        currentPage: page,
        totalItems: totalRows,
        totalPages,
        isNextPage: page < totalPages,
        isPrevPage: page > 1,
      },
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
