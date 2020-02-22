import { Component, OnInit, OnDestroy } from '@angular/core';
import { Lobby } from './lobby';
import { LobbyService } from './lobby.service';
import { Router } from '@angular/router';
import { AuthenticationService } from '../sites/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { JoinComponent } from './join/join.component';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  spotifyId: string;
  lobby: Lobby;

  constructor(private router: Router, private lobbyService: LobbyService, private authenticationService: AuthenticationService,
              public dialog: MatDialog, private snackBar: MatSnackBar) {
    this.authenticationService.onSpotifyIdChange.subscribe((newSpotifyId) => {
      this.spotifyId = newSpotifyId;
    });

    this.lobbyService.onLobbyChange.subscribe((lobby) => {
      this.lobby = lobby;
    });
  }

  ngOnInit() {
  }

  onQueueSong() {
    this.router.navigate(['search']);
  }

  onCreateLobby() {
    this.lobbyService.createLobby(this.spotifyId).subscribe();
  }

  onJoinLobby() {
    let joinDialog = this.dialog.open(JoinComponent, {
      width: '250px'
    });

    joinDialog.afterClosed().subscribe((result) => {
      if (result) {
        this.lobbyService.validateLobbyId(result).subscribe((valid) => {
          if (valid) {
            this.lobbyService.joinLobby(this.spotifyId, result).subscribe(() => {
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
    this.lobbyService.leaveLobby(this.spotifyId, this.lobby.id).subscribe();
  }

  onCloseLobby() {
    this.lobbyService.closeLobby(this.lobby.id).subscribe();
  }
}
