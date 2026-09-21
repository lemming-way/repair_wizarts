import { ComponentType, useState, useRef, useEffect, useLayoutEffect } from 'react';

import { useLanguage } from 'app/state/language';

interface AudioRecorderProps {
  className?: string;
  disabled: boolean;
  MicrophoneIcon: ComponentType;
  onStartRecording: () => void;
  onFinishRecording: () => void;
  setAudioFile: (audio: File | null) => void;
};

// Константы модуля
const BEST_MIME_TYPE = (() => {
  if (typeof window === 'undefined' || !window.MediaRecorder) return '';

  const candidateTypes = [
    // Safari / iOS
    'audio/mp4',
    'audio/aac',
    // Chrome / Firefox / Edge / Android
    'audio/webm;codecs=opus',
    'audio/webm',
    // Резерв
    'audio/ogg;codecs=opus',
    'audio/ogg',
  ];

  return candidateTypes.find((type) => MediaRecorder.isTypeSupported(type)) || '';
})();

const CAN_RECORD_AUDIO =
  typeof window !== 'undefined' &&
  !!(navigator.mediaDevices && window.MediaRecorder);

// Настройки детектора тишины
const SILENCE_THRESHOLD = 10; // Порог громкости (от 0 до 255). Всё, что ниже — тишина
const SILENCE_DURATION = 3000; // Автостоп после 3 секунд тишины (мс)
const MIN_SPEECH_DURATION = 500; // Мин. длительность речи для сохранения (мс)

class RecorderInstance {
  recorder: MediaRecorder | null = null;
  stream: MediaStream | null = null;
  audioContext: AudioContext | null = null;
  animationFrameId: number | null = null;
  analyser: AnalyserNode | null = null;
  dataArray: Uint8Array<ArrayBuffer> | null = null;
  recChunks: BlobPart[] = [];
  totalSpeechTime: number = 0;
  silenceStart: number = 0;
  lastFrameTime: number = 0;

  constructor() {
    this.checkVolume = this.checkVolume.bind(this);
  }

  // Функция очистки
  stopStreamAndRecorder() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }

    if (this.recorder && this.recorder.state !== 'inactive') {
      this.recorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
    }

    this.recorder = null;
    this.stream = null;
    this.audioContext = null;
    this.animationFrameId = null;
    this.recChunks = [];
    this.totalSpeechTime = 0;
    this.silenceStart = 0;
    this.lastFrameTime = 0;

    this.analyser = null;
    this.dataArray = null;
  }

  // Детектор тишины
  setupSilenceDetection() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass || !this.stream) return;

    const audioContext = new AudioContextClass();
    this.audioContext = audioContext;

    const source = audioContext.createMediaStreamSource(this.stream);
    this.analyser = audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    source.connect(this.analyser);

    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.silenceStart = Date.now();

    this.totalSpeechTime = 0;
    this.lastFrameTime = Date.now();

    this.checkVolume();
  }

  checkVolume() {
    if (!this.analyser || !this.dataArray) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    const averageVolume = this.dataArray.length > 0 ? sum / this.dataArray.length : 0;
    const now = Date.now();
    const delta = now - this.lastFrameTime;
    this.lastFrameTime = now;

    if (averageVolume > SILENCE_THRESHOLD) {
      this.totalSpeechTime += delta;
      this.silenceStart = now;
    } else {
      if (now - this.silenceStart > SILENCE_DURATION) {
        if (this.recorder?.state === 'recording') {
          this.recorder.stop();
        }
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.checkVolume);
  };

  start(): Promise<File | null> {
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        this.stream = stream;

        const options = BEST_MIME_TYPE ? { mimeType: BEST_MIME_TYPE } : undefined;
        this.recorder = new MediaRecorder(stream, options);

        this.recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.recChunks.push(e.data);
          }
        };

        this.recorder.onstop = () => {
          try {
            // Проверка: игнорируем запись, если была только тишина
            if (this.totalSpeechTime < MIN_SPEECH_DURATION) {
              console.log('Запись отменена: на аудиозаписи не обнаружена речь.');
              resolve(null);
              return;
            }

            const finalMimeType = BEST_MIME_TYPE || this.recorder?.mimeType || 'audio/webm';

            let extension = 'webm';
            if (finalMimeType.includes('mp4') || finalMimeType.includes('aac')) {
              extension = 'm4a';
            } else if (finalMimeType.includes('ogg')) {
              extension = 'ogg';
            }

            const file = new File(this.recChunks, `voice_${Date.now()}.${extension}`, { type: finalMimeType });

            resolve(file);
          } catch (e) {
            console.error('Ошибка при сохранении аудио:', e);
            reject(e);
          } finally {
            this.stopStreamAndRecorder();
          }
        };

        this.setupSilenceDetection();
        this.recorder.start();
      })
      .catch(e => {
        reject(e);
      });
    });
  }
};

export function AudioRecorder({
  MicrophoneIcon,
  className,
  disabled,
  onStartRecording,
  onFinishRecording,
  setAudioFile
}: AudioRecorderProps) {
  const text = useLanguage();
  const [isRecording, setIsRecording] = useState<boolean>(false);

  const recorderInstanceRef = useRef<RecorderInstance | null>();
  if (!recorderInstanceRef.current) recorderInstanceRef.current = new RecorderInstance();
  const recorderInstance = recorderInstanceRef.current;

  // Очистка ресурсов при размонтировании
  useEffect(() => {
    const recorderInstance = recorderInstanceRef.current;
    return () => recorderInstance!.stopStreamAndRecorder();
  }, []);
  
  // Принудительная остановка записи
  useLayoutEffect(() => {
    if (disabled && isRecording) {
      const recorderInstance = recorderInstanceRef.current;
      recorderInstance!.recorder?.stop();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled]);

  async function handleMicClick() {
    if (!CAN_RECORD_AUDIO) return;

    if (isRecording) {
      recorderInstance.recorder?.stop();
    } else {
      try {
        setIsRecording(true);
        onStartRecording();
        const file = await recorderInstance.start();
        if (file) setAudioFile(file);
      } catch (e) {
        console.error('Ошибка доступа к микрофону:', e);
        // todo: Сообщить пользователю об ошибке
      } finally {
        setIsRecording(false);
        onFinishRecording();
      }
    }
  }

  return (
    <button
      type="button"
      className={className}
      onClick={handleMicClick}
      disabled={disabled || !CAN_RECORD_AUDIO}
      title={
        !CAN_RECORD_AUDIO
          ? text('Микрофон недоступен')
          : isRecording
            ? text('Нажмите, чтобы остановить запись')
            : text('Записать голосовое сообщение')
      }
    >
      <MicrophoneIcon />
    </button>
  );
}
