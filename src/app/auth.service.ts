import { Injectable } from '@angular/core'
import { Http, Headers, Response, RequestOptions } from '@angular/http'
import { Observable } from 'rxjs'
import 'rxjs/add/operator/map'
import { User } from './models'

@Injectable()
export class AuthService {
  public token: string
  public message = ''
  public currentUser: User

  constructor(private http: Http) {
    // set token if saved in local storage
    const currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.currentUser = {
      username: currentUser.username,
      firstName: currentUser.firstName,
      lastName: currentUser.lastName,
      picture: currentUser.picture,
    }
    this.token = currentUser && currentUser.token
  }

  login(username: string, password: string): Observable<boolean> {
    const headers = new Headers({ 'Content-Type': 'application/json' })
    const options = new RequestOptions({headers: headers})
    return this.http.post('api/authenticate', JSON.stringify({ username: username, password: password }), options)
      .map((response: Response) => {
        // login successful if there's a jwt token in the response
        const token = response.json() && response.json().token

        if (token) {
          // set token property
          this.token = token

          this.currentUser = {
            username: username,
            firstName: response.json().firstName,
            lastName: response.json().lastName,
            picture: response.json().picture,
          }
          // store username and jwt token in local storage to keep user logged in between page refreshes
          localStorage.setItem('currentUser', JSON.stringify(
            {
              username: username,
              firstName: response.json().firstName,
              lastName: response.json().lastName,
              picture: this.currentUser.picture,
              token: token,
            }
          ))

          // return true to indicate successful login
          return true
        } else {
          // return false to indicate failed login
          this.message = response.json().message
          return false
        }
      })
  }

  logout(): void {
    // clear token remove user from local storage to log user out
    this.token = null
    localStorage.removeItem('currentUser')
  }
}
