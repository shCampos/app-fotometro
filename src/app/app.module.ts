import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { LoginPage } from '../pages/login/login';
import { InfosPage } from '../pages/infos/infos';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { ControlPage } from '../pages/control/control';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { FormsModule } from '@angular/forms';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { firebaseConfig  } from '../environment';

import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { EmailComposer } from '@ionic-native/email-composer';
import { File } from '@ionic-native/file';

@NgModule({
  declarations: [
    MyApp,
    LoginPage,
    InfosPage,
    HomePage,
    TabsPage,
    ControlPage
  ],
  imports: [
    BrowserModule,
    FormsModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    AngularFireAuthModule,
    AngularFireDatabaseModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    InfosPage,
    HomePage,
    TabsPage,
    ControlPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    BluetoothSerial,
    EmailComposer,
    File,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
