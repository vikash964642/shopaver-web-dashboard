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
  selector: 'app-deleted-slugs',
 imports: [CommonModule, RouterModule],
    standalone: true,
  templateUrl: './deleted-slugs.html',
  styleUrl: './deleted-slugs.scss',
})
export class DeletedSlugs {
  pageCards: PageCard[] = [];
  isLoading: boolean = false;
  errorMsg: string = '';

  constructor(
    private router: Router,
    private landingService: LandingService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    
  ) {}
isActiveRoute(route: string): boolean {
  return this.router.url === route;
}
   logout() {
  localStorage.removeItem('authToken');
  this.router.navigate(['/login']);
  this.toastr.success('Logout successfully ✅');
}

  goTo(path: string) {
  this.router.navigate([path]);
}
  ngOnInit(): void {
    this.loadPageCards();
  }

 

 


loadPageCards(page: number = 1, pageSize: number = 1000, search: string = ''): void {
    this.isLoading = true;
    this.errorMsg = '';

    const payload = {
      search,
      page: page.toString(),
      pageSize: pageSize.toString(),
    };

    this.landingService.getAllDeletedSlugs(payload).subscribe({
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

 showRetrieveModal = false;
selectedSlug: string | null = null;

openRetrieveModal(slug: string) {
  if (!slug) return;
  this.selectedSlug = slug;
  this.showRetrieveModal = true;
   document.body.style.overflow = 'hidden';
  this.cdr.detectChanges();
}

confirmRetrieve() {
  if (this.selectedSlug) {
    this.retrivePage(this.selectedSlug);
  }
  this.cancelRetrieve();
}

cancelRetrieve() {
  this.showRetrieveModal = false;
  this.selectedSlug = null;
  document.body.style.overflow = 'auto';
   this.cdr.detectChanges();
}


retrivePage(slug: string) {
  this.landingService.deleteLandingPage(slug, true).subscribe({
    next: () => {
      this.toastr.success('Page retrieve successfully ✅');
this.loadPageCards();
      this.pageCards = this.pageCards.filter(
        (page) => page.slug !== slug
      );
    },
    error: () => {
      this.toastr.error('Delete failed ❌');
    },
  });
}

}
