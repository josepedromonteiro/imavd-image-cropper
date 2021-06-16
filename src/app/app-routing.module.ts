import {NgModule} from '@angular/core';
import {PreloadAllModules, RouterModule, Routes} from '@angular/router';

const routes: Routes = [
  {
    path: 'image-editor',
    loadChildren: () => import('./home/home.module').then(m => m.HomePageModule)
  }, {
    path: 'audio-editor',
    loadChildren: () => import('./modules/audio-editor/audio-editor.module').then(m => m.AudioEditorModule)
  },{
    path: 'video-editor',
    loadChildren: () => import('./modules/video-editor/video-editor.module').then(m => m.VideoEditorModule)
  },
  {
    path: '',
    redirectTo: 'image-editor',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {preloadingStrategy: PreloadAllModules})
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
