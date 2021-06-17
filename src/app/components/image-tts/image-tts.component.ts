import {Component, OnDestroy, OnInit, ViewEncapsulation} from '@angular/core';
import {SpeechRecognitionService} from '../../services/speech-recognition/speech-recognition.service';
import {Subject} from 'rxjs';
import {debounceTime, distinctUntilChanged, skipWhile, takeUntil} from 'rxjs/operators';
import {CanvasService, TTS_ACTIONS, TTS_OBJECTS} from "../canvas/canvas/canvas.service";

interface Action {
  action: TTS_ACTIONS;
  texts: string[];
}

interface CanvasObjects {
  object: TTS_OBJECTS;
  texts: string[];
}

export enum COLORS_ENUM {
  RED = '#ff0000',
  BLUE = '#00c4ff',
  GREEN = '#37ff00',
  YELLOW = '#ffe600',
  ORANGE = '#ff7700',
}

export interface ColorsType {
  [key: string]: {
    texts: string[],
    value: COLORS_ENUM
  };
}

const COLORS: ColorsType = {
  red: {
    texts: ['red'],
    value: COLORS_ENUM.RED
  },
  blue: {
    texts: ['blue'],
    value: COLORS_ENUM.BLUE
  },
  green: {
    texts: ['green'],
    value: COLORS_ENUM.GREEN
  },
  yellow: {
    texts: ['yellow'],
    value: COLORS_ENUM.YELLOW
  },
  orange: {
    texts: ['orange'],
    value: COLORS_ENUM.ORANGE
  }
}

@Component({
  selector: 'app-image-tts',
  templateUrl: './image-tts.component.html',
  styleUrls: ['./image-tts.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ImageTtsComponent implements OnInit, OnDestroy {

  public isRecording = false;
  private destroyer$: Subject<void>;
  public actions: Action[] = [];
  public canvasObjects: CanvasObjects[] = [];

  constructor(public speechRecognition: SpeechRecognitionService,
              private canvasService: CanvasService) {
    this.actions = [
      {
        action: TTS_ACTIONS.ROTATE_RIGHT,
        texts: ['rotate', 'right']
      },
      {
        action: TTS_ACTIONS.ROTATE_LEFT,
        texts: ['rotate', 'left']
      },
      {
        action: TTS_ACTIONS.GROW,
        texts: ['grow']
      },
      {
        action: TTS_ACTIONS.REDUCE,
        texts: ['half']
      },
      {
        action: TTS_ACTIONS.DUPLICATE,
        texts: ['duplicate']
      },
      {
        action: TTS_ACTIONS.TRANSLATE_VERTICAL,
        texts: ['translate', 'vertical']
      },
      {
        action: TTS_ACTIONS.TRANSLATE_HORIZONTAL,
        texts: ['translate', 'horizontal']
      },
      {
        action: TTS_ACTIONS.ABORT_ANIMATIONS,
        texts: ['abort', 'animations']
      },
      {
        action: TTS_ACTIONS.GRAYSCALE,
        texts: ['gray', 'scale']
      },
      {
        action: TTS_ACTIONS.COLOR,
        texts: ['change', 'color']
      },
      {
        action: TTS_ACTIONS.ADD,
        texts: ['create']
      },
      {
        action: TTS_ACTIONS.QUAD,
        texts: ['quad']
      },
      {
        action: TTS_ACTIONS.DUAL,
        texts: ['dual']
      },
      {
        action: TTS_ACTIONS.BOTTOM_RIGHT,
        texts: ['bottom', 'right']
      },
      {
        action: TTS_ACTIONS.TOP_LEFT,
        texts: ['top', 'left']
      }
    ];

    this.canvasObjects = [
      {
        object: TTS_OBJECTS.CIRCLE,
        texts: ['circle']
      }, {
        object: TTS_OBJECTS.SQUARE,
        texts: ['square']
      }, {
        object: TTS_OBJECTS.TRIANGLE,
        texts: ['triangle']
      }, {
        object: TTS_OBJECTS.IMAGE,
        texts: ['image']
      }, {
        object: TTS_OBJECTS.ALL,
        texts: ['everything']
      }
    ];
  }

  ngOnInit() {
    this.destroyer$ = new Subject<void>();
  }

  public startRecording() {
    this.speechRecognition.start();
    this.speechRecognition.text.pipe(
      takeUntil(this.destroyer$),
      skipWhile((value: string) => value.replace(/ /g, '').length === 0),
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((text: string) => {
      let cAction: Action;
      let cObject: CanvasObjects;
      this.actions.forEach((action: Action) => {
        const isValid: boolean = action.texts.every((item: string) => text.toLocaleLowerCase().includes(item.toLocaleLowerCase()));
        if (isValid) {
          cAction = action;
        }
      });

      this.canvasObjects.forEach((obj: CanvasObjects) => {
        const isValid: boolean = obj.texts.every((item: string) => text.toLocaleLowerCase().includes(item.toLocaleLowerCase()));
        if (isValid) {
          cObject = obj;
        }
      });

      const colorSelected: string = Object.keys(COLORS).filter((colorKey) => {
        return text.toLocaleLowerCase().includes(COLORS[colorKey].texts[0]);
      })[0];

      if ((cAction && cObject) || (cAction?.action === TTS_ACTIONS.ABORT_ANIMATIONS)) {
        this.canvasService.executeActionInObject(cObject?.object, cAction.action, COLORS[colorSelected]?.value);
        this.stopRecording();
      }
    });

    this.isRecording = true;
  }

  public stopRecording() {
    this.speechRecognition.stop();
    this.speechRecognition.text.next('');
    this.isRecording = false;
  }


  ngOnDestroy(): void {
    this.destroyer$.next();
  }
}
