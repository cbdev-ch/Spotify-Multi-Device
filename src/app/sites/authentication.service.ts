import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, timer, of, pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { User, LocalUser } from '../lobby/lobby.model';
import { v1 as uuidv1 } from 'uuid';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  private endpoint = 'https://api.smd.intnet.ch';
  private refreshRate = 1000;

  private localUser: BehaviorSubject<LocalUser>;
  public onLocalUserChange: Observable<LocalUser>;

  public onUpdate: Observable<void>;
  private updater: Subscription;

  private state: string;

  header: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private http: HttpClient) {

    this.localUser = new BehaviorSubject(undefined);
    this.onLocalUserChange = this.localUser.asObservable();

    this.onUpdate = timer(0, this.refreshRate).pipe(
      map(() => {
        if (this.state) {
          this.authenticate(this.state).subscribe((localUser) => {
            if (localUser) {
              this.localUser.next(localUser);
              localStorage.setItem('localUser', JSON.stringify(localUser));
            }
          });
        }
      })
    );

    this.onLocalUserChange.subscribe((newLocalUser) => {
      if (!newLocalUser) {
        this.updater = this.onUpdate.subscribe();
      } else {
        this.updater.unsubscribe();
      }
    });

    this.localUser.next(JSON.parse(localStorage.getItem('localUser')));
  }

  getLocalUserId(): string {
    return this.localUser.value.spotifyId;
  }

  get isLoggedIn(): boolean {
    return this.localUser.value ? true : false;
  }

  authenticate(state: string) {
    return this.http.post<{ authorized: boolean, user: LocalUser }>(this.endpoint + '/authenticate', { state }, {
      headers: this.header
    }).pipe(
      map((result) => {
        if (result.authorized) {
          return result.user;
        }
        return undefined;
      })
    );
  }

  login() {
    this.state = uuidv1();
    let loginUrl = this.endpoint + '/login?state=' + encodeURIComponent(this.state);

    let size = { width: 590, height: 920 };
    let leftTop = { left: (window.outerWidth - size.width) / 2, top: (window.outerHeight - size.height) / 2 };

    window.open(loginUrl, 'Login',
    'width=' + size.width + ',height=' + size.height + ',left=' + leftTop.left + ',top=' + leftTop.top);
  }

  logout() {
    this.state = undefined;
    localStorage.removeItem('localUser');
    this.localUser.next(null);
  }
}
