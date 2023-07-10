export enum EnumSheets {
  Contributors = 'Meta.Contributors',
  Settings = 'Meta.WebSettings',
  Pages = 'Meta.Pages',
  Partners = 'Meta.Partners',
  Content = 'Contents',
  Inquiry = 'Inquiry',
}

export const CacheControl =
  'public, max-age=1800, s-maxage=1800, stale-while-revalidate=1800'; // Convert to 30 minutes
