import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import * as faceapi from 'face-api.js';
import {DockService} from '../../dock/dock.service';
import {User, UsersService} from '../users/service/users.service';
import {BehaviorSubject, Subject} from 'rxjs';
import {debounceTime, takeUntil} from 'rxjs/operators';

const MODEL_URL = 'assets/models';

interface DisplaySize {
  width: number;
  height: number;
}

@Component({
  selector: 'app-video-editor',
  templateUrl: './video-editor.component.html',
  styleUrls: ['./video-editor.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VideoEditorComponent implements OnInit, AfterViewInit, OnDestroy {

  private displaySize: DisplaySize;
  private interval: NodeJS.Timeout;
  private requestFrame: number;
  private modelLoaded = false;
  private userIdentified$: BehaviorSubject<User>;
  public userIdentified: User;
  private destroyer$: Subject<void>;

  @ViewChild('videoElement') videoElement: ElementRef<HTMLVideoElement>;
  @ViewChild('videoElementBg') videoElementBg: ElementRef<HTMLVideoElement>;
  @ViewChild('mediaArea') mediaArea: ElementRef<HTMLDivElement>;
  @ViewChild('reflay') canvas: ElementRef<HTMLCanvasElement>;

  constructor(private dockService: DockService,
              private ngZone: NgZone,
              private usersService: UsersService) {
    this.destroyer$ = new Subject<void>();
    this.userIdentified$ = new BehaviorSubject<User>(null);
    this.userIdentified$.pipe(
      takeUntil(this.destroyer$),
      debounceTime(500)
    ).subscribe((value: User) => {
      this.userIdentified = value;
    });
  }

  ngOnInit() {
  }

  ionViewWillEnter(): void {
    this.dockService.removeSideBar();
    if (this.modelLoaded) {
      this.startFaceDetectionInterval();
    }
  }

  ngAfterViewInit(): void {
    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({video: true})
        .then((stream: MediaStream) => {
          this.videoElement.nativeElement.srcObject = stream;
          this.videoElementBg.nativeElement.srcObject = stream;
        })
        .catch((err0r) => {
          console.log('Something went wrong!');
        });
    }
  }

  async onLoadedVideoMetadata(event: Event) {
    const videoBounding: DOMRect = this.videoElement.nativeElement.getBoundingClientRect();

    this.displaySize = {
      width: (event.target as any).clientWidth,
      height: (event.target as any).clientHeight
    };

    //   const canvas = faceapi.createCanvasFromMedia(this.videoElement.nativeElement);
    //   document.body.append(canvas);

    // this.displaySize = {
    //   width: videoBounding.width,
    //   height: videoBounding.height
    // };

    // this.canvasElement.nativeElement.style.setProperty('top', `${videoBounding.top}px`);
    // this.canvasElement.nativeElement.style.setProperty('left', `${videoBounding.left}px`);
    // this.canvasElement.nativeElement.style.setProperty('height', `${videoBounding.height}px`);
    // this.canvasElement.nativeElement.style.setProperty('width', `${videoBounding.width}px`);


    await this.startFaceDetectionInterval();
    // await this.startMtcnnFaceDetection();
  }

  private async startFaceDetectionInterval() {
    const req1 = faceapi.loadSsdMobilenetv1Model(MODEL_URL);
    const req2 = faceapi.loadFaceLandmarkModel(MODEL_URL);
    const req3 = faceapi.loadFaceRecognitionModel(MODEL_URL);
    const req4 = faceapi.loadTinyFaceDetectorModel(MODEL_URL);

    await Promise.all([req1, req2, req3, req4]).then(() => {
      this.modelLoaded = true;
    });

    const canvas: HTMLCanvasElement = faceapi.createCanvasFromMedia(this.videoElement.nativeElement);
    canvas.style.setProperty('position', 'absolute');
    canvas.style.setProperty('width', `${this.displaySize.width}px`);
    canvas.style.setProperty('height', `${this.displaySize.height}px`);
    this.mediaArea.nativeElement.append(canvas);
    this.ngZone.runOutsideAngular(() => {
      this.interval = setInterval(() => {
        this.startFaceDetection(canvas);
      }, 1000);
    });
  }

  private async startFaceDetection(canvas: HTMLCanvasElement) {

    const fullFaceDescriptions = await faceapi.detectAllFaces(this.videoElement.nativeElement).withFaceLandmarks().withFaceDescriptors();
    // const fullFaceDescription = faceapi.resizeResults(fullFaceDescriptions, this.displaySize);


    const users: User[] = this.usersService.users;
    let labeledFaceDescriptors = await Promise.all(
      users.map(async (user: User) => {
        // fetch image data from urls and convert blob to HTMLImage element
        // const imgUrl = `${label}.JPG`
        const img = await faceapi.fetchImage(user.photo);

        // detect the face with the highest score in the image and compute it's landmarks and face descriptor
        const fullFaceDescription_ = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!fullFaceDescription_) {
          // console.error(`no faces detected for ${user.name}`);
        }

        if (!fullFaceDescription_?.descriptor) {
          return null;
        }
        const faceDescriptors = [fullFaceDescription_.descriptor];
        return new faceapi.LabeledFaceDescriptors(user.name, faceDescriptors);
      })
    );

    labeledFaceDescriptors = labeledFaceDescriptors.filter(e => e != null);

    const maxDescriptorDistance = 0.6;
    const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, maxDescriptorDistance);

    const results = fullFaceDescriptions.map(fd => {
      if (fd) {
        return faceMatcher.findBestMatch(fd.descriptor);
      }

      return null;
    }).filter(e => e != null);

    const context = canvas.getContext('2d');

    context.clearRect(0, 0, canvas.width, canvas.height);
    results.forEach((bestMatch, i) => {
      let identifiedUser = (bestMatch as any)._label !== 'unknown' ? users[i] : null;
      identifiedUser = this.getUserByLabel((bestMatch as any)._label, users);

      if (this.userIdentified$.getValue() !== identifiedUser) {
        this.ngZone.run(() => {
          this.userIdentified$.next(identifiedUser);
        });
      }
      const box = fullFaceDescriptions[i].detection.box;
      const text = bestMatch.toString();
      const drawBox = new faceapi.draw.DrawBox(box, {
        label: text,
        boxColor: 'rgba(0,0,0,0.6)',
        drawLabelOptions: {fontSize: 40, padding: 8}
      });
      drawBox.draw(canvas);
    });

    // this.requestFrame = requestAnimationFrame(() => {
    //   this.startFaceDetection(canvas);
    // });
  }

  ngOnDestroy(): void {
    this.destroyer$.next();
    this.destroyer$.complete();
  }

  ionViewDidLeave(): void {
    cancelAnimationFrame(this.requestFrame);
    clearInterval(this.interval);
  }


  getUserByLabel(label: string, users: User[]): User {
    return users.filter(u => u.name?.toLowerCase() === label?.toLowerCase())[0];
  }
}
