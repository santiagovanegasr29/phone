import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewsComponent } from './components/views/views.component'
import { LoginComponent }from './components/login/login.component';
import { ContactComponent } from './components/contact/contact.component';

const panel: Routes = [

  { path: 'phone', component: ViewsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'contact', component: ContactComponent },
  { path: '', redirectTo: '/phone', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(panel, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
