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

  constructor(private fb: FormBuilder, private router: Router,  private authService: AuthService,private toastr: ToastrService) {
    this.loginForm = this.fb.group({
      UserId: ['', Validators.required],
      Password: ['', Validators.required]
    });
  }

  // Easy access getter
  get f() {
    return this.loginForm.controls;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

 onSubmit() {
  console.log("clicked");
  this.submitted = true;

  if (this.loginForm.invalid) return;

  const payload = {
    mobileOrEmail: this.loginForm.value.UserId,
    password: this.loginForm.value.Password
  };

  this.authService.login(payload).subscribe({
    next: (res) => {
      console.log("Login Success:", res);
   this.toastr.success('Login successful ✅');
      this.router.navigate(
        ['/landing-page-list'],
        { replaceUrl: true }
      );
    },
    error: (err) => {
      console.error("Login Failed:", err);
      alert(err?.error?.description || "Login failed");
       this.toastr.error('Invalid credentials ❌');
    }
  });
}
}
