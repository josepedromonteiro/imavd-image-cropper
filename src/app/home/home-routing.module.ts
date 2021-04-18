import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { ExpandableCardModule } from '../components/expandable-card/expandable-card.module';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes), ExpandableCardModule],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
