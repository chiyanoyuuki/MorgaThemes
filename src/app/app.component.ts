import { Component, ElementRef, NgModule, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import axios from 'axios';
import data from "../assets/data.json";


interface BirthData {
  dateOfBirth: string; // format: 'YYYY-MM-DD'
  timeOfBirth: string;  // format: 'HH:MM'
  placeOfBirth: string; // format: 'City, Country'
}

interface AstrologicalChart {
  sunSign: string;
  moonSign: string;
  ascendant: string;
  // Ajouter d'autres éléments que vous souhaitez obtenir
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit
{
  
  @ViewChild('one', {static: true}) d1: ElementRef;
  focus:any = [];

  data:any = data;
  svg: any = [];
  svgid:any="";
  maisons:any = [];
  planetes:any = [];
  svgs: any;
  fileContent: any;

  API_KEY = "sk-proj-j9kbpq2atYCIZLF1XNbdT3BlbkFJHMm1dJ6003Zu36vbSFk4";
  API_URL = 'https://api.openai.com/v1/chat/completions';

  constructor(private elementRef: ElementRef<HTMLElement>) {}
  
  ngOnInit(): void 
  {
    this.fileContent = this.data;
    this.format();
    //this.test().then((r)=>console.log(r));
    
  }

  async test()
  {
    try {
      const response = await axios.post(
          this.API_URL,
          {
              model: 'gpt-4',  // Use the appropriate model here
              messages: [{ role: 'user', content: "Give me a thousand 6" }],
          },
          {
              headers: {
                  'Authorization': `Bearer ${this.API_KEY}`,
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Header': 'authorization'
              },
          }
      );

      // Extract the message from the response
      const message = response.data.choices[0].message.content;
      return message;
  } catch (error) {
      console.error('Error communicating with the OpenAI API:', error);
      return 'An error occurred while getting the response.';
  }
  }

  async getChatGPTResponse(nom: string,isPlanet:boolean): Promise<string> {
    let prompt = "";
    if(isPlanet) prompt = "Donne moi des informations detaillees sur "+nom+". Cette information provient de mon theme astral. Sépare la réponse en 3 points, l'influence de la planète sur le signe, puis l'influence des degrès et minutes sur le signe et enfin l'influence de la maison sur le signe. Détaille grandement ces trois points. N'utilise pas de guillemet.";
		else prompt = "Donne moi des informations detaillees sur "+nom+". Cette information provient de mon theme astral. Sépare la réponse en 2 points, l'influence de la maison sur le signe, puis l'influence des degrès et minutes sur le signe. Détaille grandement ces deux points. N'utilise pas de guillemet.";
			
    try {
        const response = await axios.post(
            this.API_URL,
            {
                model: 'gpt-4',  // Use the appropriate model here
                messages: [{ role: 'user', content: "500 caracteres maximum," + prompt }],
            },
            {
                headers: {
                    'Authorization': `Bearer ${this.API_KEY}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Extract the message from the response
        const message = response.data.choices[0].message.content;
        return message;
    } catch (error) {
        console.error('Error communicating with the OpenAI API:', error);
        return 'An error occurred while getting the response.';
    }
}

  read()
  {
      const fileInput: any = document.getElementById('fileInput');
      const file = fileInput.files?.[0];
      
      if (file) {
          const reader = new FileReader();
          
          reader.onload = this.handleFileLoad.bind(this);
          
          reader.readAsText(file);
      } else {
          console.error('No file selected');
      }
  }

  handleFileLoad(event: ProgressEvent<FileReader>): void {
    const reader = event.target as FileReader;
    this.fileContent = reader.result;

    // You can now process the file content using the instance method
    this.processFileContent();
}

processFileContent(): void {
  if (this.fileContent) {
      this.format();
  }
}

  format()
  {
    //let code = this.fileContent.split("\r\n");
    console.log(this.fileContent);
    let code = this.fileContent;
    let rgx = new RegExp(".*<div.* en (M|m)aison .*", 'i');
    let lignes = code.filter((c:any)=>c.match(rgx));

    lignes.forEach((s:any)=>{
        s = s.substring(s.indexOf(">")+1);
				s = s.substring(0,s.indexOf("<"));
				s = s.replace(/ +/g, " ");

        let nom2 = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
			let nom = nom2;
			nom = nom.replace(/Я/g, "");
			nom = nom.replace(/°/g, "deg");
			nom = nom.replace(/'/g, "min");
			nom = nom.replace(/ . /g, " ");
			nom = nom.replace(/ +/g, " ");
			nom = nom.replace(/\\p{M}/g, "");
			
			let maison = nom.substring(nom.indexOf("en Maison")+3);
			let signe = nom.substring(0,nom.indexOf("en Maison")-1);
			signe = signe.substring(signe.lastIndexOf(" ")+1);
			let degres = nom.substring(0,nom.indexOf("en Maison")-1);
			degres = degres.substring(0,degres.lastIndexOf(" "));
			degres = degres.substring(degres.lastIndexOf(" ")+1);
			let planete = nom.substring(0,nom.indexOf("en Maison")-1);
			planete = planete.substring(0,planete.lastIndexOf(" "));
			planete = planete.substring(0,planete.lastIndexOf(" "));

      let obj:any = {nom:nom2,type:"Planete",signe:signe,degres:degres,maison:maison,planete:planete,id:"objet"+this.signes(planete)};
      this.planetes.push(obj);   
      /*this.getChatGPTResponse(obj.nom,true).then(response => {
        obj.gpt = response.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
      })
      .catch(error => {
          console.error('Error:', error);
      });*/
			
    });

    rgx = new RegExp(".*>(M|m)aison .*°.*", 'i');
      lignes = code.filter((c:any)=>c.match(rgx));
      lignes.forEach((s:any)=>{
        s = s.substring(s.indexOf(">")+1);
				s = s.substring(0,s.indexOf("<"));
				s = s.replace(/ +/g, " ");
        console.log(s);

        let nom2 = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
        let nom = nom2;
        nom = nom.replace(/Я/g, "");
        nom = nom.replace(/°/g, "deg");
        nom = nom.replace(/'/g, "min");
        nom = nom.replace(/ . /g, " ");
        nom = nom.replace(/ +/g, " ");
        nom = nom.replace(/\\p{M}/g, "");
			let signe = nom.substring(nom.lastIndexOf(" ")+1);
			let degres = nom.substring(0,nom.lastIndexOf(" "));
			degres = degres.substring(degres.lastIndexOf(" ")+1);
			let maison = nom.substring(0,nom.lastIndexOf(" "));
			maison = maison.substring(0,maison.lastIndexOf(" "));

      //id des maisons
      //get gpt au clic
      
      let obj : any = {nom:nom2,type:"Maison",signe:signe,degres:degres,maison:maison,id:"objet"+this.signes(signe)};
			if(!this.planetes.find((p:any)=>obj.nom==p.nom))
      {
        this.planetes.push(obj); 
        /*this.getChatGPTResponse(obj.nom,false).then(response => {
          obj.gpt = response.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
        })
        .catch(error => {
            console.error('Error:', error);
        });*/
        
      }
      });  

      rgx = new RegExp(".*(>(M|m)ilieu du (C|c)iel .*°|>(A|a)scendant .*°).*", 'i');
      lignes = code.filter((c:any)=>c.match(rgx));
      lignes.forEach((s:any)=>{
        s = s.substring(s.indexOf(">")+1);
				s = s.substring(0,s.indexOf("<"));
				s = s.replace(/ +/g, " ");
        console.log(s);

        let nom2 = s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
        let nom = nom2;
        nom = nom.replace(/Я/g, "");
        nom = nom.replace(/°/g, "deg");
        nom = nom.replace(/'/g, "min");
        nom = nom.replace(/ . /g, " ");
        nom = nom.replace(/ +/g, " ");
        nom = nom.replace(/\\p{M}/g, "");
			let signe = nom.substring(nom.lastIndexOf(" ")+1);
			let degres = nom.substring(0,nom.lastIndexOf(" "));
			degres = degres.substring(degres.lastIndexOf(" ")+1);
			let maison = nom.substring(0,nom.lastIndexOf(" "));
			maison = maison.substring(0,maison.lastIndexOf(" "));

      //id des maisons
      //get gpt au clic
      
      let obj : any = {nom:nom2,type:"Planete",signe:signe,degres:degres,planete:maison,id:"objet"+this.signes(maison)};
			if(!this.planetes.find((p:any)=>obj.nom==p.nom))
      {
        this.planetes.push(obj); 
        /*this.getChatGPTResponse(obj.nom,false).then(response => {
          obj.gpt = response.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/°/g,"degres");
        })
        .catch(error => {
            console.error('Error:', error);
        });*/
        
      }
      });  

    /*
    rgx = new RegExp(".*<text id=\"text.*", 'i');
    lignes = code.filter((c:any)=>c.match(rgx));

    lignes.forEach((ligne:any)=>{
      let maison = ligne;
				maison = maison.substring(maison.indexOf(">")+1);
				maison = maison.substring(0,maison.indexOf("<"));
				
				let x = ligne;
				x = x.substring(x.indexOf("x=\"")+3);
				x = x.substring(0,x.indexOf("\""));
				
				let y = ligne;
				y = y.substring(y.indexOf("y=\"")+3);
				y = y.substring(0,y.indexOf("\""));
				
				this.planetes.push(this.getJson(maison,x,y,"Maison","x"));
    });
    */

    rgx = new RegExp(".*<svg id=\".*", 'i');
    let tmp = code.find((ligne:any)=>ligne.match(rgx));
    let idx = code.indexOf(tmp!);
    let svgs = code.slice(idx);
    rgx = new RegExp(".*</svg>.*", 'i');
    tmp = svgs.find((ligne:any)=>ligne.match(rgx));
    let idxend = svgs.indexOf(tmp!);
    svgs = svgs.slice(0,idxend+1);

    this.svg = svgs;
    console.log(this.planetes);
    console.log(this.svg);

    this.init(true);
  }

  getJson(nom :any, x :any, y :any, type :any, id: any)
	{
		return {nom:nom,x:x,y:y,type:type,id:id};
	}

  signes(objet: any)
	{
		switch(objet)
		{
			case "Belier":
          return "0";
      case "Taureau":
          return "1";
      case "Gemeaux":
          return "2";
      case "Cancer":
          return "3";
      case "Lion":
          return "4";
      case "Vierge":
          return "5";
      case "Balance":
          return "6";
      case "Scorpion":
          return "7";
      case "Sagittaire":
          return "8";
      case "Capricorne":
          return "9";
      case "Verseau":
          return "10";
      case "Poissons":
          return "11";
      case "Soleil":
          return "12";
      case "Lune":
          return "13";
      case "Mercure":
          return "14";
      case "Venus":
          return "15";
      case "Mars":
          return "16";
      case "Jupiter":
          return "17";
      case "Saturne":
          return "18";
      case "Uranus":
          return "19";
      case "Neptune":
          return "20";
      case "Pluton":
          return "21";
      case "Chiron":
          return "22";
      case "Ceres":
          return "23";
      case "Pallas":
          return "24";
      case "Junon":
          return "25";
      case "Vesta":
          return "26";
      case "Noeud Nord vrai":
      case "Nœud Nord vrai":
          return "27";
      case "Lilith vraie":
          return "28";
      case "Fortune":
          return "29";
      case "Ascendant":
          return "30";
      case "Milieu du Ciel":
          return "31";
      case "Vertex":
          return "44";
      case "Point Est":
          return "45";
		}
		return "NA";
	}

  init(first:boolean)
  {
    let element:any = this.d1;
    if(!first)
    {
      let el:any = document.getElementById(this.svgid);
      el.remove();
    }
    element.nativeElement.insertAdjacentHTML('beforeend', this.svg[0]);
    let tmp = this.svg[0];
    let id = tmp.substring(tmp.indexOf("id=\"")+4);
    id = id.substring(0,id.indexOf("\""));
    this.svgid = id;
    element = document.getElementById(id);
    if(!first)element.innerHTML = "";
    this.svgs = [];

    for(let i=1;i<this.svg.length;i++)
    {
      let s = this.svg[i];
      element.innerHTML = element.innerHTML += s;
    }

    for(let i=1;i<this.svg.length;i++)
      {
        let s = this.svg[i];
        if(s.match(/.*<image.*/g))
        {
          let nom = s.substring(s.indexOf("\"")+1);
          nom = nom.substring(0,nom.indexOf("\""));
          let objet:any = document.getElementById(nom);
          objet.addEventListener('click', () => {this.click(nom)});
          objet.addEventListener('mouseover', (event:any) => {this.addClass(nom)});
          this.svgs.push({nom:nom});
        }
      }


      console.log("PLANETES");
      this.svgs.forEach((svg:any)=>{
        svg.active = this.planetes.find((planete:any)=>planete.id==svg.nom) != undefined;
        if(!svg.active)
        {
          let objet:any = document.getElementById(svg.nom);
          objet.classList.add("disabled");
        }
      })
      console.log(this.svgs);
  }

  ngAfterViewInit() {
    //this.init(true);
    
  }

  addClass(s:string)
  {
    for(let i=1;i<this.svg.length;i++)
      {
        let x = this.svg[i];
        if(x.match(/.*<image.*/g))
        {
          let nom = x.substring(x.indexOf("\"")+1);
          nom = nom.substring(0,nom.indexOf("\""));
          let objet:any = document.getElementById(nom);
          objet.classList.remove("active");
        }
      }
  
      let objet:any = document.getElementById(s);
      objet.classList.add("active");
  }

  click(s:string)
  {
    let planetes = this.planetes.filter((p:any)=>p.id==s);
    console.log(planetes);
    this.focus = planetes;
  }
}

