import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, Loading, LoadingController, ToastController } from 'ionic-angular';
import * as CanvasJS from '../canvajs/canvasjs.min';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { HomePage } from '../home/home';
import { File } from '@ionic-native/file';
import { EmailComposer } from '@ionic-native/email-composer';
import { Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';

@Component({
	selector: 'page-infos',
	templateUrl: 'infos.html'
})
export class InfosPage {
	medida: any;
	loading: Loading = null;
	flagInput: Boolean;
	tudo: any[];
	email: any;

	constructor(private emailComposer: EmailComposer, private file: File, private toastCtrl: ToastController, private loadingCtrl: LoadingController, private alertCtrl: AlertController, public afDb: AngularFireDatabase, public navParams: NavParams, public navCtrl: NavController) {
		this.tudo = [];
		this.medida = this.navParams.get('medida');
		this.email = this.navParams.get('email');
		console.log(this.medida);
	}

	ionViewDidEnter(){
		/*this.afDb.list('/medidas', ref => ref.orderByChild('van').equalTo(this.parametro))
		.snapshotChanges()
		.pipe(map(items => {
			return items.map(a => {

				const data = a.payload.val();
				const key = a.payload.key;
				this.medida = {key, ...data};
			});
		}));
		console.log(this.medida);*/
		this.openDados(this.medida);
	}

	presentLoading(texto) {
	  	this.loading = this.loadingCtrl.create({
	  		content: texto,
	  		dismissOnPageChange: true,
	  		showBackdrop: true
	  	});
	  	this.loading.present();
	}

	 showToast(msg){
	  	const toast = this.toastCtrl.create({
	  		message: msg,
	  		duration: 1000,
	  		position: 'top'
	  	});
	  	toast.present();
	  }

	edit(){
		this.flagInput = !this.flagInput;
		console.log(this.flagInput);
	}

	openDados(m){
		console.log(m.lambda, m.ab);
		let dataPoints = [];	
		for(var i = 0; i < m.lambda.length; i++ ){		  	
			dataPoints.push({ x: Number(m.lambda[i]), y: Number(m.ab[i])});
		}
		var filename = "idMed"+m.id+"idProj"+m.idProj+"dataMed"+m.data
		this.chart(dataPoints, filename);
	}

	chart(dados, filename){
		let chart = new CanvasJS.Chart("chartContainer", {
			zoomEnabled: true,
			animationEnabled: true,
			exportEnabled: true,
			exportFileName: filename,
			title: {
				text: "Absorbancia x Lambda",
				fontSize: 16,
				fontFamily: "verdana"
			},
			data: [{
				type: "line",                
				dataPoints: dados
			}]
		});
		chart.render();
	}

	atualizarMed(m){
		console.log(m.value);
		if(m.value.data != undefined){
			console.log("entrou");
			this.afDb.list('/medidas').update(this.medida.key, 
			{
				data: m.value.data
			})
			.then(()=>{ console.log("funcionou"); this.navCtrl.pop(); })
			.catch((err)=>{	console.log(err); });
		}else if(m.value.conc != undefined){
			this.afDb.list('/medidas').update(this.medida.key, 
			{
				conc: m.value.conc
			})
			.then(()=>{ console.log("funcionou"); this.navCtrl.pop(); })
			.catch((err)=>{	console.log(err); });
		}if(m.value.soluto != undefined){
			this.afDb.list('/medidas').update(this.medida.key, 
			{
				soluto: m.value.soluto
			})
			.then(()=>{ console.log("funcionou"); this.navCtrl.pop(); })
			.catch((err)=>{	console.log(err); });
		}if(m.value.solvente != undefined){
			this.afDb.list('/medidas').update(this.medida.key, 
			{
				solvente: m.value.solvente
			})
			.then(()=>{ console.log("funcionou"); this.navCtrl.pop(); })
			.catch((err)=>{	console.log(err); });
		}
		/*
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
		*/
	}

	excluirMeds(key){
		let alert = this.alertCtrl.create({
			title: 'Excluir medida',
			subTitle: 'Deseja mesmo excluir a medida?',
			buttons: [{
				text: 'Cancelar'
			},{
				text: 'Sim',
				handler: ()=>{
					this.afDb.list('/medidas/'+key).remove()
					.then(()=>{console.log("removeu")});
					this.navCtrl.pop();
				}
			}]
		});
		alert.present();	
	}

	saveAsCsv(){
		this.presentLoading('Salvando...');
		for (var i = 0; i < this.medida.van0.length; i++) {
			this.tudo.push({
				"van0": this.medida.van0[i],
				"van1": this.medida.van1[i],
				"i0": this.medida.i0[i],
				"i1": this.medida.i1[i],
				"ab": this.medida.ab[i],
				"tr": this.medida.tr[i],	
				"lambda": this.medida.lambda[i]
			});
		}
		console.log(this.tudo);
		this.JSONToCSVConvertor(this.tudo, 'vAn0 - vAn1 - i0 - i1 - ab - tr - lambda', '');   
	}

	JSONToCSVConvertor(JSONData, ReportTitle, ShowLabel) {
    	//If JSONData is not an object then JSON.parse will parse the JSON string in an Object
   		var arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    	var CSV = '';    
    	//Set Report title in first row or line
    	CSV += ReportTitle + '\r\n\n';
    	//This condition will generate the Label/Header
    	if (ShowLabel) {
	        var row = "";
	        //This loop will extract the label from 1st index of on array
	        for (var index in arrData[0]) {	            
	            //Now convert each value to string and comma-seprated
	            row += index + ',';
	        }
        	row = row.slice(0, -1);        
        	//append Label row with line break
        	CSV += row + '\r\n';
    	}
    	//1st loop is to extract each row
   		for (var i = 0; i < arrData.length; i++) {
        	var row = "";        
        	//2nd loop will extract each column and convert it in string comma-seprated
        	for (var index in arrData[i]) {
         	   row += '"' + arrData[i][index] + '",';
        	}
        	row.slice(0, row.length - 1);        
        	//add a line break after each row
        	CSV += row + '\r\n';
    	}
	    if (CSV == '') {        
	        console.log("Invalid data");
	        return;
	    }       
    	console.log(CSV);

		var fileName: any = "medida"+this.medida.key+"projeto_"+this.medida.id_proj+".csv";

		this.file.checkDir(this.file.externalRootDirectory, 'Medidas_app').then(response => {
			console.log('Directory exists'+response);
			var path = this.file.externalRootDirectory+'Medidas_app';
			console.log(path, fileName);
			this.criarArquivo(path, fileName, CSV);
		}).catch(err => {
			console.log('Directory doesn\'t exist'+JSON.stringify(err));
			this.file.createDir(this.file.externalRootDirectory, 'Medidas_app', false).then(response => {
				console.log('Directory create'+response);
				var path = this.file.externalRootDirectory+'Medidas_app';
				console.log(path);
				this.criarArquivo(path, fileName, CSV);				
			}).catch(err => {
				console.log('Directory no create'+JSON.stringify(err));
			}); 
		});	
	}

	criarArquivo(path, fileName, conteudo){
		this.file.writeFile(path, fileName, conteudo)
			.then(()=>{
				this.loading.dismiss();
				this.showToast('Arquivo gerado em'+path);
				this.enviarEmail(path+'/'+fileName);
			})
			.catch((err)=>{
				this.loading.dismiss();
				console.log("não criou", err);
				this.enviarEmail(path+'/'+fileName);
			});	
	}

	enviarEmail(filePath){
		this.presentLoading('Enviando...');
		
		let email = {
		  to: this.email,
		  cc: 'rogers.oliveira@ifms.edu.br',
		  attachments: [
		    filePath
		  ],
		  subject: '(teste do app) Medida'+this.medida.data+' | Projeto'+this.medida.id_proj,
		  body: 'Segue o arquivo em anexo. (teste do aplicativo)',
		  isHtml: true
		};

		this.emailComposer.open(email)
		.then(()=>{
			this.loading.dismiss();
		})
		.catch((err)=>{
			this.loading.dismiss();
			console.log(err);
		});
	}

	sair(){
		this.navCtrl.push(HomePage);
	}
}
