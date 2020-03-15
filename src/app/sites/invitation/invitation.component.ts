import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LobbyService } from 'src/app/lobby/lobby.service';
import { AuthenticationService } from '../authentication.service';

@Component({
  selector: 'app-invitation',
  templateUrl: './invitation.component.html',
  styleUrls: ['./invitation.component.scss']
})
export class InvitationComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute,
              private authenticationService: AuthenticationService, private lobbyService: LobbyService) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      console.log(this.authenticationService.getLocalUserId() + 'joined' + params.get('id'))
      this.lobbyService.joinLobby(this.authenticationService.getLocalUserId(), params.get('id'));
      this.router.navigate(['/home']);
    });
  }

}
