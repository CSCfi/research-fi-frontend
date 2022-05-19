export type TableColumn = {
  key: string;
  label: string;
  mobile: boolean;
  tooltip?: string;
  columnSize?: number;
};

export type TableRowItem = { label: any; link?: string };
