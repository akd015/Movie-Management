import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './feedback.component.html',
  styleUrl: './feedback.component.scss'
})
export class FeedbackComponent {
  feedback = {
    name: '',
    email: '',
    message: ''
  };
  submitted = false;

  constructor(private readonly snackBar: MatSnackBar) {}

  onSubmit(form: NgForm) {
    if (form.valid) {
      this.submitted = true;
      this.snackBar.open('Feedback submitted. Thank you!', 'Close', {
        duration: 3000
      });
      form.resetForm();
    }
  }
}
