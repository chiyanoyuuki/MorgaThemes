import { Component, ElementRef, NgModule, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';

import dorothee from "../assets/Dorothee.json"
import dorotheeSVG from "../assets/DorotheeSVG.json"

import charles from "../assets/Charles.json"
import charlesSVG from "../assets/CharlesSVG.json"


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

  personne:any = "Dorothee";
  svg:any = dorotheeSVG;
  data:any = dorothee;
  svgid:any="";
  maisons:any = [];
  planetes:any = [];

  constructor(private elementRef: ElementRef<HTMLElement>) {}
  
  ngOnInit(): void 
  {
    let tmp = this.data.filter((d:any)=>d.type=="Maison");
        for(let i=0;i<tmp.length;i++)
      {
        this.maisons.push(tmp[i]);
      }
       tmp = this.data.filter((d:any)=>d.type=="Planete");
          for(let i=0;i<tmp.length;i++)
        {
          this.planetes.push(tmp[i]);
        }
  }

  change()
  {
    if(this.personne=="Charles")
      {
        this.svg = charlesSVG;
        this.data = charles;
      }
      else if(this.personne=="Dorothee")
        {
          this.svg = dorotheeSVG;
          this.data = dorothee;
        }

    this.click(this.data[0].signe);
    this.init(false);
  }

  init(first:boolean)
  {
    console.log(this.svg);
    console.log(this.data);

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
        }
      }
  }

  ngAfterViewInit() {
    this.init(true);
    
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
    let tmp = [];
    console.log(s);
    tmp = this.data.filter((d:any)=>d.signe==s);
    if(tmp.length==0)tmp = this.data.filter((d:any)=>d.planete==s);
    this.focus = tmp;
  }
}

