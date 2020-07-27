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
	identificador: any;

	flagProp: Boolean = false;
	flagI0: Boolean = false;
	flagI: Boolean = false;
	flagOsDois: Boolean;

	loading: Loading = null;

	leiturasI0: any[];
	leiturasI1: any[];
	vAn0: any[];
	vAn1: any[];
	proj: any[];
	data: Date;

	constructor(public loadingCtrl: LoadingController, private navParams: NavParams, private afDb: AngularFireDatabase, private toastCtrl: ToastController, private bluetoothSerial: BluetoothSerial, private alertCtrl: AlertController, public navCtrl: NavController) {
		this.leiturasI0 = [];
		this.leiturasI1 = [];
		this.vAn0 = [];
		this.vAn1 = [];
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
			message: "Defina os dados da medida",
			inputs: [
			{
				name: 'identificador',
				placeholder: 'Identificador'
			},
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
					if(data.identificador != undefined && data.soluto != undefined && data.solvente != undefined && data.conc != undefined){
						console.log(data);
						this.idProj = d;
						this.soluto = data.soluto;
						this.solvente = data.solvente;
						this.conc = data.conc;
						this.identificador = data.identificador;
						console.log(this.idProj);
						this.flagProp = true;
					}
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
	  	alert.setMessage('Defina o projeto');
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
	receber(e){
		console.log("eee", e);
	  	var i;
	  	var acabou: boolean;
	  	this.bluetoothSerial.write('1')
	  	.then(()=>{
	  		console.log("enviou");
	  	})
	  	.catch((err)=>{
	  		console.log("n enviou", err);
	  	});
	  	this.presentLoading('Recebendo dados...');
	  	if(e == 0){
	  		this.flagI0 = true;
	  	}else if(e == 1){
	  		this.flagI = true;
	  	}
	  	var leitura = setInterval(()=>{
	  		if(i == "a"){
	  			this.loading.dismiss();
	  			clearInterval(leitura);
	  			console.log(this.leiturasI0.length, this.leiturasI1.length);
	  			if (e == 1) {
	  				this.tratarDados();
	  			}
	  		}else{
	  			this.bluetoothSerial.available()
	  			.then((f: any)=>{
	  				this.bluetoothSerial.readUntil('}')
	  				.then((d)=>{
	  					var data = JSON.parse(d);
							console.log(data.t);
							i = data.t;
	  					if(data.t != undefined && data.t != "a"){
	  						console.log("n é undefined");
	  						if(e == 0){
	  							console.log("i0 e0");
	  							this.leiturasI0.push(Number(data.t));
	  						}else if(e == 1){
	  							console.log("i1 e1");
	  							this.leiturasI1.push(Number(data.t));
	  						}
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
			}, 301);
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
		//this.loading.dismiss();
		console.log(this.leiturasI0, this.leiturasI1);
		if(this.leiturasI0.length > this.leiturasI1.length){
			for (var i = 0; i < this.leiturasI1.length; i++) {
				console.log("organizando", this.leiturasI0[i], this.leiturasI1[i]);
				if(!isNaN(this.leiturasI1[i]) && !isNaN(this.leiturasI0[i])){
					console.log("organizando", this.leiturasI1[i], this.leiturasI0[i]);
					this.vAn0.push(this.leiturasI0[i]);
					this.vAn1.push(this.leiturasI1[i]);
				}
			}
		}else if(this.leiturasI1.length > this.leiturasI0.length){
			for (var i = 0; i < this.leiturasI0.length; i++) {
				console.log("organizando", this.leiturasI0[i], this.leiturasI1[i]);
				if(!isNaN(this.leiturasI1[i]) && !isNaN(this.leiturasI0[i])){
					console.log("organizando", this.leiturasI1[i], this.leiturasI0[i]);
					this.vAn0.push(this.leiturasI0[i]);
					this.vAn1.push(this.leiturasI1[i]);
				}
			}
		}else if(this.leiturasI0.length == this.leiturasI1.length){
			console.log("organizando", this.leiturasI0[i], this.leiturasI1[i]);
			for (var i = 0; i < this.leiturasI0.length; i++) {
				console.log("organizando", this.leiturasI1[i], this.leiturasI0[i]);
				this.vAn0.push(this.leiturasI0[i]);
				this.vAn1.push(this.leiturasI1[i]);
			}
		}

		for(var i = 0; i < this.vAn0.length; i++){
  			var c = (5*this.vAn0[i])/10.24;
  			var logE = 2*Math.log10(c);
  			var logi = Math.log10(logE)*(Math.pow((this.x_s0 + this.v*this.t),2) + Math.pow(this.y_cd, 2) + Math.pow(this.dl, 2));
  			this.i0.push(logi);
  			console.log("i0");
  		}
  		console.log("flagI", this.flagI);
  		this.flagI0 = true;
	
		console.log("entrou no I");
		for(var i = 0; i < this.vAn1.length; i++){
	  		var c = (5*this.vAn1[i])/10.24;
	  		var logE = 2*Math.log10(c);
	  		var logi = Math.log10(logE)*(Math.pow((this.x_s0 + this.v*this.t),2) + Math.pow(this.y_cd, 2) + Math.pow(this.dl, 2));
	  		this.i1.push(logi);
	  		console.log("i1");
  		}
  		
		for (var i = 0; i < this.vAn1.length; i++){
			//if(this.i0[i]/this.i1[i] != NaN && this.i1[i]/this.i0[i] != NaN){
			this.ab.push(this.i0[i]/this.i1[i]);
  			this.tr.push(this.i1[i]/this.i0[i]);
  			var h = (4*Math.PI*this.k*this.l)/this.ab[i];
  			this.lambda.push(h);
  			//this.lamb_por_ab.push({"h": this.lambda[i], "a": this.ab[i]});	
						
		}
		this.uparDados();  			
	}

	uparDados(){
		console.log("entrou no upar");
		//this.saveAsCsv();
		console.log("ab", this.ab);

	  	this.afDb.list('/medidas').push({
	  		solvente: this.solvente,
	  		soluto: this.soluto,
	  		ab: this.ab,
	  		van0: this.vAn0,
	  		van1: this.vAn1,
	  		i0: this.i0,
	  		i1: this.i1,
	  		tr: this.tr,
	  		lambda: this.lambda,
	  		conc: this.conc,
	  		identificador: this.identificador,
	  		data: this.data.getDate().toString() + "/" + (this.data.getMonth()+1).toString() + "/" + this.data.getFullYear().toString(),
	  		id_proj: this.idProj /*Number(this.idProj)*/
	  	});

	  	this.navCtrl.push(InfosPage, {medida: {
	  		solvente: this.solvente,
	  		soluto: this.soluto,
	  		ab: this.ab,
	  		van0: this.vAn0,
	  		van1: this.vAn1,
	  		i0: this.i0,
	  		i1: this.i1,
	  		tr: this.tr,
	  		lambda: this.lambda,
	  		conc: this.conc,
	  		identificador: this.identificador,
	  		data: this.data.getDate().toString() + "/" + (this.data.getMonth()+1).toString() + "/" + this.data.getFullYear().toString(),
	  		id_proj: this.idProj /*Number(this.idProj)*/
	  	}});
	}
	

	//-------------------------- NAVEGAÇÃO ----------------------------
	sair(){
		this.navCtrl.pop();
	}
}