import { Injectable } from '@angular/core'

import * as io from 'socket.io-client'
import { Observable } from 'rxjs/Observable'
import '../shared'

@Injectable()
export class BrokerService {
  private socket: SocketIOClient.Socket

  constructor() { }

  getLog(): Observable<any> {
    return new Observable(observer => {
      this.socket = io('/')
      this.socket.on('log', event => observer.next(event))
      return () => this.socket.disconnect()
    })
  }
}
