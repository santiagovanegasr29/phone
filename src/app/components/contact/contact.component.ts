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


}
