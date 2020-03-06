import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExportXLSX {
  constructor() { }

  download_csv(csv, filename) {
    let csvFile, downloadLink;

    // CSV FILE
    csvFile = new Blob([csv], {type: 'text/csv'});

    // Download link
    downloadLink = document.createElement('a');

    // File name
    downloadLink.download = `${filename}.csv`;

    // We have to create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Make sure that the link is not displayed
    downloadLink.style.display = 'none';

    // Add the link to your DOM
    document.body.appendChild(downloadLink);

    // Lanzamos
    downloadLink.click();
  }

  export_table_to_csv(html, filename) {
    const csv = [];
    const rows = html.querySelectorAll('tr');

    for (let i = 0; i < rows.length; i++) {
      const row = [], cols = rows[i].querySelectorAll('td, th');
        for (let j = 0; j < cols.length; j++) {
          row.push(cols[j].innerHTML);
        }
      csv.push(row.join(','));
    }
    // Download CSV
    this.download_csv(csv.join('\n'), filename);
  }

  exportAsXLSX(html, filename) {
    this.export_table_to_csv(html, filename);
  }
}
