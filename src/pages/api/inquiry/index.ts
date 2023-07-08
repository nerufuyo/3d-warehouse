import { NextApiRequest, NextApiResponse } from 'next';

import googleSpreadsheets from 'utils/googleSpreadsheets';

import { APIResponse, HttpError } from 'types/apiResponse';
import { EnumSheets } from 'types/spreadsheets/enum';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const inquiryCookie = req.cookies['inquiry'];
    if (!inquiryCookie) throw new HttpError('Request is not allowed', 401);
    const totalTry = parseInt(inquiryCookie ?? '0');
    if (totalTry > 3) {
      throw new HttpError(
        'You have reached the maximum number of inquiries. Please try again tomorrow.',
        429,
      );
    }

    const {
      name,
      email,
      subject,
      message,
    }: Partial<{
      name: string;
      email: string;
      subject: string;
      message: string;
    }> = req.body;

    if (!name || !email || !subject || !message)
      throw new HttpError('All fields are required', 400);

    await googleSpreadsheets.loadInfo();
    const sheet = googleSpreadsheets.sheetsByTitle[EnumSheets.Inquiry];
    await sheet.addRow({
      Name: name,
      Email: email,
      Subject: subject,
      Message: message,
    });

    const cookieExpire = new Date(
      Date.now() + 12 * 60 * 60 * 1000,
    ).toUTCString();

    const payload: APIResponse = {
      timestamp: new Date().toISOString(),
      data: undefined,
    };

    res.setHeader(
      'Set-Cookie',
      `inquiry=${
        totalTry + 1
      }; path=/; expires=${cookieExpire}; SameSite=Strict`,
    );
    return res.status(201).json(payload);
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
