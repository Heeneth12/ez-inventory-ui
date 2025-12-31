import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ContactService } from '../contacts.service';
import { AddressType, ContactModel, ContactType } from '../contacts.model';
import { CardComponent } from "../../../layouts/UI/card/card.component";

@Component({
  selector: 'app-contact-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, CardComponent],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.css'
})
export class ContactFormComponent implements OnInit {

  contactForm!: FormGroup;
  isEditMode = false;
  contactId: number | null = null;
  isLoading = false;

  // Expose Enums to Template
  contactTypes = Object.values(ContactType);
  addressTypes = Object.values(AddressType);

  constructor(private contactService: ContactService, private fb: FormBuilder, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    this.contactId = this.route.snapshot.paramMap.get('id') ? +this.route.snapshot.paramMap.get('id')! : null;
    this.isEditMode = this.contactId !== null; // Determine
    this.initForm();
    this.checkEditMode();
  }

  // 1. Initialize the Main Form
  private initForm() {
    this.contactForm = this.fb.group({
      id: [null],
      contactCode: ['', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      gstNumber: [''],
      type: [ContactType.CUSTOMER, Validators.required],
      active: [true],
      addresses: this.fb.array([]) // Initialize empty address array
    });

    // Add one default address block for new forms
    if (!this.isEditMode) {
      this.addAddress();
    }
  }

  // 2. Address Form Array Management
  get addressControls() {
    return (this.contactForm.get('addresses') as FormArray).controls;
  }

  createAddressGroup(): FormGroup {
    return this.fb.group({
      id: [null],
      type: [AddressType.OFFICE, Validators.required],
      addressLine1: ['', Validators.required],
      addressLine2: [''],

      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['India', Validators.required],
      pinCode: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]] // Note: Model says pinCode, JSON said pincode. Using Model.
    });
  }

  addAddress() {
    const addresses = this.contactForm.get('addresses') as FormArray;
    addresses.push(this.createAddressGroup());
  }

  removeAddress(index: number) {
    const addresses = this.contactForm.get('addresses') as FormArray;
    addresses.removeAt(index);
  }

  // 3. Edit Mode Logic
  private checkEditMode() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.contactId = +idParam;
      this.loadContactData(this.contactId);
    }
  }

  private loadContactData(id: number) {
    this.isLoading = true;
    this.contactService.getContactById(id,
      (response: any) => {
        this.isLoading = false;
        this.patchFormValues(response.data); // Assuming response is the ContactModel
      },
      (error: any) => {
        this.isLoading = false;
        console.error('Error loading contact', error);
        alert('Failed to load contact details.');
      }
    );
  }

  private patchFormValues(contact: ContactModel) {
    // 1. Patch basic fields
    this.contactForm.patchValue({
      id: contact.id,
      contactCode: contact.contactCode,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      gstNumber: contact.gstNumber,
      type: contact.type,
      active: contact.active
    });

    // 2. Handle Addresses (Complex Array Patching)
    const addressArray = this.contactForm.get('addresses') as FormArray;
    addressArray.clear(); // Clear default/existing

    if (contact.addresses && contact.addresses.length > 0) {
      contact.addresses.forEach(addr => {
        const addrGroup = this.createAddressGroup();
        addrGroup.patchValue(addr);
        addressArray.push(addrGroup);
      });
    } else {
      // If no addresses exist in DB, add one blank
      this.addAddress();
    }
  }

  // 4. Submit Logic
  onSubmit() {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const contactData: ContactModel = this.contactForm.value;

    const successCallback = (res: any) => {
      this.isLoading = false;
      alert(this.isEditMode ? 'Contact Updated Successfully' : 'Contact Created Successfully');
      this.router.navigate(['/contacts']); // Navigate back to list
    };

    const errorCallback = (err: any) => {
      this.isLoading = false;
      console.error('Operation failed', err);
      alert('Operation failed. Please try again.');
    };

    if (this.isEditMode) {
      this.contactService.updateContact(contactData, successCallback, errorCallback);
    } else {
      this.contactService.createContact(contactData, successCallback, errorCallback);
    }
  }

  onCancel() {
    this.router.navigate(['/contacts']);
  }
}

//  private Integer creditDays; ->  in contact

//  private String route; -> address
//  private String area; -> address