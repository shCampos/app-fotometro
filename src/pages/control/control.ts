import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { InfosPage } from '../infos/infos';

@IonicPage()
@Component({
	selector: 'page-control',
	templateUrl: 'control.html',
})
export class ControlPage {
	idProj: any;
	soluto: any;
	solvente: any;
	conc: any;
	flagProp: Boolean;
	flagI0: Boolean;
	flagI: Boolean;
	flagOsDois: Boolean;

	loading: Loading = null;

	leituras: any[]
	proj: any[];
	data: Date;

	constructor(public loadingCtrl: LoadingController, private navParams: NavParams, private afDb: AngularFireDatabase, private toastCtrl: ToastController, private bluetoothSerial: BluetoothSerial, private alertCtrl: AlertController, public navCtrl: NavController) {
		this.leituras = [];
		this.i0 = [];
		this.i1 = [];
		this.ab = [];
		this.tr = [];
		this.lambda = [];
		this.lamb_por_ab = [];
		this.proj = this.navParams.get('proj');
		console.log(this.proj);
		this.data = new Date();
	}

	//-------------------------- ALERTAS ----------------------------
	pedirDados(d){
		let prompt = this.alertCtrl.create({
			title: 'Dados da medida',
			message: "Coloque os dados da medida",
			inputs: [
			{
				name: 'soluto',
				placeholder: 'Soluto'
			},
			{
				name: 'solvente',
				placeholder: 'Solvente'
			},
			{
				name: 'conc',
				placeholder: 'Concentração (Mol/L)'
			}
			],
			buttons: [
			{
				text: 'Cancelar',
				handler: data => {
					console.log('Cancel clicked');
				}
			},
			{
				text: 'Salvar',
				handler: data => {	
					console.log(data);
					this.idProj = d;
					this.soluto = data.soluto;
					this.solvente = data.solvente;
					this.conc = data.conc;
					console.log(this.idProj);
					this.flagProp = true;
				}
			}
			]
		});
 		/*
 		prompt.addInput({
	      type: 'radio',
	      label: 'Blue',
	      value: 'blue',
	      checked: true
	    });
	    prompt.addInput({-
	    	type: 'password',
	      	label: 'Soluto',
	      	value: 'asouhao',
	      });*/
	    prompt.present();
	}

	pedirProj() {
	  	let alert = this.alertCtrl.create();
	  	alert.setTitle('Dados da medida');

	  	for (var i = 0; i < this.proj.length; i++) {
	  		alert.addInput({
	  			type: 'radio',
	  			label: this.proj[i].nome,
	  			value: this.proj[i].id_proj,
	  			checked: false
	  		});
	  	}
	  	
	  	alert.addButton('Cancelar');
	  	alert.addButton({
	  		text: 'Continuar',
	  		handler: data => {
	  			console.log(data);
	  			this.pedirDados(data);
	  		}
	  	});
	  	alert.present();
	  }

	  	  showToast(msg){
	  	const toast = this.toastCtrl.create({
	  		message: msg,
	  		duration: 1000,
	  		position: 'top'
	  	});
	  	toast.present();
	  }

	  presentLoading(texto) {
	  	this.loading = this.loadingCtrl.create({
	  		content: texto,
	  		dismissOnPageChange: true,
	  		showBackdrop: true
	  	});
	  	this.loading.present();
	  }
	  //-------------------------- BLUETOOTH ----------------------------
	  receber(){
	  	let i = 0;
	  	this.bluetoothSerial.write('1')
	  	.then(()=>{
	  		console.log("enviou");
	  	})
	  	.catch((err)=>{
	  		console.log("n enviou", err);
	  	});
	  	this.presentLoading('Recebendo dados...');
	  	var leitura = setInterval(()=>{
	  		if(i == 100){
	  			clearInterval(leitura);
	  			console.log(this.leituras.length);
	  			this.tratarDados();
	  		}else{
	  			this.handleData();
	  			console.log(i);
	  		}
	  		i++;
	  	}, 300);
	  }

	handleData(){
		this.bluetoothSerial.available()
  			.then((e: any)=>{
  				this.bluetoothSerial.readUntil('}')
  				.then((d)=>{
  					var data = JSON.parse(d);
  					console.log(data.t);
  					if(data.t != undefined){
  						this.leituras.push(Number(data.t));
  						//console.log(this.leituras);
  					}
  				})
  				.catch((err)=>{
  					console.log(err);
  				});
  			})
  			.catch((err)=>{
  				console.log(err);
  			});
	}
	//-------------------------- MATEMATICA ----------------------------
	i0: any[];
	i1: any[];
	ab: any[];
	tr: any[];
	lambda: any[];
	lamb_por_ab: any[];

	x_s0: number = 0.08; // em metros
	v: number = 0.000425; //em m/s
	t: number = 400; // em s
	y_cd: number = 0.07; // em metros
	dl: number = 1.0; // em metros
	k: number = 1.0;
	l: number = 1.0;

	tratarDados(){

		console.log("tratando")
		this.loading.dismiss();
		if(!this.flagI0 && !this.flagI){
			for(var i = 0; i < this.leituras.length; i++){
	  			var c = (5*this.leituras[i])/10.24;
	  			var logE = 2*Math.log10(c);
	  			var logi = Math.log10(logE)*(Math.pow((this.x_s0 + this.v*this.t),2) + Math.pow(this.y_cd, 2) + Math.pow(this.dl, 2));
	  			this.i0.push(logi);
	  			console.log("i0");
	  		}
	  		console.log("flagI", this.flagI);
	  		this.flagI0 = true;
	  		this.flagI = true;
		}else if(this.flagI){
			console.log("entrou no I");
			for(var i = 0; i < this.leituras.length; i++){
		  		var c = (5*this.leituras[i])/10.24;
		  		var logE = 2*Math.log10(c);
		  		var logi = Math.log10(logE)*(Math.pow((this.x_s0 + this.v*this.t),2) + Math.pow(this.y_cd, 2) + Math.pow(this.dl, 2));
		  		this.i1.push(logi);
		  		console.log("i1");
	  		}
	  		
			for (var i = 0; i < this.leituras.length; i++) {
	  			this.ab.push(this.i0[i]/this.i1[i]);
  				this.tr.push(this.i1[i]/this.i0[i]);
  				var h = (4*Math.PI*this.k*this.l)/this.ab[i];
  				this.lambda.push(h);
  				this.lamb_por_ab.push({"h": this.lambda[i], "a": this.ab[i]});
  			}
  			this.uparDados();  			
		}
	}

	uparDados(){
		console.log("entrou no upar");
		//this.saveAsCsv();
	  	this.afDb.list('/medidas').push({
	  		solvente: this.solvente,
	  		soluto: this.soluto,
	  		ab: this.ab,
	  		van: this.leituras,
	  		i0: this.i0,
	  		i1: this.i1,
	  		tr: this.tr,
	  		lambda: this.lambda,
	  		conc: this.conc,
	  		data: this.data.getDate().toString() + "/" + this.data.getMonth().toString() + "/" + this.data.getFullYear().toString(),
	  		id_proj: 12 /*Number(this.idProj)*/
	  	});

	  	this.navCtrl.push(InfosPage, {medida: {
	  		solvente: this.solvente,
	  		soluto: this.soluto,
	  		ab: this.ab,
	  		van: this.leituras,
	  		i0: this.i0,
	  		i1: this.i1,
	  		tr: this.tr,
	  		lambda: this.lambda,
	  		conc: this.conc,
	  		data: this.data.getDate().toString() + "/" + this.data.getMonth().toString() + "/" + this.data.getFullYear().toString(),
	  		id_proj: 12 /*Number(this.idProj)*/
	  	}});
	}
	

	//-------------------------- NAVEGAÇÃO ----------------------------
	sair(){
		this.navCtrl.pop();
	}
}