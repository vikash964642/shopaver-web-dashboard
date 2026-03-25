import { Component, OnInit, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LandingService } from '../landing.service';
import { ToastrService } from 'ngx-toastr';

interface PageCard {
  slug: string;
  title: string;
  description: string;
  preview_image: string;
}

@Component({
  selector: 'app-list-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './list-component.html',
  styleUrls: ['./list-component.scss'],
})
export class ListComponent implements OnInit {
 pageCards: PageCard[] = [];
  isLoading: boolean = false;
  errorMsg: string = '';

  constructor(
    private router: Router,
    private landingService: LandingService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    
  ) {}

 

  goTo(path: string) {
  this.router.navigate([path]);
}
  ngOnInit(): void {
    this.loadPageCards();
  }

  // ✅ ADD THIS METHOD
  openForEdit(slug: string) {
    console.log('Redirecting with slug:', slug);
    this.router.navigate(['/create-landing-page', slug]);
  }

 


loadPageCards(page: number = 1, pageSize: number = 10, search: string = ''): void {
    this.isLoading = true;
    this.errorMsg = '';

    const payload = {
      search,
      page: page.toString(),
      pageSize: pageSize.toString(),
    };

    this.landingService.getSlugList(payload).subscribe({
      next: (res: any) => {
        const baseUrl = 'https://media-shopaver-uat.s3.amazonaws.com';

        if (res?.data && Array.isArray(res.data)) {
          this.pageCards = res.data.map((item: any) => {
            const slugData = Array.isArray(item.slugListData) ? item.slugListData[0] : {};
            return {
              slug: item.slug || '',
              title: slugData.heading || 'No Title',
              description: slugData.description || 'No Description',
              preview_image: slugData.image
                ? slugData.image.startsWith('http')
                  ? slugData.image
                  : `${baseUrl}${slugData.image.startsWith('/') ? '' : '/'}${slugData.image}`
                : 'assets/default-image.png', // fallback image
            };
          });
        } else {
          this.pageCards = [];
          this.errorMsg = 'No pages available';
        }

        this.cdr.detectChanges(); // force template update after async call
      },
      error: (err) => {
        console.error('Error loading page cards:', err);
        this.pageCards = [];
        this.errorMsg = 'Failed to load pages';
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  deletePage(slug: string) {
    const confirmDelete = confirm('Are you sure you want to delete this page?');

    if (!confirmDelete) return;

    this.landingService.deleteLandingPage(slug).subscribe({
      next: () => {
        console.log('Page Deleted');
this.toastr.success('Page deleted successfully ✅');
        this.pageCards = this.pageCards.filter((page) => page.slug !== slug);
        this.loadPageCards(); 
      },

      error: (err) => {
        console.error('Delete Error', err);
        this.toastr.error('Failed to delete page ❌');
      },
    });
  }
}
