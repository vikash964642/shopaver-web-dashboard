import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LandingService } from '../landing.service';
import { ToastrService } from 'ngx-toastr';

interface FAQ {
  question: string;
  answer: string;
}

interface AllInOneCard {
  heading: string;
  subHeading: string;
  paragraph: string;
  image: File | null;
  imagePath: string;
  isUploaded?: boolean;
  imageErrorMsg?: string;
}

@Component({
  selector: 'app-create-landing-page',
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink],
  templateUrl: './create-landing-page.html',
  styleUrls: ['./create-landing-page.scss'],
})
export class CreateLandingPage implements OnInit {
  mode: 'create' | 'edit' = 'create';
  pageId!: number;
  isUploaded: boolean = false;

  activeSection: string = 'title';

  baseUrl = 'https://media-shopaver-uat.s3.amazonaws.com';

  constructor(
    private route: ActivatedRoute,
    private landingService: LandingService,
    private cd: ChangeDetectorRef,
    private toastr: ToastrService,
    private router: Router,
  ) { }

  // ===============================
  // FORM DATA
  // ===============================

  titleData = {
    title: '',
    description: '',
    slug: '',
  };

  heroData = {
    heading: '',
    keyword: '',
    paragraph: '',
    image: null as File | null,
    imagePath: '',
  };

  whyChooseUsData = {
    heading: '',
    paragraph: '',
  };

  allInOneCards: AllInOneCard[] = [
    { heading: '', subHeading: '', paragraph: '', image: null as File | null, imagePath: '' },
  ];

  faqs: FAQ[] = [{ question: '', answer: '' }];

  // ===============================
  // INIT
  // ===============================

  slug: string | null = null;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');

      if (slug) {
        this.mode = 'edit';
        this.slug = slug;

        this.loadPageBySlug(slug);
        this.loadFaqBySlug(slug);
      }
    });
  }
  slugError: string = '';

  checkSlugAndNext() {
    // Validate title section first
    if (!this.validateSection('title')) return;

    const slug = this.titleData.slug?.trim();
    if (!slug) {
      this.titleErrors.slug = true;
      return;
    }

    const payload = { search: slug, page: '1', pageSize: '10' };

    this.landingService.getSlugList(payload).subscribe({
      next: (res: any) => {
        const existingSlugs: string[] = (res.data || []).map((item: any) => item.slug);

        // Allow same slug in edit mode
        if (this.mode === 'edit' && slug === this.slug) {
          this.slugError = '';
          this.activeSection = 'hero';
          return;
        }

        if (existingSlugs.includes(slug)) {
          this.slugError = 'This slug is already taken. Choose another one.';
          this.titleErrors.slug = true;
        } else {
          this.slugError = '';
          this.activeSection = 'hero'; // Go to next section
        }
      },
      error: (err) => {
       
        this.toastr.error('Failed to check slug');
      },
    });
  }
  // ===============================
  // SECTION NAVIGATION
  // ===============================

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  titleValue = '';

  // ===============================
  // LOAD PAGE DATA
  // ===============================

  loadPageBySlug(slug: string): void {
    
    this.landingService.getLandingPageBySlug(slug).subscribe({
      next: (res: any) => {
       

        const data = res?.data || {};

        // ================= TITLE SECTION =================
        this.titleData = {
          title: data.metaTitle || '',
          description: data.metaDescription || '',
          slug: slug,
        };

        // this.titleValue = res.data.metaTitle;

        // ================= HERO SECTION =================
        const bannerImage = data?.bannerSection?.image || '';
        if (bannerImage) {
          this.isUploaded = true;
        }
        this.heroData = {
          ...this.heroData,
          heading: data?.bannerSection?.heading || '',
          paragraph: data?.bannerSection?.description || '',
          keyword: data?.bannerSection?.keyword || '',
          imagePath: bannerImage || '',
        };

        // ================= ALL IN ONE SECTION =================

        this.allInOneCards = (data?.allInOneSection || []).map((item: any) => {
          if (this.allInOneCards.length > 0) {
            this.isUploaded = true;
          }
          const img = item?.image || '';


          return {

            heading: item?.heading || '',
            subHeading: item?.subHeading || '',
            paragraph: item?.description || '',
            image: null,
            imagePath: item?.image || '',
            imageName: img ? img.split('/').pop() : '',
          };
        });

        // ================= WHY CHOOSE SECTION =================
        if (data?.chooseSection?.length) {
          this.whyHeading1 = data.chooseSection[0]?.heading || '';
          this.whyParagraph1 = data.chooseSection[0]?.description || '';

          this.whyHeading2 = data.chooseSection[1]?.heading || '';
          this.whyParagraph2 = data.chooseSection[1]?.description || '';

          this.whyHeading3 = data.chooseSection[2]?.heading || '';
          this.whyParagraph3 = data.chooseSection[2]?.description || '';
        }
        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('Landing API Error:', err);
      },
    });
  }

  gotEmptyFaq = false;
  loadFaqBySlug(slug: string): void {
    this.landingService.getFAQBySlug(slug).subscribe({
      next: (res: any) => {
        const data = res?.data ?? [];

        this.faqs = data
          .flatMap((item: any) => item.faq || [])
          .map((f: any) => ({
            question: f.title ?? '',
            answer: f.description ?? '',
          }));

        if (!this.faqs.length) {
          this.gotEmptyFaq = true;
          this.faqs = [{ question: '', answer: '' }];
        }

        this.cd.detectChanges();
      },

      error: (err) => {
        console.error('FAQ API Error:', err);
      },
    });
  }

  // Component.ts
  imagePreviewUrl: string | null = null;

  onHeroImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.heroData.image = file;

      // Revoke previous blob URL to prevent memory leaks
      if (this.heroData.imagePath) {
        URL.revokeObjectURL(this.heroData.imagePath);
      }

      // Set preview for new image
      this.heroData.imagePath = URL.createObjectURL(file);

      // Reset uploaded flag and errors
      this.isUploaded = false;
      this.heroErrors.image = false;
      this.heroErrors.imageErrorMsg = '';
    }
  }
  onFileSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (file) this.allInOneCards[index].image = file;
  }

  // ===============================
  // ALL IN ONE CARDS
  // ===============================

  addAllInOneCard() {
    this.allInOneCards.push({
      heading: '',
      subHeading: '',
      paragraph: '',
      image: null,
      imagePath: '',
    });
  }

  removeAllInOneCard(index: number) {
    this.allInOneCards.splice(index, 1);
  }

  // ===============================
  // FAQ
  // ===============================

  addFaq() {
    this.faqs.push({ question: '', answer: '' });
  }

  removeFaq(index: number) {
    if (this.faqs.length > 1) {
      this.faqs.splice(index, 1);
    }
  }

  // ===============================
  // CREATE PAYLOAD
  // ===============================

  buildPayload() {
    return {
      slug: this.titleData.slug,
      metaTitle: this.titleData.title,
      metaDescription: this.titleData.description,

      bannerSection: {
        heading: this.heroData.heading,
        description: this.heroData.paragraph,
        keyword: this.heroData.keyword,
        // image: this.heroData.image,
          image: this.heroData.imagePath,
      },

      allInOneSection: this.allInOneCards.map((card) => ({
        heading: card.heading,
        subHeading: card.subHeading,
        Description: card.paragraph,
        image: card.imagePath,
      })),

      chooseSection: [
        {
          heading: this.whyHeading1,
          Description: this.whyParagraph1,
        },
        {
          heading: this.whyHeading2,
          Description: this.whyParagraph2,
        },
        {
          heading: this.whyHeading3,
          Description: this.whyParagraph3,
        },
      ],

      merchantSection: [],
    };
  }

  // In your component.ts
  titleErrors = {
    title: false,
    description: false,
    slug: false,
  };

  heroErrors = {
    heading: false,
    keyword: false,
    paragraph: false,
    image: false,
    imageErrorMsg: '',
  };

  allInOneErrors: {
    heading: boolean;
    subHeading: boolean;
    paragraph: boolean;
    image: boolean;
  }[] = [];
  whyErrors = {
    heading1: false,
    paragraph1: false,
    heading2: false,
    paragraph2: false,
    heading3: false,
    paragraph3: false,
  };
  whyHeading1: string = '';
  whyParagraph1: string = '';

  whyHeading2: string = '';
  whyParagraph2: string = '';

  whyHeading3: string = '';
  whyParagraph3: string = '';
  validateSection(section: string): boolean {
    let isValid = true;

    if (section === 'title') {
      this.titleErrors.title = !this.titleData.title?.trim();
      this.titleErrors.description = !this.titleData.description?.trim();
      this.titleErrors.slug = !this.titleData.slug?.trim();

      isValid = !Object.values(this.titleErrors).includes(true);
    }

    if (section === 'hero') {
      this.heroErrors.heading = !this.heroData.heading?.trim();
      this.heroErrors.keyword = !this.heroData.keyword?.trim();
      this.heroErrors.paragraph = !this.heroData.paragraph?.trim();
      //  this.heroErrors.image = !this.heroData.image;
      // this.heroErrors.image = !(this.heroData.image || this.heroData.imagePath);
      if (!this.heroData.image && !this.heroData.imagePath) {
        // Image not chosen
        this.heroErrors.image = true;
        this.heroErrors.imageErrorMsg = 'Please select an image';
      } else if (this.heroData.image && !this.isUploaded) {
        // Image chosen but not uploaded
        this.heroErrors.image = true;
        this.heroErrors.imageErrorMsg = 'Please upload the image first';
      } else {
        // Image uploaded
        this.heroErrors.image = false;
      }

      isValid = !Object.values(this.heroErrors).includes(true);
    }

    if (section === 'all') {
      this.allInOneCards.forEach((card, i) => {
        if (!this.allInOneErrors[i]) {
          this.allInOneErrors[i] = { heading: false, subHeading: false, paragraph: false, image: false };
        }

        this.allInOneErrors[i].heading = !card.heading?.trim();
        this.allInOneErrors[i].subHeading = !card.subHeading?.trim();
        this.allInOneErrors[i].paragraph = !card.paragraph?.trim();

        // Hero style image validation
        if (!card.image && !card.imagePath) {
          this.allInOneErrors[i].image = true;
          card.imageErrorMsg = 'Please select an image';
        } else if (card.image && !card.isUploaded) {
          this.allInOneErrors[i].image = true;
          card.imageErrorMsg = 'Please upload the image first';
        } else {
          this.allInOneErrors[i].image = false;
          card.imageErrorMsg = '';
        }
      });

      isValid = !this.allInOneErrors.some((e) => e.heading || e.subHeading || e.paragraph || e.image);
    }
    // if (section === 'why') {
    //   this.whyErrors.heading = !this.whyChooseUsData.heading?.trim();
    //   this.whyErrors.paragraph = !this.whyChooseUsData.paragraph?.trim();

    //   isValid = !Object.values(this.whyErrors).includes(true);
    // }
    if (section === 'why') {
      let isValid = true;

      // Card 1
      this.whyErrors.heading1 = !this.whyHeading1?.trim();
      this.whyErrors.paragraph1 = !this.whyParagraph1?.trim();
      if (this.whyErrors.heading1 || this.whyErrors.paragraph1) isValid = false;

      // Card 2
      this.whyErrors.heading2 = !this.whyHeading2?.trim();
      this.whyErrors.paragraph2 = !this.whyParagraph2?.trim();
      if (this.whyErrors.heading2 || this.whyErrors.paragraph2) isValid = false;

      // Card 3
      this.whyErrors.heading3 = !this.whyHeading3?.trim();
      this.whyErrors.paragraph3 = !this.whyParagraph3?.trim();
      if (this.whyErrors.heading3 || this.whyErrors.paragraph3) isValid = false;

      return isValid;
    }
    return isValid;
  }
  nextSection(section: string) {
    if (!this.validateSection(this.activeSection)) {
      return; // Stop if validation fails
    }
    this.activeSection = section;
  }

  prevSection(section: string) {
    this.activeSection = section;
  }
  
  validateWhyChooseUs(): boolean {
    let isValid = true;

    // Card 1
    this.whyErrors.heading1 = !this.whyHeading1?.trim();
    this.whyErrors.paragraph1 = !this.whyParagraph1?.trim();
    if (this.whyErrors.heading1 || this.whyErrors.paragraph1) isValid = false;

    // Card 2
    this.whyErrors.heading2 = !this.whyHeading2?.trim();
    this.whyErrors.paragraph2 = !this.whyParagraph2?.trim();
    if (this.whyErrors.heading2 || this.whyErrors.paragraph2) isValid = false;

    // Card 3
    this.whyErrors.heading3 = !this.whyHeading3?.trim();
    this.whyErrors.paragraph3 = !this.whyParagraph3?.trim();
    if (this.whyErrors.heading3 || this.whyErrors.paragraph3) isValid = false;

    return isValid;
  }
  savePage() {
    if (!this.validateWhyChooseUs()) {
      this.toastr.error('Please fill all fields in the Why Choose Us section');
      this.activeSection = 'why'; // Focus the section if invalid
      return; // Stop saving
    }
    const payload = this.buildPayload();

  

    if (this.mode === 'edit') {
      // UPDATE API
      this.landingService.updateLandingPage(this.slug!, payload).subscribe({
        next: (res) => {
        
          this.toastr.success('Landing Page Updated Successfully');
          // this.router.navigate(['/landing-page-list']);
        },

        error: (err) => {
       
          this.toastr.error('Failed to update page');
        },
      });
    } else {
      this.landingService.addLandingPage(payload).subscribe({
        next: (res: any) => {
       

          if (res.status && res.status.toLowerCase() === 'success') {
            // Success
            this.toastr.success('Landing Page Saved Successfully');
            this.activeSection = 'faq';
            // this.router.navigate(['/landing-page-list']);
          } else {
            // Any failure
            this.toastr.error(res.description || 'Failed to save page');
          }
        },

        error: (err) => {
         
          this.toastr.error('Failed to save page');
        },
      });
    }
  }

  isImageUploaded = false;
  uploadHeroImage() {
    if (!this.heroData.image) {
      alert('Please select image');
      return;
    }

    this.landingService.uploadBannerImage(this.heroData.image).subscribe({
      next: (res: any) => {
        
        this.isUploaded = true;
        this.toastr.success('Image uploaded successfully ✅');
        this.heroData.imagePath = res.data;
        this.isImageUploaded = true;
        
        const payload = this.buildPayload();
      
        this.heroErrors.image = false;
        this.heroErrors.imageErrorMsg = '';
        this.heroData.image = null;
      },

      error: (err) => this.toastr.error('Failed to upload image ❌'),
    });
  }

  // ===============================
  // All-in-One Image Selection
  // ===============================


  onAllInOneImage(event: Event, index: number) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const card = this.allInOneCards[index];

    // Store file for upload
    card.image = file;

    // Revoke previous blob URL if exists
    if (card.imagePath && !card.isUploaded) {
      URL.revokeObjectURL(card.imagePath);
    }

    // Set preview for new image
    card.imagePath = URL.createObjectURL(file);

    // Reset uploaded flag and errors
    card.isUploaded = false;
    if (!this.allInOneErrors[index]) {
      this.allInOneErrors[index] = { heading: false, subHeading: false, paragraph: false, image: false };
    }
    this.allInOneErrors[index].image = false;
    card.imageErrorMsg = '';
  }

  uploadAllInOneImage(index: number) {
    const card = this.allInOneCards[index];

    if (!card.image) {
      alert('Please select image');
      return;
    }

    this.landingService.uploadAllInOneImage(card.image).subscribe({
      next: (res: any) => {
        this.toastr.success('Image uploaded successfully ✅');

        // Server path save
        card.imagePath = res.data;
        card.isUploaded = true;

        // Clear file and errors
        card.image = null;
        if (this.allInOneErrors[index]) {
          this.allInOneErrors[index].image = false;
        }
        card.imageErrorMsg = '';

        
      },
      error: (err) => this.toastr.error('Failed to upload image ❌'),
    });
  }
  saveFaq(mode: string) {
   
    if (this.gotEmptyFaq) {
      this.addFaqs();
    } else {
      this.updateFaq();
    }
  }

  addFaqs() {
   
    const validFaqs = this.faqs.filter((f) => f.question && f.answer);

    if (validFaqs.length === 0) {
      console.warn('No valid FAQs to save');
      return;
    }

    const payload = {
      slug: this.titleData.slug,
      FAQ: validFaqs.map((f) => ({
        Title: f.question,
        Description: f.answer,
      })),
    };

    this.landingService.addFAQ(payload).subscribe({
      next: (res) => {
        this.gotEmptyFaq = false; // FAQs ab empty nahi hain
        this.toastr.success('FAQs saved successfully ✅');
      },
      error: (err) => this.toastr.error('Failed to save FAQs ❌'),
    });
  }
  updateFaq() {
   
    // Filter out empty FAQs
    const validFaqs = this.faqs.filter((f) => f.question && f.answer);

    if (validFaqs.length === 0) {
      console.warn('No valid FAQs to update');
      return;
    }

    const payload = {
      slug: this.titleData.slug, // keep track of which landing page
      FAQ: validFaqs.map((f) => ({
        Title: f.question,
        Description: f.answer,
      })),
    };

    // Call update API instead of add API
    this.landingService.updateFAQ(payload).subscribe({
      next: (res) => this.toastr.success('FAQs updated successfully ✅'),
      error: (err) => this.toastr.error('Failed to update FAQs ❌'),
    });
  }
}
