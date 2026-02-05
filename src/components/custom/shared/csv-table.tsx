import type { FC } from "react";

import React from "react";

interface CSVTableProps {
  data: Record<string, string>[];
  headers: string[];
  title?: string;
}

export const CSVTable: FC<CSVTableProps> = ({ data, headers, title }) => (
  <div className="border-border bg-card my-8 w-full overflow-hidden rounded-xl border shadow-sm">
    {title && (
      <div className="border-border bg-muted/50 border-b px-6 py-4">
        <h3 className="text-foreground text-lg font-semibold tracking-tight">{title}</h3>
      </div>
    )}
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-muted/50">
          <tr>
            {headers.map((header) => (
              <th
                className="text-muted-foreground px-6 py-3 font-semibold whitespace-nowrap first:pl-6 last:pr-6"
                key={header}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {data.map((row, rowIndex) => (
            <tr className="hover:bg-muted/30 transition-colors" key={rowIndex}>
              {headers.map((header) => (
                <td
                  className="text-foreground px-6 py-3 whitespace-nowrap first:pl-6 last:pr-6"
                  key={`${rowIndex}-${header}`}
                >
                  {row[header]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
