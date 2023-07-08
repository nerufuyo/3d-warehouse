import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse, HttpError } from 'types/apiResponse';
import { EnumSheets } from 'types/spreadsheets/enum';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { password }: Partial<{ password: string }> = req.body;
    if (!password) throw new HttpError('Password is required', 400);

    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Settings];
    const rows = await sheet.getRows();
    const passwordRow = rows
      .find((row) => {
        const object = row.toObject();
        return object.Key === 'globalPassword';
      })
      ?.get('Value');

    if (password !== passwordRow)
      throw new HttpError('Password is incorrect', 400);

    const cookieExpire = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    ).toUTCString();

    const payload: APIResponse<boolean> = {
      timestamp: new Date().toISOString(),
      data: true,
    };

    res.setHeader(
      'Set-Cookie',
      `contributor_globalPassword=1; path=/; expires=${cookieExpire}; SameSite=Strict`,
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
