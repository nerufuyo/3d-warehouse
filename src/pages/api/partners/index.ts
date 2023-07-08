import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse } from 'types/apiResponse';
import { EnumSheets } from 'types/spreadsheets/enum';
import { SheetPartner } from 'types/spreadsheets/partners';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Partners];
    const rows = await sheet.getRows();

    const data: SheetPartner[] = rows
      .map((row) => {
        const object = row.toObject();
        if (!object.Name || !object.Banner) return undefined;

        return {
          name: object.Name,
          banner: object.Banner,
          link: object.Link,
        };
      })
      .filter((value) => value !== undefined) as SheetPartner[];

    const payload: APIResponse<SheetPartner[]> = {
      timestamp: new Date().toISOString(),
      data: data,
    };

    res.setHeader(
      'Cache-Control',
      'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    );
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
