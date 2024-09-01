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
  svgs: any;
  fileContent: any;
  clicked:any;
  general:any = {};
  data: any = [];
  informations: any = {};
  types:any;
  type:any;
  desc: any;
  aspects: any;
  
  menu = ["Hémisphère Nord/Sud", "Hémisphère Est/Ouest", "Modalités"];
  clicked2:any = this.menu[0];
  elements = {feu:["Bélier","Lion","Sagittaire"],air:["Gémeaux","Balance","Verseau"],terre:["Taureau","Vierge","Capricorne"],eau:["Cancer","Scorpion","Poissons"]};
  planetes = ["Soleil","Saturne","Mars","Mercure","Vénus","Neptune","Jupiter","Lune","Uranus","Pluton"];
  signes = ["Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons", "Bélier", "Taureau"];
  maisons = ["Maison I", "Maison II", "Maison III", "Maison IV", "Maison V", "Maison VI", "Maison VII", "Maison VIII", "Maison IX", "Maison X", "Maison XI", "Maison XII"];
  asteroides = ["Chiron","Nœud Nord","Nœud Sud","Cérès","Junon","Pallas","Fortune","Vertex","Vesta","Lilith","Point Est"];

  API_URL = 'https://api.openai.com/v1/chat/completions';
  
  public innerWidth: any = window.outerWidth;
  public innerHeight: any = window.outerHeight;

  constructor(private http : HttpClient) {}
  
  ngOnInit(): void 
  {
    this.readFile();
    //this.readSigneGpt();
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
    this.general = {};
    this.data = [];

    this.aspects = [];
    let code = this.fileContent.split("\r\n");

    let rgx = new RegExp(".*<div.*", 'g');
    let lignes = code.filter((c:any)=>c.match(rgx));
    rgx = new RegExp(".*<div.* en (M|m)aison .*");

    lignes.forEach((s:any)=>{
      s = s.replace(/ Я /," ");

      if(s.includes(" en Maison "))
      {
        if(s.includes(">Aspects"))
        {
          let a = s;
          let aspects : any[] = s.split("style=\"color: #");
          for(let i=1;i<aspects.length;i++)
          {
            let asp = aspects[i];
            asp = asp.substring(asp.indexOf(">")+1);
            let aspect = asp.substring(0,asp.indexOf("<"));
            aspect = aspect.substring(0,aspect.lastIndexOf(" "));
            let from = aspect.substring(0,aspect.indexOf(" "));
            aspect = aspect.substring(aspect.indexOf(" ")+1);
            let type = aspect.substring(0,aspect.indexOf(" "));
            aspect = aspect.substring(aspect.indexOf(" ")+1);
            let to = aspect.substring(0,aspect.indexOf(" "));
            aspects[i] = {from:from,type:type,to:to};
            if(this.aspects.find((as:any)=>as.from==from&&as.to==to&&as.type==type)==undefined)this.aspects.push(aspects[i]);
            //else console.log(aspects[i]);
          }
        }
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

        if(nom=="Nœud Nord")this.data.push({nom:"Nœud Sud",signe:this.opposite(signe),maison:"Pas de Maison"});
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
    let emispheres = this.data;
    emispheres = emispheres.filter((e:any)=>e.nom);
    emispheres = emispheres.filter((e:any)=>this.planetes.includes(e.nom));
    console.log("emispheres",emispheres);
    emispheres = {
      nord:emispheres.filter((e:any)=>e.maison=="Maison I"||e.maison=="Maison II"||e.maison=="Maison III"||e.maison=="Maison IV"||e.maison=="Maison V"||e.maison=="Maison VI").length,
      sud:emispheres.filter((e:any)=>e.maison=="Maison VII"||e.maison=="Maison VIII"||e.maison=="Maison IX"||e.maison=="Maison X"||e.maison=="Maison XI"||e.maison=="Maison XII").length,
      est:emispheres.filter((e:any)=>e.maison=="Maison X"||e.maison=="Maison XI"||e.maison=="Maison XII"||e.maison=="Maison I"||e.maison=="Maison II"||e.maison=="Maison III").length,
      ouest:emispheres.filter((e:any)=>e.maison=="Maison IV"||e.maison=="Maison V"||e.maison=="Maison VI"||e.maison=="Maison VII"||e.maison=="Maison VIII"||e.maison=="Maison IX").length
    };
    console.log("emispheres",emispheres);
    this.general.emispherenord = this.infos.general.find((g:any)=>g.nord==emispheres.nord&&g.sud==emispheres.sud);
    this.general.emisphereest = this.infos.general.find((g:any)=>g.est==emispheres.est&&g.ouest==emispheres.ouest);

    let elements = this.data;
    elements = elements.filter((e:any)=>this.planetes.includes(e.nom));
    console.log("elements",elements);
    elements = {
      eau:elements.filter((e:any)=>this.elements.eau.includes(e.signe)).length,
      air:elements.filter((e:any)=>this.elements.air.includes(e.signe)).length,
      feu:elements.filter((e:any)=>this.elements.feu.includes(e.signe)).length,
      terre:elements.filter((e:any)=>this.elements.terre.includes(e.signe)).length,
    }
    elements.yang = elements.feu+elements.air;
    elements.yin = elements.terre+elements.eau;
    this.general.yang = this.infos.general.find((g:any)=>g.yang==elements.yang&&g.yin==elements.yin);

    this.init(!this.informations);
  }

  getGeneral()
  {
    if(!this.general.yang)return [];
    if(this.clicked2==this.menu[0])return this.general.emispherenord.data;
    else if(this.clicked2==this.menu[1])return this.general.emisphereest.data;
    else if(this.clicked2==this.menu[2])return this.general.yang.data;
  }

  getJson(nom :any, x :any, y :any, type :any, id: any)
	{
		return {nom:nom,x:x,y:y,type:type,id:id};
	}

  signes2(objet: any)
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
      case "100":
          return "Nœud Sud";
		}
		return "NA";
	}

  opposite(signe:any)
  {
    switch(signe)
    {
      case 'Bélier':
          return 'Balance';
      case 'Taureau':
          return 'Scorpion';
      case 'Gémeaux':
          return 'Sagittaire';
      case 'Cancer':
          return 'Capricorne';
      case 'Lion':
          return 'Verseau';
      case 'Vierge':
          return 'Poissons';
      case 'Balance':
          return 'Bélier';
      case 'Scorpion':
          return 'Taureau';
      case 'Sagittaire':
          return 'Gémeaux';
      case 'Capricorne':
          return 'Cancer';
      case 'Verseau':
          return 'Lion';
      case 'Poissons':
          return 'Vierge';
      default:
          return 'Signe inconnu';
    }
  }

  init(first:boolean)
  {
    this.desc = undefined;
    this.types = [];
    this.focus = [];
    let element:any = this.d1;
    if(!first)
    {
      let el:any = document.getElementById(this.svgid);
      if(el)el.remove();
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
      if(s.includes("objet27"))
      {
        let x = s.substring(s.indexOf("x=")+3);
        x = x.substring(0,x.indexOf("\""));
        let y = s.substring(s.indexOf("y=")+3);
        y = y.substring(0,y.indexOf("\""));
        x = 510 - x - 35;
        y = 510 - y;
        let svg = "<image id=\"objet100\" class=\"planete noeudSud\" x=\""+x+"\" y=\""+y+"\" width=\"35\" height=\"35\" href=\"./assets/noeudsud.png\"></image>" 
        this.svg.push(svg);

        let line = this.svg[i+1];
        let x1 = line.substring(line.indexOf("x1=")+4);
        x1 = x1.substring(0,x1.indexOf("\""));
        let x2 = line.substring(line.indexOf("x2=")+4);
        x2 = x2.substring(0,x2.indexOf("\""));
        let y1 = line.substring(line.indexOf("y1=")+4);
        y1 = y1.substring(0,y1.indexOf("\""));
        let y2 = line.substring(line.indexOf("y2=")+4);
        y2 = y2.substring(0,y2.indexOf("\""));
        x1 = 510 - x1;
        x2 = 510 - x2;
        y1 = 510 - y1;
        y2 = 510 - y2;
        line = "<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" "
        + line.substring(line.indexOf("style="));
        this.svg.push(line);

        let line2 = this.svg[i+2];
        x1 = line2.substring(line2.indexOf("x1=")+4);
        x1 = x1.substring(0,x1.indexOf("\""));
        x2 = line2.substring(line2.indexOf("x2=")+4);
        x2 = x2.substring(0,x2.indexOf("\""));
        y1 = line2.substring(line2.indexOf("y1=")+4);
        y1 = y1.substring(0,y1.indexOf("\""));
        y2 = line2.substring(line2.indexOf("y2=")+4);
        y2 = y2.substring(0,y2.indexOf("\""));
        x1 = 510 - x1;
        x2 = 510 - x2;
        y1 = 510 - y1;
        y2 = 510 - y2 + 35;
        line2 = "<line x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" "
        + line2.substring(line2.indexOf("style="));
        this.svg.push(line2);
      }
      element.innerHTML = element.innerHTML + s;
    }

    for(let i=1;i<this.svg.length;i++)
      {
        let s = this.svg[i];
        if(s.match(/.*<image.*/g) || s.match(/.*<text id=\"texte.*/g))
        {
          let nom = s.substring(s.indexOf("\"")+1);
          nom = nom.substring(0,nom.indexOf("\""));
          let signe = this.signes2(nom);
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

  clickAccueil()
  {
    this.types = [];
    this.desc = undefined;
    this.focus = [];
  }

  getFocus()
  {
    return this.focus.filter((f:any)=>f.type==this.type);
  }

  click(s:string)
  {
    this.focus = [];
    this.clicked = s;
    this.desc = this.infos.desc.find((d:any)=>d.nom == s).infos;
    this.type = "Planetes";
    if(this.asteroides.includes(s))this.type = "Asteroides";
    else if(this.maisons.includes(s))this.type = "Maisons";
    else if(this.signes.includes(s))this.type = "Signes";
    let data = this.data;

    console.log(this.type);
    if(this.type=="Asteroides"||this.type=="Planetes")
    {
      data = data.filter((d:any)=>d.nom==s);
      let ligne = data.find((d:any)=>d.nom==s);
      console.log(data);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(s!="Nœud Sud")
        {
          //Planete ou Asteroide en Maison
          let x = this.infos.maisons.find((m:any)=>m.maison==d.maison&&m.nom==d.nom);
          this.focus.push({nom:x.maison,data:x.data,type:"Maisons"});
        }
        //Planete ou Asteroide dans signe
        let x = signe.find((s:any)=>s.nom==d.nom);
        this.focus.push({nom:ligne.signe,data:x.data,type:"Signes"});
      });
      
      let aspects = this.aspects.filter((a:any)=>a.from==s||a.to==s);
      aspects.forEach((a:any)=>{
        let infos = this.infos.aspects.find((i:any)=>i.from==a.from&&i.type==a.type&&i.to==a.to);
        this.focus.push({nom:infos.from + " " + infos.type + " " + infos.to,data:infos.data,type:"Aspects"});
      });

      let domiciles = this.infos.domiciles.filter((d:any)=>d.nom==s&&d.signe==ligne.signe);
      domiciles.forEach((d:any)=>{
        this.focus.push({nom: d.nom + ", " + d.type + " en " + d.signe, data:d.data,type:"Dignités"});
      })
    }
    else if(this.type=="Maisons")
    {
      data = data.filter((d:any)=>this.maisons.includes(d.maison));
      data = data.filter((d:any)=>d.maison==s);
      console.log(data);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(!d.nom){
          //Maison dans signe
          let x = signe.find((s:any)=>s.nom==d.maison);
          let ligne = data.find((d:any)=>d.maison==s&&!d.nom);
          this.focus.push({nom:ligne.signe,data:x.data,type:"Signes"});
        }
        else{
          //Planete ou Asteroide en Maison
          let x = this.infos.maisons.find((m:any)=>m.maison==d.maison&&m.nom==d.nom);
          let ligne = data.find((d:any)=>d.maison==s&&d.nom);
          this.focus.push({nom:ligne.nom,data:x.data,type:this.planetes.includes(x.nom)?"Planetes":"Asteroides"});
        }
      });
    }
    else if(this.type=="Signes")
    {
      data = data.filter((d:any)=>this.signes.includes(d.signe));
      data = data.filter((d:any)=>d.signe==s);
      console.log(data);
      let ligne = data.find((d:any)=>d.signe==s&&!d.nom);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(!d.nom){
          //Maison dans signe
          let x = signe.find((s:any)=>s.nom==d.maison);
          this.focus.push({nom:ligne.maison,data:x.data,type:"Maisons"});
        }
        else{
          //Planete ou Asteroide dans signe
          let x = signe.find((s:any)=>s.nom==d.nom);
          this.focus.push({nom:x.nom,data:x.data,type:this.planetes.includes(x.nom)?"Planetes":"Asteroides"});
        }
      });
    }
    const unique = [...new Set(this.focus.map((item:any) => item.type))];
    this.types = unique;
    this.type = unique[0];
    console.log("this.types",this.types);
    console.log(this.focus);
  }

  click2(s:string)
  {
    this.clicked = s;
    this.desc = this.infos.desc.find((d:any)=>d.nom == s).infos;
    let signe = this.infos.data.find((i:any)=>i.nom==s);
    if(!signe)
    {
      let data = [];
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
      let infos = signe.find((d:any)=>d.nom==s);

      console.log(infos);
      if(this.planetes.includes(infos.nom))
        data.push({nom:infos.nom,datas:infos.data,type:"Planetes"});
      else
        data.push({nom:infos.nom,datas:infos.data,type:"Asteroides"});
      
      let aspects = this.aspects.filter((a:any)=>a.from==s||a.to==s);
      aspects.forEach((a:any)=>{
        let infos = this.infos.aspects.find((i:any)=>i.from==a.from&&i.type==a.type&&i.to==a.to);
        data.push({nom:infos.from + " " + infos.type + " " + infos.to,datas:infos.data,type:"Aspects"});
      });

      let domiciles = this.infos.domiciles.filter((d:any)=>d.nom==s&&d.signe==ligne.signe);
      domiciles.forEach((d:any)=>{
        data.push({nom: d.nom + ", " + d.type + " en " + d.signe, datas:d.data,type:"Dignités"});
      })

      const unique = [...new Set(data.map((item:any) => item.type))];
      this.types = unique;
      this.type = unique[0];
      this.focus = data;
      console.log("1",data);
      return;
    }
    signe = signe.data;
    let data = this.data.filter((d:any)=>d.nom==s||d.signe==s||d.maison==s);
    data.forEach((d:any)=>{
      let datas: any = [];
      let infos = signe.find((s:any)=>s.nom==d.nom);
      if(infos)
      {
        if(this.planetes.includes(infos.nom))
          d.type="Planetes";
        else
          d.type="Asteroides";
        infos.data.forEach((a:any)=>datas.push(a));
      }
      else
      {
        let maison = signe.find((s:any)=>s.nom==d.maison);
        d.type="Maisons";
        if(maison)maison.data.forEach((a:any)=>datas.push(a));
      }
      
      d.datas = datas;
    });

    const unique = [...new Set(data.map((item:any) => item.type))];
    this.types = unique;
    this.type = unique[0];
    console.log("2",data);
    this.focus = data;
  }
}

