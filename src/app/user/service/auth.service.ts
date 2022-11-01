import { Injectable } from '@angular/core';
import { map, Observable, Subscription, timer } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { environment } from 'src/environments/environment.prod';
import auth from "firebase/compat/app";

declare var gapi: any;

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  public user$: Observable<firebase.default.User|null>;
  public calendarItems: any[] = [];
  timerSubscription: Subscription;

  constructor(public afAuth: AngularFireAuth) {
    this.initClient();
    this.user$ = afAuth.authState;

    this.timerSubscription = timer(0, 1000000).pipe(
      map(() => {
        this.getCalendar();
      })
    ).subscribe();

  }

  public initClient() {
    gapi.load('client', () => {
      console.log('loaded client');

      gapi.client.init({
        apiKey: environment.firebase.apiKey,
        clientId: environment.firebase.clientId,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
        scope: 'https://www.googleapis.com/auth/calendar',
        plugin_name:'Home dashboard'
      });

      gapi.client.load('calendar', 'v3', () => console.log('loaded calendar'));
    });
  }

  public async login() {
    const googleAuth = gapi.auth2.getAuthInstance();
    const googleUser = await googleAuth.signIn();
    const token = googleUser.getAuthResponse().id_token;
    const credential = auth.auth.GoogleAuthProvider.credential(token);

    await this.afAuth.signInWithCredential(credential);
  }

  public logout() {
    this.afAuth.signOut;
  }

  public async getCalendar() {
    const events = await gapi.client.calendar.events.list({
      calendarId: 'family13630864922043822911@group.calendar.google.com',
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResult: 10,
      orderBy: 'startTime'
    });

    console.log(events);

    this.calendarItems = events.result.items;
  }
}
