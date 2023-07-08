import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse } from 'types/apiResponse';
import { EnumSheets } from 'types/spreadsheets/enum';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Settings];
    const rows = await sheet.getRows();

    const data = rows
      .map((row) => {
        const object = row.toObject();
        if (object.Key !== 'isMaintenance') return undefined;

        return {
          key: object.Key,
          value: object.Value ?? null,
        };
      })
      .filter((value) => value !== undefined)[0] as {
      key: string;
      value: string;
    };

    const payload: APIResponse<any> = {
      timestamp: new Date().toISOString(),
      data: data['value'] === 'TRUE',
    };

    res.setHeader('Cache-Control', 'no-cache');
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
