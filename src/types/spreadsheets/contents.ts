import { SheetPages } from 'types/spreadsheets/pages';

export interface SheetContent {
  id: string;
  pageKey: string;
  pages: SheetPages;
  name: string;
  brand: string;
  format: string[];
  download: string;
  image: string;
  date: string;
  uploader: string;
}
