import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingService } from '../landing.service';
import { HttpClientModule } from '@angular/common/http';
import { Subscription } from 'rxjs';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-form-data',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf, HttpClientModule],
  templateUrl: './form-data.html',
  styleUrls: ['./form-data.scss'],
})
export class FormData implements OnInit, OnDestroy {

  constructor(
    private router: Router,
    private landingService: LandingService,
    private toastr: ToastrService,
  ) {}

  // =========================
  // STATE
  // =========================
  formData: any[] = [];
  searchText: string = '';
  page: number = 1;
  pageSize: number = 10;
  isLoading = false;

  logout() {
  localStorage.removeItem('authToken');
  this.router.navigate(['/login']);
  this.toastr.success('Logout successfully ✅');

}
  // =========================
  // INTERNAL HANDLING
  // =========================
  searchTimeout: any;
  apiSub!: Subscription;
  lastSearch: string = '';

  // =========================
  // NAVIGATION
  // =========================
  goTo(path: string) {
    this.router.navigate([path]);
  }

  // =========================
  // API CALL
  // =========================
  getFormData() {
    const payload = {
      search: this.searchText?.trim() || '',
      page: this.page.toString(),
      pageSize: this.pageSize.toString(),
    };

    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }

    this.isLoading = true;

    this.apiSub = this.landingService.getAllSlugData(payload).subscribe({
      next: (res: any) => {
        this.formData = res?.data || [];
        this.isLoading = false;
      },
      error: () => {
        this.formData = [];
        this.isLoading = false;
      }
    });
  }

  // =========================
  // SEARCH (Debounce)
  // =========================
  onSearchChange() {
    clearTimeout(this.searchTimeout);

    this.searchTimeout = setTimeout(() => {
      const currentSearch = this.searchText?.trim() || '';

      if (this.lastSearch === currentSearch) return;

      this.lastSearch = currentSearch;
      this.page = 1;

      this.getFormData();

    }, 400);
  }

  // =========================
  // PAGINATION
  // =========================
  nextPage() {
    this.page++;
    this.getFormData();
  }

  prevPage() {
    if (this.page > 1) {
      this.page--;
      this.getFormData();
    }
  }

  // =========================
  // EXCEL EXPORT ✅ FIXED
  // =========================
  exportToExcel() {
    if (!this.formData || this.formData.length === 0) {
      alert('No data to export');
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Form Data');

    // Header
    worksheet.columns = [
      { header: 'S.No', key: 'sno', width: 8 },
      { header: 'Name', key: 'name', width: 20 },
      { header: 'Contact', key: 'contact', width: 15 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Email', key: 'email', width: 25 },
      { header: 'Slug', key: 'slug', width: 20 },
      { header: 'Message', key: 'message', width: 40 },
    ];

    // Data
    this.formData.forEach((item, index) => {
      worksheet.addRow({
        sno: index + 1,
        name: item.name,
        contact: item.contact,
        company: item.company,
        email: item.businessEmail,
        slug: item.slug,
        message: item.message,
      });
    });

    // Header style
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '6A00FF' },
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    // Borders
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left' };
      });
    });

    // Download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      saveAs(blob, `FormData_${new Date().getTime()}.xlsx`);
    });
  }

  // =========================
  // LIFECYCLE
  // =========================
  ngOnInit() {
    this.getFormData();
  }

  ngOnDestroy() {
    if (this.apiSub) {
      this.apiSub.unsubscribe();
    }
  }
}