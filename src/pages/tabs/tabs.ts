import { Component } from '@angular/core';

import { InfosPage } from '../infos/infos';
import { HomePage } from '../home/home';

@Component({
  	templateUrl: 'tabs.html'
})
export class TabsPage {

 	tab1Root = HomePage;
  	tab2Root = InfosPage;

  	constructor() {

  	}
}
