import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { PORTFOLIO } from './data/portfolio.data';
import { Footer } from './layout/footer/footer';
import { Navbar } from './layout/navbar/navbar';
import { About } from './sections/about/about';
import { Contact } from './sections/contact/contact';
import { Education } from './sections/education/education';
import { Experience } from './sections/experience/experience';
import { Highlights } from './sections/highlights/highlights';
import { Hero } from './sections/hero/hero';
import { Projects } from './sections/projects/projects';
import { Skills } from './sections/skills/skills';
import { BackgroundCanvas } from './three/background/background-canvas';

@Component({
  selector: 'app-root',
  imports: [
    About,
    BackgroundCanvas,
    Contact,
    Education,
    Experience,
    Footer,
    Hero,
    Highlights,
    Navbar,
    Projects,
    Skills,
  ],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly ui = PORTFOLIO.ui;

  constructor() {
    const { title, description } = PORTFOLIO.seo;
    inject(Title).setTitle(title);

    const meta = inject(Meta);
    meta.updateTag({ name: 'description', content: description });
    meta.updateTag({ property: 'og:title', content: title });
    meta.updateTag({ property: 'og:description', content: description });
  }
}
