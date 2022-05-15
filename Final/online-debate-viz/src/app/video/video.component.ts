import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import { VideoObject,DataService } from 'src/app/common-utils.service'


declare var $: any;
@Component({
  template: '<youtube-player #videoPlayer (stateChange)=onPlayerStateChange($event) width="100%"></youtube-player>',
  selector: 'app-video',
})
export class VideoComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) youtube_player: ElementRef;
  youtubeVideoURL : any;

  constructor(private data: DataService) {
  }

  ngOnInit() {
    this.data.currentVideo.subscribe(message =>  this.createYoutubePlayer(message));
  }

  createYoutubePlayer(message){

    this.youtubeVideoURL = message;
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    VideoObject.obj = this.youtube_player;
    let videoId = this.youtubeVideoURL.split("v=")[1];

    if($("iframe").length > 0) {
      $("iframe").attr("src","https://www.youtube.com/embed/"+videoId);
    } else {
      VideoObject.obj._videoId._value =  videoId;
    }

  }

  // To handle the various states of the youtube player
  // event.data = 1: User has clicked on 'play'
  // event.data = 2: User has clicked on pause
   public onPlayerStateChange(event) {
    // console.log('Player state changed', arguments)
    switch (event.data) {
      case 0:
        this.record('video ended');
        break;
      case 1:
        //User clicked on play
        // var play_btn = document.getElementById('play_btn')
        let play_btn = (document.getElementById('play_btn') as HTMLInputElement);
        // debugger;
        // console.log(play_btn.getAttribute('isVideoPlaying'))
        if (play_btn && play_btn.getAttributeNS(null,'isVideoPlaying') &&  play_btn.getAttributeNS(null, 'isVideoPlaying') != "true") {
          play_btn.setAttributeNS(null, 'isVideoPlaying', "true")
          play_btn.click() //force click the button
        }
        // this.record('video playing from ' + );
        break
      case 2:
        // @ts-ignore
        // User clicked on pause
        var pause_btn = (document.getElementById('pause_btn') as HTMLInputElement);
        if (pause_btn && pause_btn.getAttributeNS(null, 'isVideoPlaying') && pause_btn.getAttributeNS(null, 'isVideoPlaying') != "false") {
          pause_btn.setAttributeNS(null, 'isVideoPlaying', "false")
          pause_btn.click() //force click the button
        }
        // this.record('video paused at ' + this.youtube_player.getCurrentTime());
        // @ts-ignore
    }
  }

  record(str) {
  }
}
