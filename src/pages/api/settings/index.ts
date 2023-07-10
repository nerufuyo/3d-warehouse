import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse } from 'types/apiResponse';
import { CacheControl, EnumSheets } from 'types/spreadsheets/enum';
import { SheetSettings } from 'types/spreadsheets/settings';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Settings];
    const rows = await sheet.getRows();

    const rowsData = rows.map((row) => {
      const object = row.toObject();

      return {
        key: object.Key,
        value: object.Value ?? null,
      };
    });

    const data = Object.fromEntries(
      rowsData.map((row) => [row.key, row.value]),
    ) satisfies SheetSettings;
    data.isMaintenance = undefined;

    const payload: APIResponse<SheetSettings> = {
      timestamp: new Date().toISOString(),
      data: data,
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
