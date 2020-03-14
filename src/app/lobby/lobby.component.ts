import { Component, OnInit, OnDestroy } from '@angular/core';
import { Lobby, User, LocalUser } from './lobby.model';
import { LobbyService } from './lobby.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../sites/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { JoinComponent } from './join/join.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PlayerService } from '../player/player.service';
import { Player } from '../player/player.model';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  localUser: LocalUser;
  lobby: Lobby;
  player: Player;

  defaultProfilePicture = 'https://www.eguardtech.com/wp-content/uploads/2018/08/Network-Profile.png';

  constructor(private router: Router, private lobbyService: LobbyService, private authenticationService: AuthenticationService,
              private playerService: PlayerService,
              public dialog: MatDialog, private snackBar: MatSnackBar) {

    this.authenticationService.onLocalUserChange.subscribe((newLocalUser) => {
      this.localUser = newLocalUser;
    });

    this.lobbyService.onLobbyChange.subscribe((lobby) => {
      this.lobby = lobby;
    });

    this.playerService.onPlayerChange.subscribe((player) => {
      this.player = player;
    });
  }

  ngOnInit() {
  }

  onQueueSong() {
    this.router.navigate(['search']);
  }

  onCreateLobby() {
    this.lobbyService.createLobby(this.localUser.spotifyId).subscribe();
  }

  onJoinLobby() {
    let joinDialog = this.dialog.open(JoinComponent, {
      width: '250px'
    });

    joinDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.lobbyService.validateLobbyId(result).subscribe((valid) => {
          if (valid) {
            this.lobbyService.joinLobby(this.localUser.spotifyId, result).subscribe(() => {
              this.snackBar.open('Successfully joined the lobby!', 'Dismiss');
            });
          } else {
            this.snackBar.open('Invalid lobby ID!', 'Dismiss');
          }
        });
      }
    });
  }

  onLeaveLobby() {
    this.lobbyService.leaveLobby(this.localUser.spotifyId, this.lobby.id).subscribe();
  }

  onCloseLobby() {
    this.lobbyService.closeLobby(this.lobby.id).subscribe();
  }
}
