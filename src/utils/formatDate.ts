const formatter = new Intl.DateTimeFormat('en', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});

function formatDate(date: Date): string {
  return formatter.format(date);
}

export default formatDate;
