import { cn } from "../../utils/helpers";

/**
 * Column-driven table.
 * `columns: [{ key, header, render?, className?, headerClassName? }]`
 */
export default function Table({ columns, rows, rowKey = "id", empty, className }) {
  if (!rows?.length && empty) return empty;

  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)}>
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                className={cn(
                  "h-11 whitespace-nowrap px-4 text-left align-middle text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  column.headerClassName,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row[rowKey]}
              className="border-b border-border last:border-b-0 hover:bg-muted/40"
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn("px-4 py-3 align-middle", column.className)}
                >
                  {column.render ? column.render(row) : row[column.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
