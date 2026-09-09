// CSV and JSON download controls for a data table. Kept deliberately plain so
// it can sit inside any panel header without competing with the data.
import { exportCsv, exportJson, type ExportColumn, type ExportMeta } from "@/lib/export-data";

type Props<T> = {
  rows: T[];
  columns: ExportColumn<T>[];
  meta: ExportMeta;
  label?: string;
};

export function ExportButtons<T>({ rows, columns, meta, label = "Download" }: Props<T>) {
  const empty = rows.length === 0;
  return (
    <div className="export-buttons">
      <span className="export-label">{label}</span>
      <button
        type="button"
        className="btn btn-sm"
        disabled={empty}
        onClick={() => exportCsv(rows, columns, meta)}
      >
        CSV
      </button>
      <button
        type="button"
        className="btn btn-sm"
        disabled={empty}
        onClick={() => exportJson(rows, columns, meta)}
      >
        JSON
      </button>
    </div>
  );
}
