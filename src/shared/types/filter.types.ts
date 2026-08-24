// TODO: Expand with full filter options (category, type, amount range, etc.)

export interface DateRangeFilter {
  startDate: string | null; // ISO 8601
  endDate: string | null;   // ISO 8601
}
