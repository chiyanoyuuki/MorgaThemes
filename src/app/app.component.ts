import { Component, ElementRef, NgModule, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as INFOS from '../assets/data.json';


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

  infos: any = INFOS;

  hover:any = "Sélectionnez un point";
  svg: any = [];
  svgid:any="";
  maisons:any = [];
  planetes:any = [];
  svgs: any;
  fileContent: any;
  clicked:any;
  data: any = [];
  informations: any = {};
  desc: any;

  API_URL = 'https://api.openai.com/v1/chat/completions';
  
  public innerWidth: any = window.outerWidth;
  public innerHeight: any = window.outerHeight;

  constructor(private http : HttpClient) {}
  
  ngOnInit(): void 
  {
    this.readFile();
  }

  readFile()
  {
    this.http.get("../assets/charles.txt",{responseType: 'text'}).subscribe(text => {
      this.fileContent = text;
      this.format();
    });
  }

  readSigneGpt()
  {
    let signe = "Balance";

    this.http.get("../assets/signe.txt",{responseType: 'text'}).subscribe(text => {
      let lignes = text.split("\r\n");
      lignes = lignes.filter((ligne:any)=>ligne.length>1);
      let planetes:any = {nom:"Planetes",data:[]};
      let asteroides:any = {nom:"Asteroides",data:[]};
      let maisons:any = {nom:"Maisons",data:[]};
      let type;
      let data:any;
      for(let i=0;i<lignes.length;i++)
      {
        let ligne = lignes[i];
        if(ligne=="Planetes")type = "Planetes";
        else if(ligne=="Asteroides")
        {
          planetes.data.push(data);
          data = undefined;
          type = "Asteroides";
        }
        else if(ligne=="Maisons")
        {
          asteroides.data.push(data);
          data = undefined;
          type = "Maisons";
        }
        else if(!ligne.startsWith(" "))
        {
          if(data){
            if(type=="Planetes")planetes.data.push(data);
            else if(type=="Asteroides")asteroides.data.push(data);
            else if(type=="Maisons")maisons.data.push(data);
          }
          data = {nom:ligne,data:[]};
        }
        else
        {
          let infos = ligne.split(":");
          data.data.push({nom:infos[0],data:infos[1]});
        }
      }
      maisons.data.push(data);
      console.log({nom:signe,planetes:planetes,asteroides:asteroides,maisons:maisons});
    });
  }

  /*async getChatGPTResponse(nom: string,isPlanet:boolean): Promise<string> {
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
}*/

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
    let code = this.fileContent.split("\r\n");

    let rgx = new RegExp(".*<div.*", 'g');
    let lignes = code.filter((c:any)=>c.match(rgx));
    rgx = new RegExp(".*<div.* en (M|m)aison .*");

    lignes.forEach((s:any)=>{
      s = s.replace(/ Я /," ");

      if(s.includes(" en Maison "))
      {
        s = s.substring(s.indexOf(">")+1);
        s = s.substring(0,s.indexOf("<"));
        
        let signe = s.substring(0,s.indexOf(","));
        signe = signe.substring(signe.lastIndexOf(" ")+1);

        let nom = s.substring(0,s.indexOf(","));
        nom = nom.substring(0,nom.lastIndexOf(" "));
        nom = nom.substring(0,nom.lastIndexOf(" "));
        nom = nom.replace(/( vraie| vrai)/g,"");

        let maison = s.substring(s.indexOf(",")+2);
        maison = maison.substring(maison.indexOf(" ")+1);

        this.data.push({nom:nom,signe:signe,maison:maison});
      }
      else if(s.includes(">Maison ")||s.includes(">Milieu du Ciel ")||s.includes(">Ascendant"))
      {
        s = s.substring(s.indexOf(">")+1);
        s = s.substring(0,s.indexOf("<"));

        let signe = s.substring(s.lastIndexOf(" ")+1);

        let nom = s.substring(0,s.lastIndexOf(" "));
        nom = nom.substring(0,nom.lastIndexOf(" "));

        if(nom.includes("Ascendant"))nom = "Maison I";
        else if(nom.includes("Milieu du Ciel"))nom = "Maison X";

        if(!this.data.find((d:any)=>d.signe==signe&&d.maison==nom&&!d.nom))this.data.push({signe:signe,maison:nom});
      }
      else if(s.includes("<div class=\"identiteNaissance\">"))
      {
        let prenom = s.substring(s.indexOf(">")+1);
        prenom = prenom.substring(0,prenom.indexOf("<"));
        let idx = lignes.indexOf(s);
        let date = lignes[idx+1];
        date = date.substring(date.indexOf(">")+1);
        date = date.substring(date.indexOf(">")+1);
        date = date.substring(0,date.indexOf(","));
        let heure = lignes[idx+1];
        heure = heure.substring(heure.indexOf(">")+1);
        heure = heure.substring(heure.indexOf(">")+1);
        heure = heure.substring(heure.indexOf(",")+1);
        heure = heure.substring(0,heure.indexOf("<"));
        let lieu = lignes[idx+1];
        lieu = lieu.substring(lieu.indexOf(",")+1);
        lieu = lieu.substring(lieu.indexOf(">")+1);
        lieu = lieu.substring(lieu.indexOf(">")+1);
        lieu = lieu.substring(0,lieu.indexOf(","));
        this.informations = {prenom:prenom,date:date,heure:heure,lieu:lieu};
      }
    });

    rgx = new RegExp(".*<svg id=\".*", 'i');
    let tmp = code.find((ligne:any)=>ligne.match(rgx));
    let idx = code.indexOf(tmp!);
    let svgs = code.slice(idx);
    rgx = new RegExp(".*</svg>.*", 'i');
    tmp = svgs.find((ligne:any)=>ligne.match(rgx));
    let idxend = svgs.indexOf(tmp!);
    svgs = svgs.slice(0,idxend+1);
    this.svg = svgs;

    console.log("this.data",this.data);
    this.init(true);
  }

  getJson(nom :any, x :any, y :any, type :any, id: any)
	{
		return {nom:nom,x:x,y:y,type:type,id:id};
	}

  signes(objet: any)
	{
    objet = objet.replace(/[^0-9]/g,"");
		switch(objet)
		{
			case "0":
          return "Bélier";
      case "1":
          return "Taureau";
      case "2":
          return "Gémeaux";
      case "3":
          return "Cancer";
      case "4":
          return "Lion";
      case "5":
          return "Vierge";
      case "6":
          return "Balance";
      case "7":
          return "Scorpion";
      case "8":
          return "Sagittaire";
      case "9":
          return "Capricorne";
      case "10":
          return "Verseau";
      case "11":
          return "Poissons";
      case "12":
          return "Soleil";
      case "13":
          return "Lune";
      case "14":
          return "Mercure";
      case "15":
          return "Vénus";
      case "16":
          return "Mars";
      case "17":
          return "Jupiter";
      case "18":
          return "Saturne";
      case "19":
          return "Uranus";
      case "20":
          return "Neptune";
      case "21":
          return "Pluton";
      case "22":
          return "Chiron";
      case "23":
          return "Cérès";
      case "24":
          return "Pallas";
      case "25":
          return "Junon";
      case "26":
          return "Vesta";
      case "27":
          return "Nœud Nord";
      case "28":
          return "Lilith";
      case "29":
          return "Fortune";
      case "30":
      case "32":
          return "Maison I";
      case "33":
          return "Maison II";
      case "34":
          return "Maison III";
      case "35":
          return "Maison IV";
      case "36":
          return "Maison V";
      case "37":
          return "Maison VI";
      case "38":
          return "Maison VII";
      case "39":
          return "Maison VIII";
      case "40":
          return "Maison IX";
      case "31":
      case "41":
          return "Maison X";
      case "42":
          return "Maison XI";
      case "43":
          return "Maison XII";
      case "44":
          return "Vertex";
      case "45":
          return "Point Est";
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
        if(s.match(/.*<image.*/g) || s.match(/.*<text id=\"texte.*/g))
        {
          let nom = s.substring(s.indexOf("\"")+1);
          nom = nom.substring(0,nom.indexOf("\""));
          let signe = this.signes(nom);
          let objet:any = document.getElementById(nom);
          objet.addEventListener('click', () => {this.click(signe)});
          objet.addEventListener('mouseover', (event:any) => {this.hover=signe ;this.addClass(nom)});
          this.svgs.push({nom:signe,id:nom});
        }
      }


      //console.log("PLANETES");
      this.svgs.forEach((svg:any)=>{
        svg.active = this.data.find((d:any)=>d.nom==svg.nom||d.signe==svg.nom||d.maison==svg.nom) != undefined;
        if(!svg.active)
        {
          let objet:any = document.getElementById(svg.id);
          objet.classList.add("disabled");
        }
      })
      console.log("svg",this.svgs);
  }

  ngAfterViewInit() {
    //this.init(true);
    
  }

  addClass(s:string)
  {
    for(let i=1;i<this.svg.length;i++)
      {
        let x = this.svg[i];
        if(x.match(/.*<image.*/g) || x.match(/.*<text id=\"texte.*/g))
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
    console.log("click",s);
    this.clicked = s;
    this.desc = this.infos.desc.find((d:any)=>d.nom == s).infos;
    console.log(this.infos.data);
    let signe = this.infos.data.find((i:any)=>i.nom==s);
    console.log(signe);
    if(!signe)
    {
      let ligne = this.data.find((d:any)=>d.maison==s&&!d.nom);
      if(ligne)
      {
        signe = this.infos.data.find((i:any)=>i.nom==ligne.signe).data;
      }
      else
      {
        ligne = this.data.find((d:any)=>d.nom==s);
        signe = this.infos.data.find((i:any)=>i.nom==ligne.signe).data;
      }
      console.log(ligne);
      console.log(signe);
      let infos = signe.find((d:any)=>d.nom==s);
      this.focus = [{nom:infos.nom,datas:infos.data}];
      console.log(this.focus);
      return;
    }
    signe = signe.data;
    let data = this.data.filter((d:any)=>d.nom==s||d.signe==s||d.maison==s);
    console.log(data);
    data.forEach((d:any)=>{
      let datas: any = [];
      let infos = signe.find((s:any)=>s.nom==d.nom);
      if(infos)
      {
        infos.data.forEach((a:any)=>datas.push(a));
      }
      else
      {
        let maison = signe.find((s:any)=>s.nom==d.maison);
        maison.data.forEach((a:any)=>datas.push(a));
      }
      
      d.datas = datas;
    });
    this.focus = data;
  }
}

