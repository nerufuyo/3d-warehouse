import { GoogleSpreadsheet } from 'google-spreadsheet';

import googleAuth from './googleAuth';

const ss = new GoogleSpreadsheet(
  process.env.GOOGLE_SHEET_ID as string,
  googleAuth,
);

export default ss;
