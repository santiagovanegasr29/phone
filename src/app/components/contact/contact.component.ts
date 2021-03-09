import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact } from '../../entities/contacts';
import { ViewsComponent } from '../views/views.component';

declare let Dexie;
declare let SIPml;

var db = new Dexie("contact");
db.version(1).stores({
  contacts: "++id,name,numberPhone"
});

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent extends Dexie {
@ViewChild(ViewsComponent) call: ViewsComponent;
  formContact: Contact;
  closeResult = '';
  allContacts;
  contactos: any = [];
  public conta: any = [];

  public constructor(private modalService: NgbModal) {
    super("contacts");
    this.formContact = new Contact();
    this.conta = [];
  }


  ngOnInit(): void {
    this.gets();
  }


  openUser(contentUser) {

    this.modalService.open(contentUser, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

    });
  }

  postContacts() {

    db.contacts.add({name: this.formContact.name, numberP: this.formContact.numberPhone }).then(function () {
      return db.contacts.toArray();
    }).then(function (contact) {
      console.log("My contacts: " + JSON.stringify(contact));
    }).catch(function (e) {
      alert("Error: " + (e.stack || e));
    });

  }

  gets() {
    this.allContacts = db.contacts.toArray();
    // alert(db.contacts.get({name: this.dataform.name}));
    this.allContacts.then((value) => {
      this.conta = value;

      console.log(this.conta);

    });
  }

  updateContact() {

    db.contacts.update(10, { name: "florinda", numberPhone: 7456169 });

  }
  deleteContact(id) {

    db.contacts.delete(id);
  }


}
