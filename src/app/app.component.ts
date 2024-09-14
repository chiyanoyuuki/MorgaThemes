import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, ElementRef, HostListener, NgModule, OnInit, ViewChild, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as INFOS from '../assets/data.json';
import { environment } from 'src/environments/environment';
import { AutomationServiceService } from './automation-service.service';


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
  styleUrls: ['./app.component.scss'],
  animations: [
    trigger('moveAndRotate', [
      state('start', style({
        transform: 'translateX(0) translateY(0) rotate(0deg)'
      })),
      state('end', style({
        transform: 'translateX(-150%) translateY(50%) rotate(-100deg)'
      })),
      transition('start => end', [
        animate('300s ease-out')
      ]),
      transition('end => start', [
        animate('300s ease-out')
      ])
    ])
  ]
})

export class AppComponent implements OnInit
{
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;
  @ViewChild('textes') textes!: ElementRef;
  @ViewChild('one', {static: true}) d1: ElementRef;
  focus:any = [];

  JOURS = Array.from({ length: 31 }, (_, index) => index + 1);
  MOIS: string[] = [
    "Janvier",
    "Février",
    "Mars",
    "Avril",
    "Mai",
    "Juin",
    "Juillet",
    "Août",
    "Septembre",
    "Octobre",
    "Novembre",
    "Décembre"
];
HEURES = Array.from({ length: 24 }, (_, index) => index);
MINUTES = Array.from({ length: 60 }, (_, index) => index);
VALUES:any = ["",1,"Janvier",1990,12,0,""];

  infos: any = INFOS;

  moveAndRotate = "start";
  hover:any;
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
  onglets = ["Accueil","Domaines","Général"];
  onglet = this.onglets[0];
  domaines:any;
  svgAspects:any;
  loading = false;
  
  stelliums: any = [];
  termes = ["Ascendant","Milieu du ciel"];
  menu = ["Hémisphère Nord/Sud", "Hémisphère Est/Ouest", "Modalités"];
  clicked2:any = this.menu[0];
  elements = {feu:["Bélier","Lion","Sagittaire"],air:["Gémeaux","Balance","Verseau"],terre:["Taureau","Vierge","Capricorne"],eau:["Cancer","Scorpion","Poissons"]};
  planetes = ["Soleil","Saturne","Mars","Mercure","Vénus","Neptune","Jupiter","Lune","Uranus","Pluton"];
  signes = ["Gémeaux", "Cancer", "Lion", "Vierge", "Balance", "Scorpion", "Sagittaire", "Capricorne", "Verseau", "Poissons", "Bélier", "Taureau"];
  maisons = ["Maison III","Maison VIII","Maison XII","Maison VII","Maison II","Maison IV","Maison XI","Maison IX","Maison VI","Maison I","Maison V","Maison X"];
  asteroides = ["Chiron","Nœud Nord","Nœud Sud","Cérès","Junon","Pallas","Fortune","Vertex","Vesta","Lilith","Point Est"];
  typesaspects = ["semi-quinconce","opposition","sesqui-carré", "semi-carré","carré","semi-sextile","conjonction","quinconce","trigone","sextile","biquintile","quintile","novile","dodecile","bi-quintile"]
  domaine:any;
  edit = true;

  showListe = false;
  API_URL = 'https://api.openai.com/v1/chat/completions';
  
  public innerWidth: any = window.outerWidth;
  public innerHeight: any = window.outerHeight;

  interval: any;
  interval2:any;

  files:any = [];
  fileModel = "Nouveau Theme";
  filesOpen = false;

  constructor(private http : HttpClient, private fileService: AutomationServiceService) {}
  
  ngOnInit(): void 
  {
    this.startInterval(100,"end");
    this.getFiles();

    /*this.http.post('http://localhost:3000/api/lancer-tests', {}).subscribe(response => {
      console.log(response);
    });*/

    /*
    let lion = this.infos.stelliums.filter((s:any)=>s.signe=="Lion");
    let taureau = this.infos.stelliums.filter((s:any)=>s.signe=="Taureau");
    let miss:any = [];

    taureau.forEach((t:any)=>{
      if(lion.find((l:any)=>l.noms.includes(t.noms[0])&&l.noms.includes(t.noms[1])&&l.noms.includes(t.noms[2]))==undefined)
        miss.push(t.noms);
    })
    
    miss.forEach((m:any)=>console.log(m[0]+" "+m[1]+" "+m[2]));*/

    //9
    //Scorpion, Balance, Taureau, Capricorne, Bélier, Gémeaux, Sagittaire, Poissons, Lion, Verseau
    //Vierge, Cancer
    /*this.infos.stelliums.forEach((a:any)=>{
      let b = this.infos.stelliums.filter((c:any)=>c.noms.includes(a.noms[0])&&c.noms.includes(a.noms[1])&&c.noms.includes(a.noms[2])&&c.signe==a.signe);
      if(b.length>1)console.log(b);
    });
    this.planetes.forEach((p:any)=>{
      let nb = this.infos.stelliums.filter((s:any)=>s.noms.includes(p)&&s.signe=="Verseau").length;
      console.log(p,nb)
    });*/

    //this.downloadFile();
    
    if(isDevMode())
    {
      this.VALUES = ["Charles",23,"Octobre",1995,10,20,"Montivilliers"];
      //this.readFile();
    }
      
    //this.readSigneGpt();
  }

  getFile(file:any)
  {
    let mois = this.MOIS.indexOf(file[2])+1;
    return file[1]+"/"+(mois<10?"0"+mois:mois)+"/"+file[3];
  }

  getFiles()
  {
    this.files = [{nom:"Nouveau Thème"},{nom:"Fichier Local"}];
    this.fileService.getFiles().subscribe((data:any)=>{
      data = JSON.parse(data);
      data.forEach((d:string)=>{
        let datas = d.split("_");
        let mois = this.MOIS.indexOf(datas[2])+1;
        let nom = datas[0][0].toUpperCase()+datas[0].substring(1);
    
        this.files.push(
          {
            nom:nom,
            date:datas[1]+"/"+(mois<10?"0"+mois:mois)+"/"+datas[3],
            heure:datas[4]+":"+datas[5].substring(0,datas[5].indexOf(".")),
            value:[datas[0],datas[1],datas[2],datas[3],datas[4],datas[5]]
          }
        );
      })
    });
  }

  fileChange(file:any)
  {
    if(file.nom=="Nouveau Thème")
    {
      this.edit = true;
      this.VALUES = [
        "",
        1,
        "Janvier",
        1990,
        12,
        0,
        "",
      ]
    }
    else if(file.nom=="Fichier Local")
    {
      this.fileInput.nativeElement.click();
    }
    else
    {
      this.edit = false;
      this.VALUES = [
        file.value[0][0].toUpperCase() + file.value[0].substring(1).toLowerCase(),
        Number.parseInt(file.value[1]),
        file.value[2],
        Number.parseInt(file.value[3]),
        Number.parseInt(file.value[4]),
        Number.parseInt(file.value[5]),
        "",
      ]
      let v = this.VALUES;
      let i = this.informations;
      console.log("v",v);
      console.log("i",i);
      if(v[0]==i.prenom
        &&i.date.includes(""+v[1])&&i.date.includes(v[2].toLowerCase())&&i.date.includes(""+v[3])
        &&i.heure.includes(""+v[4])&&i.heure.includes(""+v[5])
      )
      {}
      else
        this.downloadFile();
    }
    this.filesOpen = false;
  }

  isValidateDisabled()
  {
    if(this.VALUES[0]=="")return true;
    if(this.VALUES[3]<1800 || this.VALUES[3]>2024)return true;
    if(this.VALUES[6]=="")return true;
    return false;
  }

  downloadFile() {
    this.loading = true;
    this.fileService.downloadFile(this.VALUES).subscribe(blob => {
      this.fileContent = blob;
      this.format();
      this.getFiles();
    });
  }

  startInterval(i:any, s:any)
  {
    this.interval = setInterval(() => {
      this.moveAndRotate = s;
      clearInterval(this.interval);
      this.startInterval(300000,s=="start"?"end":"start");
    },i);
  }

  readFile()
  {
    this.http.get("../assets/themes/theme.txt",{responseType: 'text'}).subscribe(text => {
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

  read(event:any)
  {
      const fileInput: any = event.target;
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
    this.edit = false;
    this.setDomaine();
    this.general = {};
    this.data = [];

    this.aspects = [];
    let code = this.fileContent.split("\r\n");
    if(code.length==1)
      code = this.fileContent.split("\n");

    let rgx = new RegExp(".*<div.*", 'g');
    let lignes = code.filter((c:any)=>c.match(rgx));

    rgx = new RegExp(".*<div.* en (M|m)aison .*");

    lignes.forEach((s:any)=>{
      s = s.replace(/ Я /," ");

      if(s.includes(" en Maison "))
      {
        if(s.includes(">Aspects"))
        {
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

        let degres = s.substring(0,s.indexOf(","));
        degres = degres.substring(0,degres.lastIndexOf(" "));
        degres = degres.substring(degres.lastIndexOf(" ")+1);
      
        let secondes = degres.substring(degres.indexOf("°")+1);
        secondes = secondes.substring(0,secondes.indexOf("'"));

        degres = degres.substring(0,degres.indexOf("°"));

        let maison = s.substring(s.indexOf(",")+2);
        maison = maison.substring(maison.indexOf(" ")+1);

        if(nom=="Nœud Nord")this.data.push({nom:"Nœud Sud",signe:this.opposite(signe),maison:"Pas de Maison"});
        this.data.push({nom:nom,signe:signe,maison:maison,degres:degres,secondes:secondes});
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

    this.stelliums = [];
    let dataplanetes = this.data.filter((d:any)=>d.nom&&this.planetes.includes(d.nom));
    dataplanetes.forEach((p:any)=>{
      {
        let planetes = dataplanetes.filter((d:any)=>d.signe==p.signe);
        if(planetes.length>2)
        {
          let stelliums = [];
          for(let i = 0; i < planetes.length -2; i++){
            for(let j = i + 1; j < planetes.length -1; j++){
              for(let k = j + 1; k < planetes.length; k++){
                let st = this.infos.stelliums.find((s:any)=>s.noms.includes(planetes[i].nom)&&s.noms.includes(planetes[j].nom)&&s.noms.includes(planetes[k].nom)&&s.signe==p.signe);
                if(stelliums.find((stel:any)=>stel.noms==st.noms&&stel.signe==st.signe)==undefined)stelliums.push(st);
              }
            }
          }
          stelliums.forEach((s:any)=>{
            if(s==undefined)return;
            let plans = [this.getPlaneteFromDataByName(s.noms[0]),this.getPlaneteFromDataByName(s.noms[1]),this.getPlaneteFromDataByName(s.noms[2])];
            plans = plans.sort((a:any,b:any)=>{return b.degres-a.degres});
            let ecart = plans[0].degres - plans[2].degres;
            if(ecart<11)
            {
              if(this.stelliums.find((s2:any)=>s2.noms.includes(s.noms[0])&&s2.noms.includes(s.noms[1])&&s2.noms.includes(s.noms[2]))==undefined)
                this.stelliums.push(s);
            }
          })
        }
      }
    })      

    rgx = new RegExp(".*<svg id=\".*", 'i');
    let tmp = code.find((ligne:any)=>ligne.match(rgx));
    let idx = code.indexOf(tmp!);
    let svgs = code.slice(idx);
    rgx = new RegExp(".*</svg>.*", 'i');
    tmp = svgs.find((ligne:any)=>ligne.match(rgx));
    let idxend = svgs.indexOf(tmp!);
    svgs = svgs.slice(0,idxend+1);
    this.svg = svgs;

    let emispheres = this.data;
    emispheres = emispheres.filter((e:any)=>e.nom);
    emispheres = emispheres.filter((e:any)=>this.planetes.includes(e.nom));
    emispheres = {
      nord:emispheres.filter((e:any)=>e.maison=="Maison I"||e.maison=="Maison II"||e.maison=="Maison III"||e.maison=="Maison IV"||e.maison=="Maison V"||e.maison=="Maison VI").length,
      sud:emispheres.filter((e:any)=>e.maison=="Maison VII"||e.maison=="Maison VIII"||e.maison=="Maison IX"||e.maison=="Maison X"||e.maison=="Maison XI"||e.maison=="Maison XII").length,
      est:emispheres.filter((e:any)=>e.maison=="Maison X"||e.maison=="Maison XI"||e.maison=="Maison XII"||e.maison=="Maison I"||e.maison=="Maison II"||e.maison=="Maison III").length,
      ouest:emispheres.filter((e:any)=>e.maison=="Maison IV"||e.maison=="Maison V"||e.maison=="Maison VI"||e.maison=="Maison VII"||e.maison=="Maison VIII"||e.maison=="Maison IX").length
    };
    this.general.emispherenord = this.infos.general.find((g:any)=>g.nord==emispheres.nord&&g.sud==emispheres.sud);
    this.general.emispherenord.data.forEach((d:any)=>{d.data = this.setbold(d.data);})
    this.general.emisphereest = this.infos.general.find((g:any)=>g.est==emispheres.est&&g.ouest==emispheres.ouest);
    this.general.emisphereest.data.forEach((d:any)=>{d.data = this.setbold(d.data);})

    let elements = this.data;
    elements = elements.filter((e:any)=>this.planetes.includes(e.nom));
    elements = {
      eau:elements.filter((e:any)=>this.elements.eau.includes(e.signe)).length,
      air:elements.filter((e:any)=>this.elements.air.includes(e.signe)).length,
      feu:elements.filter((e:any)=>this.elements.feu.includes(e.signe)).length,
      terre:elements.filter((e:any)=>this.elements.terre.includes(e.signe)).length,
    }
    elements.yang = elements.feu+elements.air;
    elements.yin = elements.terre+elements.eau;
    this.general.yang = this.infos.general.find((g:any)=>g.yang==elements.yang&&g.yin==elements.yin);
    this.general.yang.data.forEach((d:any)=>{d.data = this.setbold(d.data);})

    //domaines
    this.domaines.forEach((dom:any)=>{
      let domaine = this.infos.domaines.filter((d:any)=>d.domaine==dom.nom);
      //Planetes
      let data = this.data.filter((d:any)=>dom.planetes.includes(d.nom));
      data.forEach((d:any)=>{
        let signe = domaine.find((f:any)=>f.planete==d.nom&&f.signe==d.signe);
        let maison = domaine.find((f:any)=>f.planete==d.nom&&f.maison==d.maison);
        dom.domaines.push(this.setbold(signe.data));
        dom.domaines.push(this.setbold(maison.data));
      });
      //Maisons
      data = this.data.filter((d:any)=>!d.nom&&dom.maisons.includes(d.maison));
      data.forEach((d:any)=>{
        let signe = domaine.find((f:any)=>f.maison==d.maison&&f.signe==d.signe);
        dom.domaines.push(this.setbold(signe.data));
      });
      //Aspects
      data = this.aspects.filter((a:any)=>
        dom.types.includes(a.type)
        &&((dom.planetes.includes(a.from)&&dom.dissonance.includes(a.to))||(dom.planetes.includes(a.to)&&dom.dissonance.includes(a.from)))
      );
      data.forEach((d:any)=>{
        let aspect = domaine.find((f:any)=>(f.from==d.from&&f.to==d.to&&f.type==d.type)||(f.from==d.to&&f.to==d.from&&f.type==d.type));
        dom.domaines.push(this.setbold(aspect.data));
      });
      //Exces
      dom.exces.forEach((e:any)=>{
        if(e=="Eau/Yin")
        {
          let eau = this.elements.eau.length
          if(eau>5)
          {
            dom.domaines.push(this.setbold(this.infos.domaines.find((d:any)=>d.exces=="Eau/Yin").data));
          }
        }
        else if(e=="Capricorne")
        {
          let planetes = this.data.filter((d:any)=>d.nom&&this.planetes.includes(d.nom)&&d.signe=="Capricorne").length;
          let stellium = this.stelliums.find((s:any)=>s.signe=="Capricorne");
          if(planetes>3 || stellium)
          {
            dom.domaines.push(this.setbold(this.infos.domaines.find((d:any)=>d.exces=="Capricorne").data));
          }
        }
      })
      
    });
    this.domaine = this.domaines[0];
    this.init(!this.informations);
  }

  setbold(data:any) 
  {
    this.planetes.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    this.signes.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    this.asteroides.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    this.maisons.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    this.typesaspects.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    this.termes.forEach((d:any)=>{
      let rgx = new RegExp(d, 'g');
      data = data.replace(rgx,"<b>"+d+"</b>");
    })

    return data;
  }

  setDomaine(){
    this.domaines = [
      {
        nom:"Santé",
        planetes:["Vesta","Soleil","Lune","Saturne","Pluton"],
        maisons:["Maison I","Maison IV","Maison VI","Maison VIII","Maison XII"],
        types:["carré","semi-carré","sesqui-carré","opposition"],
        dissonance:[],
        domaines:[],
        exces:["Eau/Yin","Capricorne"]
      },
      {
        nom:"Amour",
        planetes:["Lune","Mars","Vénus"],
        maisons:["Maison VII", "Maison V"],
        types:["semi-carré","sesqui-carré","opposition", "carré"],
        dissonance:["Pluton"],
        domaines:[],
        exces:[]
      },
      {
        nom:"Travail",
        planetes:["Soleil","Jupiter","Mercure","Saturne","Fortune","Vénus"],
        maisons:["Maison II","Maison X","Maison VI"],
        types:[],
        dissonance:[],
        domaines:[],
        exces:[]
      }
    ]
  }

  getGeneral()
  {
    let retour = [];
    if(!this.general.yang)retour = [];
    else if(this.clicked2==this.menu[0])retour = this.general.emispherenord.data;
    else if(this.clicked2==this.menu[1])retour = this.general.emisphereest.data;
    else if(this.clicked2==this.menu[2])retour = this.general.yang.data;
    return retour;
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

  nameToObject(s:any)
  {
    switch(s) {
      case "Bélier":
          return "objet0";
      case "Taureau":
          return "objet1";
      case "Gémeaux":
          return "objet2";
      case "Cancer":
          return "objet3";
      case "Lion":
          return "objet4";
      case "Vierge":
          return "objet5";
      case "Balance":
          return "objet6";
      case "Scorpion":
          return "objet7";
      case "Sagittaire":
          return "objet8";
      case "Capricorne":
          return "objet9";
      case "Verseau":
          return "objet10";
      case "Poissons":
          return "objet11";
      case "Soleil":
          return "objet12";
      case "Lune":
          return "objet13";
      case "Mercure":
          return "objet14";
      case "Vénus":
          return "objet15";
      case "Mars":
          return "objet16";
      case "Jupiter":
          return "objet17";
      case "Saturne":
          return "objet18";
      case "Uranus":
          return "objet19";
      case "Neptune":
          return "objet20";
      case "Pluton":
          return "objet21";
      case "Chiron":
          return "objet22";
      case "Cérès":
          return "objet23";
      case "Pallas":
          return "objet24";
      case "Junon":
          return "objet25";
      case "Vesta":
          return "objet26";
      case "Nœud Nord":
          return "objet27";
      case "Lilith":
          return "objet28";
      case "Fortune":
          return "objet29";
      case "Maison I":
          return "texte30";
      case "Maison II":
          return "texte33";
      case "Maison III":
          return "texte34";
      case "Maison IV":
          return "texte35";
      case "Maison V":
          return "texte36";
      case "Maison VI":
          return "texte37";
      case "Maison VII":
          return "texte38";
      case "Maison VIII":
          return "texte39";
      case "Maison IX":
          return "texte40";
      case "Maison X":
          return "texte31";
      case "Maison XI":
          return "texte42";
      case "Maison XII":
          return "texte43";
      case "Vertex":
          return "objet44";
      case "Point Est":
          return "objet45";
      case "Nœud Sud":
          return "objet100";
      default:
          return "NA";
  }
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
      if(s.includes("objet27\""))
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
        line = "<line id=\"objet100-2\" x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" "
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
        line2 = "<line id=\"objet100-3\" x1=\""+x1+"\" y1=\""+y1+"\" x2=\""+x2+"\" y2=\""+y2+"\" "
        + line2.substring(line2.indexOf("style="));
        this.svg.push(line2);
      }
      if(s.match(/.*<image.*/g))
      {
        let nom = s.substring(s.indexOf("\"")+1);
        nom = nom.substring(0,nom.indexOf("\""));
        let nom2 = this.signes2(nom);
        if(nom=="objet100"){}
        else if(this.planetes.includes(nom2) || this.asteroides.includes(nom2) || nom=="objet30" || nom=="objet31")
        {
          this.svg[i+1] = "<line id=\""+nom+"-2\" " + this.svg[i+1].substring(this.svg[i+1].indexOf("x1="));
          this.svg[i+2] = "<line id=\""+nom+"-3\" " + this.svg[i+2].substring(this.svg[i+2].indexOf("x1="));
          this.svg[i+3] = "<text id=\""+nom+"-4\" " + this.svg[i+3].substring(this.svg[i+3].indexOf("x="));
          this.svg[i+4] = "<text id=\""+nom+"-5\" " + this.svg[i+4].substring(this.svg[i+4].indexOf("x="));
        }
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
          objet.addEventListener('mouseover', () => {this.hover=signe ;this.addClass(nom)});
          objet.addEventListener('mouseleave', () => {this.hover=undefined ;this.removeClass(nom)});
          this.svgs.push({nom:signe,id:nom});
        }
      }

      this.svgs.forEach((svg:any)=>{
        svg.active = this.data.find((d:any)=>d.nom==svg.nom||d.signe==svg.nom||d.maison==svg.nom) != undefined;
        if(!svg.active)
        {
          let objet:any = document.getElementById(svg.id);
          objet.classList.add("disabled");
        }
      })
      this.getAspectscoords();
      this.loading=false;
  }

  getAspectscoords()
  {
    let data = Object.values(document.getElementsByTagName("line"));
    data = data.filter((d:any)=>d.getAttribute("style")!="stroke: #000000" && d.getAttribute("id")==null && d.getAttribute("class")==null);
    /*let i = 0;
    data.forEach((d:any)=>{
      d.id = "line-"+i++;
      d.addEventListener('click', () => {this.clickAsp(d)});
      d.addEventListener('mouseover', () => {this.hover=d.id ;this.addClass(d.id)});
      d.addEventListener('mouseleave', () => {this.hover=undefined ;this.removeClass(d.id)});
    })*/
    this.svgAspects = data;
  }

  clickAsp(asp:any)
  {

  }

  addClass(s:string)
  {
    let objet:any = document.getElementById(s);
    objet.classList.add("active");
    for(let i=2;i<6;i++)
    {
      let objet:any = document.getElementById(s+"-"+i);
      if(objet)
      {
        objet.classList.add("active");
      }
    }
  }

  removeClass(s:string)
  {  
    let objects = Object.values(document.getElementsByClassName("active"));
    objects.forEach((o:any)=>o.classList.remove("active"));
  }

  clickOnglet(onglet:any)
  {
    this.onglet = onglet;
  }

  getFocus()
  {
    return this.focus.filter((f:any)=>f.type==this.type);
  }

  clickListe(obj:any)
  {
    let type = obj.type;
    let data = this.focus.filter((f:any)=>f.type==type);
    let index = data.indexOf(obj);
    this.type=type;
    const element = this.textes.nativeElement;
    const viewportWidth = window.innerWidth;

    this.interval2 = setInterval(() => {
      element.scrollLeft = index*((viewportWidth / 100)*24);
      clearInterval(this.interval2);
    },100);
  }

  getPlaneteFromDataByName(name:any){return this.data.find((planete:any)=>planete.nom==name);}

  initHide()
  {
    this.planetes.forEach((p:any)=>{
      let id = this.nameToObject(p);
      let obj:any = document.getElementById(id);
      if(obj)
      {
        obj.classList.add("hide");
        obj = document.getElementById(id+"-2");
        obj.classList.add("hide");
        obj = document.getElementById(id+"-3");
        obj.classList.add("hide");
        obj = document.getElementById(id+"-4");
        obj.classList.add("hide");
        obj = document.getElementById(id+"-5");
        obj.classList.add("hide");
      }
    })
    this.asteroides.forEach((p:any)=>{
      let id = this.nameToObject(p);
      let obj: any = document.getElementById(id);
      if(obj)
      {
        obj.classList.add("hide");
        obj = document.getElementById(id+"-2");
        obj.classList.add("hide");
        obj = document.getElementById(id+"-3");
        obj.classList.add("hide");
        if(p!="Nœud Sud")
        {
          obj = document.getElementById(id+"-4");
          obj.classList.add("hide");
          obj = document.getElementById(id+"-5");
          obj.classList.add("hide");
        }
      }
    })
    this.signes.forEach((p:any)=>{
      let id = this.nameToObject(p);
      let obj: any = document.getElementById(id);
      if(obj)
      {
        obj.classList.add("hide");
      }
    })
    this.svgAspects.forEach((p:any)=>{
        p.classList.add("hide");
    })

    let id = "objet30";
    let obj: any = document.getElementById(id);
    obj.classList.add("hide");
    obj = document.getElementById(id+"-2");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-3");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-4");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-5");
    obj.classList.add("hide");

    id = "objet31";
    obj = document.getElementById(id);
    obj.classList.add("hide");
    obj = document.getElementById(id+"-2");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-3");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-4");
    obj.classList.add("hide");
    obj = document.getElementById(id+"-5");
    obj.classList.add("hide");
  }

  click(s:string)
  {
    if(!this.desc){this.initHide();}
    this.onglet="Général";
    this.focus = [];
    this.clicked = s;
    this.desc = this.setbold(this.infos.desc.find((d:any)=>d.nom == s).infos);
    this.type = "Planetes";
    if(this.asteroides.includes(s))this.type = "Asteroides";
    else if(this.maisons.includes(s))this.type = "Maisons";
    else if(this.signes.includes(s))this.type = "Signes";
    let data = this.data;

    if(this.type=="Asteroides"||this.type=="Planetes")
    {
      let ligne = data.find((d:any)=>d.nom==s);
      //Stelliums
      this.stelliums.forEach((st:any)=>{
        if(st.noms.includes(s))
        {
          st.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:st.noms[0]+", "+st.noms[1]+", "+st.noms[2]+" en "+st.signe,data:st.data,type:"Stelliums"})
        }
      });

      data = data.filter((d:any)=>d.nom==s);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(s!="Nœud Sud")
        {
          //Planete ou Asteroide en Maison
          let x = this.infos.maisons.find((m:any)=>m.maison==d.maison&&m.nom==d.nom);
          x.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:x.maison,data:x.data,type:"Maisons"});
        }
        //Planete ou Asteroide dans signe
        let x = signe.find((s:any)=>s.nom==d.nom);
        x.data.forEach((d:any)=>d.data=this.setbold(d.data));
        this.focus.push({nom:ligne.signe,data:x.data,type:"Signes"});
      });
      
      let aspects = this.aspects.filter((a:any)=>a.from==s||a.to==s);
      aspects.forEach((a:any)=>{
        let infos = this.infos.aspects.find((i:any)=>i.from==a.from&&i.type==a.type&&i.to==a.to);
        infos.data.forEach((d:any)=>d.data=this.setbold(d.data));
        this.focus.push({nom:infos.from + " " + infos.type + " " + infos.to,data:infos.data,type:"Aspects"});
      });

      let domiciles = this.infos.domiciles.filter((d:any)=>d.nom==s&&d.signe==ligne.signe);
      domiciles.forEach((d:any)=>{
        d.data.forEach((d:any)=>d.data=this.setbold(d.data));
        this.focus.push({nom: d.nom + ", " + d.type + " en " + d.signe, data:d.data,type:"Dignités"});
      })
    }
    else if(this.type=="Maisons")
    {
      data = data.filter((d:any)=>this.maisons.includes(d.maison));
      data = data.filter((d:any)=>d.maison==s);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(!d.nom){
          //Maison dans signe
          let x = signe.find((s:any)=>s.nom==d.maison);
          let ligne = data.find((d:any)=>d.maison==s&&!d.nom);
          x.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:ligne.signe,data:x.data,type:"Signes"});
        }
        else{
          //Planete ou Asteroide en Maison
          let x = this.infos.maisons.find((m:any)=>m.maison==d.maison&&m.nom==d.nom);
          x.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:x.nom,data:x.data,type:this.planetes.includes(x.nom)?"Planetes":"Asteroides"});
        }
      });
    }
    else if(this.type=="Signes")
    {
      data = data.filter((d:any)=>this.signes.includes(d.signe));
      data = data.filter((d:any)=>d.signe==s);
      data.forEach((d:any)=>{
        let signe = this.infos.data.find((i:any)=>i.nom==d.signe).data;
        if(!d.nom){
          //Maison dans signe
          let x = signe.find((s:any)=>s.nom==d.maison);
          x.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:d.maison,data:x.data,type:"Maisons"});
        }
        else{
          //Planete ou Asteroide dans signe
          let x = signe.find((s:any)=>s.nom==d.nom);
          x.data.forEach((d:any)=>d.data=this.setbold(d.data));
          this.focus.push({nom:x.nom,data:x.data,type:this.planetes.includes(x.nom)?"Planetes":"Asteroides"});
        }
      });
    }
    const unique = [...new Set(this.focus.map((item:any) => item.type))];
    this.types = unique;
    this.type = unique[0];
    this.addClassClicked(s);
  }

  addSvg2(obj:any)
  {
    let objet:any = document.getElementById(obj);
        
        if(objet)
        {
          objet.classList.add("clickedSVG2");
          
          for(let i=2;i<6;i++)
          {
            let objet:any = document.getElementById(obj+"-"+i);
            if(objet)
            {
              objet.classList.add("clickedSVG2");
            }
          }
        }
        else
        {
          if(obj=="texte31")
          {
            let objet:any = document.getElementById("objet31");
            for(let i=2;i<6;i++)
              {
                let objet:any = document.getElementById("objet31-"+i);
                if(objet)
                {
                  objet.classList.add("clickedSVG2");
                }
              }
            objet.classList.add("clickedSVG2");
            objet = document.getElementById("texte41");
            objet.classList.add("clickedSVG2");
          }
          else if(obj=="texte30")
            {
              let objet:any = document.getElementById("objet30");
              for(let i=2;i<6;i++)
                {
                  let objet:any = document.getElementById("objet30-"+i);
                  if(objet)
                  {
                    objet.classList.add("clickedSVG2");
                  }
                }
              objet.classList.add("clickedSVG2");
              objet = document.getElementById("texte32");
              objet.classList.add("clickedSVG2");
            }
        }
  }

  addClassClicked(s:string)
  {
    let objects = Object.values(document.getElementsByClassName("clickedSVG"));
    objects.forEach((o:any)=>o.classList.remove("clickedSVG"));
    objects = Object.values(document.getElementsByClassName("clickedSVG2"));
    objects.forEach((o:any)=>o.classList.remove("clickedSVG2"));

      this.focus.forEach((f:any)=>{
        let obj = this.nameToObject(f.nom);
        this.addSvg2(obj);
      });

      this.stelliums.forEach((st:any)=>{
        if(st.noms.includes(s))
        {
          let planetes = st.noms.filter((nom:any)=>nom!=s);
          planetes.forEach((p:any)=>{
            let obj = this.nameToObject(p);
            this.addSvg2(obj);
          })
        }
      })

      this.aspects.filter((a:any)=>a.from==s||a.to==s).forEach((a:any)=>{
        let from = a.from;
        let to = a.to;
        if(from==s)
        {
          let obj = this.nameToObject(to);
          this.addSvg2(obj);
        } 
        else
        {
          let obj = this.nameToObject(from);
          this.addSvg2(obj);
        }
      })
  
      let obj = this.nameToObject(s);
      let objet:any = document.getElementById(obj);
      for(let i=2;i<6;i++)
      {
        let objet:any = document.getElementById(obj+"-"+i);
        if(objet)
        {
          objet.classList.add("clickedSVG");
        }
      }
      if(!objet)
      {
        if(obj=="texte31")
        {
          objet = document.getElementById("objet31");
          
          for(let i=2;i<6;i++)
            {
              let objet:any = document.getElementById("objet31-"+i);
              if(objet)
              {
                objet.classList.add("clickedSVG");
              }
            }
        }
        else if(obj=="texte30")
        {
          objet = document.getElementById("objet30");
          for(let i=2;i<6;i++)
            {
              let objet:any = document.getElementById("objet30-"+i);
              if(objet)
              {
                objet.classList.add("clickedSVG");
              }
            }
        }
      }
      objet.classList.add("clickedSVG");
      if(this.planetes.includes(s))this.calculatePosition(s);
  }

    calculatePosition(s:any)
    {
      let id = this.nameToObject(s);
      let obj = document.getElementById(id+"-2");
      if(obj)
      {
        let rayonext = 155;
        let rayonint = 85;

        let x:any = obj.getAttribute("x2");
        let y:any = obj.getAttribute("y2");

        let angle = Math.atan2(y - 255, x - 255);

        let x2: any = "" + (255 + rayonint * Math.cos(angle));
        let y2: any = "" + (255 + rayonint * Math.sin(angle));

        x2 = x2.substring(0,x2.indexOf(".")+2);
        y2 = y2.substring(0,y2.indexOf(".")+2);

        this.svgAspects.forEach((a:any)=>{
          let x = a.getAttribute("x1");
          let y = a.getAttribute("y1");
          let xx = a.getAttribute("x2");
          let yy = a.getAttribute("y2");

          x = x.substring(0,x.indexOf(".")+2);
          y = y.substring(0,y.indexOf(".")+2);
          xx = xx.substring(0,xx.indexOf(".")+2);
          yy = yy.substring(0,yy.indexOf(".")+2);

          if((x==x2&&y==y2)||(xx==x2&&yy==y2))
          {
            a.classList.add("clickedSVG2");
          }
        })
      }
    }
}