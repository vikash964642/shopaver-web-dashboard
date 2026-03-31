import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
// import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  submitted = false;
  

  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      UserId: ['', Validators.required],
      Password: ['', Validators.required]
    });
  }
ngOnInit() {
  const token = localStorage.getItem('token');
  if (token) {
    this.router.navigate(['/landing-page-list']);
  }
}
  // Easy access getter
  get f() {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

 onSubmit(): void {
  this.submitted = true;

  // ✅ Stop if form invalid
  if (this.loginForm.invalid) {
    this.toastr.warning('Please fill all required fields');
    return;
  }

  // ✅ Disable button / prevent multiple clicks
 

  const payload = {
    mobileOrEmail: this.loginForm.value.UserId?.trim(),
    password: this.loginForm.value.Password
  };

  this.authService.login(payload).subscribe({
    next: (res) => {
      

      // console.log('Login Response:', res);

      // ✅ Handle API success properly
      if (res?.status === 'Success' || res?.status === true) {

        // Token already stored in service (tap)
        this.toastr.success(res?.description || 'Login successful ✅');

        // ✅ Navigate safely
        this.router.navigate(['/landing-page-list'], {
          replaceUrl: true
        });

      } else {
        // ❌ API returned failure
        this.toastr.error('Invalid credentials.');
      }
    },

    error: (err) => {
      
      console.error('Login Error:', err);

      // ✅ Better error handling
      const message =
        err?.error?.description ||
        err?.error?.message ||
        'Something went wrong. Please try again';
        // console.log('Error Message:', message);

      this.toastr.error('Login Error: ' + message);

    }
  });
}
}
