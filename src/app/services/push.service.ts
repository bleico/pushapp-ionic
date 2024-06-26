import { Injectable, EventEmitter } from '@angular/core';
import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushService {

  mensajes: OSNotificationPayload[] = [
    // {
    //   title: 'Titulo de la push',
    //   body: 'Este es el body de la push',
    //   date: new Date()
    // }
  ];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor( private oneSignal: OneSignal,
               private storage: Storage) {

    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {

    // Key de OneSignal & Key de Firebase (id remitente)
    this.oneSignal.startInit('8ad35e5d-58ca-4418-9668-f69fa6ef1213', '295219822430');

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((noti) => {
     // do something when notification is received
     console.log('Notificación recibida', noti);
     this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe( async (noti) => {
      // do something when a notification is opened
      console.log('Notificación abierta', noti );
      await this.notificacionRecibida(noti.notification);
    });

    // Obtener Id subscriptor
    this.oneSignal.getIds().then( info => {
      this.userId = info.userId;
      console.log('User', this.userId);
    });


    this.oneSignal.endInit();
  }

  async notificacionRecibida( noti: OSNotification ) {

    await this.cargarMensajes();

    const payload = noti.payload;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID );

    if ( existePush ) {
      return;
    }

    this.mensajes.unshift( payload );
    this.pushListener.emit( payload );

    await this.guardarMensajes();

  }

  guardarMensajes() {
    this.storage.set('mensajes', this.mensajes );
  }

  async cargarMensajes() {

    // this.storage.clear();

    this.mensajes = await this.storage.get('mensajes') || [];

    return this.mensajes;

  }

  async borrarMensajes() {

    await this.storage.clear();
    this.mensajes = [];
    this.guardarMensajes();

  }

}
