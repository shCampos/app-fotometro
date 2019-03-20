import { Component, ViewChild, Input } from '@angular/core';
import { Slides, NavController, NavParams, LoadingController, Loading, AlertController, ToastController } from 'ionic-angular';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { InfosPage } from '../infos/infos';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { LoginPage } from '../login/login';
import { ControlPage } from '../control/control';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

interface pairedlist{
	"class": number,
	"id": string,
	"address": string,
	"name": string
}

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})

export class HomePage {
	pairedList: pairedlist;
	listToggle: boolean = false;
	pairedDeviceID: number = 0;
	dataSend: string = "";
	action: string = "perfil";

	user_logado: any;
	nome: string = "";
	id: number = 0;
	projetos: Observable<any[]>;
	projetos_escalar: any[];
	proj_esc: any;
	quant_meds: any;
	medidas: Observable<any[]>;
	medidas_todas: Observable<any[]>;
	flagVazio: Boolean;
	proj2alt: any;
	med2alt: any;
	projHover: Boolean;

	loading: Loading = null;

	flagDisp: Boolean;
	flagNome: Boolean;
	// flagAnt: Boolean = ;
	// flagProx: Boolean;
	@ViewChild(Slides) public slides: Slides;

	constructor(public loadingCtrl: LoadingController, private navParams: NavParams, private afDb: AngularFireDatabase, private afAuth: AngularFireAuth, private toastCtrl: ToastController, private bluetoothSerial: BluetoothSerial, private alertCtrl: AlertController, public navCtrl: NavController) {
		var user_email = this.navParams.get('email');
		console.log(user_email);
		this.getUser(user_email);	
		this.bluetoothSerial.enable();
		//this.navCtrl.setRoot(HomePage);
		this.projetos_escalar = [];
		//this.proj_esc = {nome: 'Carregando...', id_proj: "00", id_user: "00"};
	}

	/*ionViewDidLeave(){
		this.deviceDisconnected();
	}*/

	//-------------------------- ALERTAS ----------------------------
	presentLoading(texto) {
		this.loading = this.loadingCtrl.create({
			content: texto,
			dismissOnPageChange: true,
			showBackdrop: true
		});
		this.loading.present();
	}

	showError(error){
		let alert = this.alertCtrl.create({
			title: 'Erro',
			subTitle: error,
			buttons: ['Ok']
		});
		alert.present();
	}
	showToast(msg){
		const toast = this.toastCtrl.create({
			message: msg,
			position: 'top',
			duration: 1000
		});
		toast.present();
	}

	alertaProj(p){
		let prompt = this.alertCtrl.create({
 			title: 'Configurar projeto',
 			message: "Altere os dados do projeto",
 			inputs: [
 			{
 				name: 'nome',
 				placeholder: 'Nome do projeto'
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
 					console.log(data, data.nome);
 					//AAA
 					//var proj = {'key':p.key, 'nome':data.nome, 'id_proj':p.id_proj, 'id_user':p.id_user};
 					this.altProj(p.key, data.nome);
 				}
 			}
 			]
 		});
 		prompt.present();
	}

	alertaNovoProj(){
		let prompt = this.alertCtrl.create({
 			title: 'Criar projeto',
 			// message: "Altere os dados do projeto",
 			inputs: [
 			{
 				name: 'nome',
 				placeholder: 'Nome do projeto'
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
 				text: 'Criar',
 				handler: data => {	
 					console.log(data);
 					//AAA
 					this.criarProj(data.nome);
 				}
 			}
 			]
 		});
 		prompt.present();
	}
	alertaExcProj(key, id_proj, nome){
		let alert = this.alertCtrl.create({
			title: 'Excluir projeto',
			subTitle: 'Deseja mesmo excluir o projeto '+nome+'?',
			buttons: [{
				text: 'Cancelar'
			},{
				text: 'Sim',
				handler: ()=>{
					this.excProjetos(key, id_proj);
				}
			}]
		});
		alert.present();
	}

	//-------------------------- BLUETOOTH ----------------------------
	listPairedDevices(){
		this.bluetoothSerial.isEnabled()
		.then(()=>{
			this.presentLoading('Procurando...');
			this.bluetoothSerial.discoverUnpaired()
			.then((success)=>{
				this.pairedList = success;
				this.listToggle = true;
				this.loading.dismiss();
			})
			.catch((err)=>{
				console.log(err);
				this.loading.dismiss();
				this.showError("Bluetooth não habilitado");
				this.listToggle = false;
			});
			// this.bluetoothSerial.list()
			// .then((success)=>{
				// 	this.pairedList += success;
				// 	this.listToggle = true;
				// })
				// .catch()
			})
		.catch((err)=>{
			console.log(err);
			this.loading.dismiss();
			this.showError("Ligue o Bluetooth");
		});
	}

	selectDevice(){
		let connectedDevice = this.pairedList[this.pairedDeviceID];
		if(!connectedDevice.address){
			this.showError('Escolha um dispositivo');
			return;
		}
		let address = connectedDevice.address;
		let name = connectedDevice.name;
		this.connect(address);
	}

	connect(address){
		this.presentLoading('Conectando...');
		this.bluetoothSerial.connect(address).subscribe(
			success => {
				this.loading.dismiss();
				//this.deviceConnected();
				this.showToast("Conectado");
				//this.pedirDados();
				this.flagDisp = true;
			},
			error => {
				this.loading.dismiss();
				console.log(error);
				this.showError("Erro em conectar");
			});
	}
	
/*	deviceConnected(){
		this.bluetoothSerial.subscribe('\n').subscribe(
			success => {
				//this.showToast("conectado");
				//this.handleData();
			},
			error => {
				this.showError(error);
			});
	}*/

	deviceDisconnected(){
		this.bluetoothSerial.disconnect();
		this.showToast("Desconectado");
	}

	//-------------------------- CRUD DOS USUARIOS ----------------------------
	getUser(email){
		this.afDb.list('/users', 
			ref => ref.orderByChild('email').equalTo(email)
			).valueChanges().subscribe(r => {
				this.user_logado = r[0];
				console.log("user logado",this.user_logado, this.user_logado.nome);
				this.nome = this.user_logado.nome;
				this.id = this.user_logado.id;
				this.getProjetos(this.user_logado.id);
		});
	}

	//-------------------------- CRUD DOS PROJETOS ----------------------------
	getProjetos(id){
		console.log("entrou projetos");
		var flag = true;
		this.projetos = this.afDb.list('/projetos', ref => ref.orderByChild('id_user').equalTo(id))
		.snapshotChanges()
		.pipe(map(items => {
			console.log("primeiro map");
			//items.reverse();
			if(items.length==0){
				console.log("aaa vazio");
				this.proj_esc = null;
			}
			this.projetos_escalar = [];
			return items.map(a => {
				const data = a.payload.val();
				const key = a.payload.key;
				this.projetos_escalar.push({key, ...data});
				console.log("bb", this.projetos_escalar);
				if(flag){
					this.flagNome = true;
					this.proj_esc = {key, ...data};
					flag = false;
					console.log("aaa",this.proj_esc);
				}
				this.getMedidas(this.proj_esc.id_proj);
				return {key, ...data};
			});
		}));
	}

	criarProj(e){
		console.log(e);
		var id_random = Math.round(Math.random()*100);
		this.afDb.list('/projetos').push({
			id_proj: id_random,
			id_user: this.user_logado.id,
			nome: e,
		})
		.then(()=>{
			console.log("criiouu");
		});
	}

	excProjetos(key, id_proj){
		console.log("key", key, "id_proj", id_proj);
		this.afDb.list('/projetos/'+key).remove()
		.then(()=>{
			this.medidas_todas.forEach((medidas)=>{
				for(let m of medidas) {
					if(m.id_proj == id_proj){
						this.excluirMeds(m.key);
						console.log("entrou no if");
					}
					console.log("mm", m.key);

				}
			});
			this.getProjetos(this.user_logado.id);
			console.log("excluiu");
		});
	}

	proj2Alt(p){
		console.log("proj2alt",p);
		this.proj2alt = p;
	}

	altProj(key, n){
		/*this.proj2alt.nome = p.value.nome;
		console.log('nome', p.value.nome, this.proj2alt.id_proj, this.proj2alt.id_user);
		var a = p.value.nome;
		this.afDb.list('/projetos').update(this.proj2alt.key, 
		{
			nome: p.value.nome,
			id_proj: this.proj2alt.id_proj,
			id_user: this.proj2alt.id_user
		})
		.then(()=>{
			console.log("funcionou");
		})
		.catch((err)=>{
			console.log(err)
		});*/
		this.afDb.list('/projetos').update(key, {
			nome: n
		})
		.then(()=>{
			console.log("mudou");
			this.proj_esc.nome = n;
		})
		.catch((err)=>{
			console.log(err);
		})
	}

	mudarProj(idproj){
		console.log("mudar", idproj);
		this.afDb.list('/projetos', ref => ref.orderByChild('id_proj').equalTo(idproj))
		.valueChanges()
		.subscribe((p)=>{
			console.log("ppp",p);
			this.proj_esc = JSON.parse(JSON.stringify(p[0]));
			this.getMedidas(this.proj_esc.id_proj);
		});
	}
	//-------------------------------- CRUD DAS MEDIDAS ----------------------------
	getMedidas(id){
		console.log("entrou getmedidas", id);
		this.medidas = this.afDb.list('/medidas', ref => ref.orderByChild('id_proj').equalTo(id))
		.snapshotChanges()
		.pipe(map(items => {
			items.reverse();
			this.quant_meds = items.length;
			if(this.quant_meds == 0){
				this.flagVazio = true;
			}else{
				this.flagVazio = false;
			}
			return items.map(a => {
				const data = a.payload.val();
				const key = a.payload.key;
				return {key, ...data};
			});
		}));
	}

	getAllMedidas(){
		this.medidas_todas = this.afDb.list('/medidas')
		.snapshotChanges()
		.pipe(map(items => {
			return items.map(a => {
				const data = a.payload.val();
				const key = a.payload.key;
				return {key, ...data};
			});
		}));
	}

	excluirMeds(key){
		console.log("key", key);
		this.afDb.list('/medidas/'+key).remove()
		.then(()=>{console.log("removeu")});
	}

	med2Alt(m){
		console.log("proj2alt",m);
		this.med2alt = m;
	}

	altMed(m){
		console.log('conc', m.value.conc);
		this.afDb.list('/medidas').update(this.med2alt.key, 
		{
			conc: m.value.conc,
			data: m.value.data,
			soluto: m.value.soluto,
			solvente: m.value.solvente
		})
		.then(()=>{
			console.log("funcionou");
		})
		.catch((err)=>{
			console.log(err)
		});
	}

	//-------------------------------- NAVEGAÇÃO ----------------------------
	irControl(){
		//this.bluetoothSerial.write("1");
		console.log(this.projetos_escalar);
		this.navCtrl.push(ControlPage, {proj: this.projetos_escalar});
	}
	abrirInfo(m){
		this.navCtrl.push(InfosPage, {medida: m, email: this.user_logado.email});
	}	
	logoff(){
		this.afAuth.auth.signOut()
		.then(()=>{
			console.log("saiu");
			this.navCtrl.push(LoginPage);
		})
		.catch((err)=>{
			console.log(err);
		});
	}

/*	anterior(key){
		for (var i = 0; i < this.projetos_escalar.length; i++) {
			if (this.projetos_escalar[i].key == key) {
				this.proj_esc = this.projetos_escalar[i-1];
				this.getMedidas(this.proj_esc.id_proj);
			}
		}
	}
	proximo(key){
		for (var i = 0; i < this.projetos_escalar.length; i++) {
			if (this.projetos_escalar[i].key == key) {
				this.proj_esc = this.projetos_escalar[i+1];
				this.getMedidas(this.proj_esc.id_proj);
			}
		}
	}*/

	mudouSlide(event){
		//console.log(event.swipeDirection);
		if(event.swipeDirection == "next"){
			console.log('if 1');
			for (var i = 0; i < this.projetos_escalar.length; i++) {
				if(this.proj_esc.nome == this.projetos_escalar[i].nome && this.projetos_escalar[i+1] != undefined){
					console.log("keeeyy", this.projetos_escalar[i+1].id_proj);
					this.mudarProj(this.projetos_escalar[i+1].id_proj);
					console.log('entrou');
				}
			}
		}else if(event.swipeDirection == "prev"){
			console.log("if 2");
			for (var i = 0; i < this.projetos_escalar.length; i++) {
				console.log("aa", this.projetos_escalar[i]);

				if(this.proj_esc.nome == this.projetos_escalar[i].nome && i-1 >= 0){
					console.log("keeeyy", this.projetos_escalar[i-1].id_proj);
					this.mudarProj(this.projetos_escalar[i-1].id_proj);
					console.log('entrou');
				}
			}
		}
    }
}