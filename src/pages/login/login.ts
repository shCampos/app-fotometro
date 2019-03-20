import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';
import { FormsModule } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { HomePage } from '../home/home';
import { LoadingController, Loading } from 'ionic-angular';
import { NavParams } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';

@Component({
	selector: 'page-login',
	templateUrl: 'login.html'
})

export class LoginPage {
	flagSenha: Boolean;
	flagUser: Boolean;
	flagOutro: Boolean;
	flagForm: Boolean;
	flagKey: Boolean;
	flagFoi: Boolean;
	flagNet: Boolean;
	flagVazio: Boolean;
	loading: Loading = null;

	constructor(private toastCtrl: ToastController, private bluetoothSerial: BluetoothSerial, private navParams: NavParams, public loadingCtrl: LoadingController, public afAuth: AngularFireAuth, public navCtrl: NavController) {}

	ionViewDidLoad(){
  		this.bluetoothSerial.disconnect()
  		.then(()=>{
  			this.showToast("Desconectado");
  		})
  		.catch((err)=>{
  			console.log(err);
  		});
  	}

  	showToast(msg){
		const toast = this.toastCtrl.create({
			message: msg,
			position: 'top',
			duration: 1000
		});
		toast.present();
	}

	presentLoading() {
    	this.loading = this.loadingCtrl.create({
      		content: 'Carregando',
      		dismissOnPageChange: true,
      		showBackdrop: true
    	});
    	this.loading.present();
  	}

  	deixaFalso(){
  		this.flagSenha = false;
		this.flagUser = false;
		this.flagOutro = false;
		this.flagForm = false;
		this.flagKey = false;
		this.flagFoi = false;
		this.flagNet = false;
		this.flagVazio = false;
  	}

	login(e){
		this.deixaFalso();
		this.presentLoading();
		console.log(e.value.email);
		if(e.value.email === undefined){
			this.loading.dismiss();
			this.flagVazio = true;
		}
		this.afAuth.auth.signInWithEmailAndPassword(e.value.email, e.value.pass)
		.then(()=>{
			console.log("entrou");
			this.navCtrl.push(HomePage, {email: e.value.email});
			//this.navCtrl.setRoot(HomePage);
		})
		.catch((err)=>{
			this.loading.dismiss();
			if(err.code == "auth/wrong-password"){
				this.flagSenha = true;
			}else if(err.code == "auth/user-not-found"){
				this.flagUser = true;
			}else if(err.code == "auth/network-request-failed"){
				this.flagNet = true;
			}else{
				this.flagOutro = true;
			}
		});
	}
}
