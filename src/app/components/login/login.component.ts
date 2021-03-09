import { Component, OnInit } from '@angular/core';
import { Login } from '../../entities/login';
import {NgbModal} from '@ng-bootstrap/ng-bootstrap';
import { PhoneNumber } from '../../entities/phoneNumber';

declare let SIPml;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  closeResult = '';
  dataform: Login;
  numberPhone: PhoneNumber;
  sTransferNumber;
  oRingTone;
  oRingbackTone;
  oSipStack;
  oSipSessionRegister;
  oSipSessionCall;
  oSipSessionTransferCall;
  audioRemote;
  bFullScreen = false;
  oNotifICall;
  bDisableVideo = false;
  oConfigCall;
  oReadyStateTimer;
  ringtone;ringbacktone;

  constructor(private modalService: NgbModal) {
    this.dataform = new Login();
  }

  ngOnInit(): void {
  }


  open(content) {
    this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'}).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

    });
  }

  sipRegister = () => {
    try {
        // enable notifications if not already done
        // if (window.webkitNotifications && window.webkitNotifications.checkPermission() != 0) {
        //     window.webkitNotifications.requestPermission();
        // }

        Notification.requestPermission();
        // save credentials
        //saveCredentials();
        setTimeout(() => {
console.log('SIPml : ', SIPml);

        }, 1000);
        // update debug level to be sure new values will be used if the user haven't updated the page
        SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");

        // create SIP stack
        this.oSipStack = new SIPml.Stack({
          realm: "asterisk.org",
          impi: this.dataform.impi,
          impu: this.dataform.impu,
          password: this.dataform.password,
          display_name: this.dataform.display_name,
          websocket_proxy_url: this.dataform.websocket_proxy_url,
          /*
            realm: "asterisk.org",
            impi: "2250",
            impu: "sip:2250@voip.uxomnitech.com",
            password: "FeuMQ4mTfz3eMLDWCKac",
            display_name: "2250",
            websocket_proxy_url: "wss://voip.uxomnitech.com:8089/ws",
            */
            outbound_proxy_url: "",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.sip_outboundproxy_url') : null),
            ice_servers: "",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.ice_servers') : null),
            enable_rtcweb_breaker: "",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_rtcweb_breaker') == "true" : false),
            events_listener: { events: '*', listener: this.onSipEventStack },
            enable_early_ims: "",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.disable_early_ims') != "true" : true), // Must be true unless you're using a real IMS network
            enable_media_stream_cache: "",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_media_caching') == "true" : false),
            //bandwidth: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')) : null), // could be redefined a session-level
            //video_size: (window.localStorage ? tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')) : null), // could be redefined a session-level
            sip_headers: [
                    { name: 'User-prueba', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
                    { name: 'Organization', value: 'Doubango Telecom' }
            ]

        }
        );
        if (this.oSipStack.start() != 0) {
            console.log('<b>Failed to start the SIP stack</b>');
        }
        else return;
    }
    catch (e) {
        console.log("<b>2:" + e + "</b>");
    }
    //btnRegister.disabled = false;

}

onSipEventStack = (e) => {
  console.log('==stack event = ' + e.type);
  switch (e.type) {
      case 'started':
          {
              // catch exception for IE (DOM not ready)
              try {
                  // LogIn (REGISTER) as soon as the stack finish starting
                  this.oSipSessionRegister = this.oSipStack.newSession('register', {
                      expires: 200,
                      events_listener: { events: '*', listener: this.onSipEventSession },
                      sip_caps: [
                                  { name: '+g.oma.sip-im', value: null },
                                  //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                  { name: '+audio', value: null },
                                  { name: 'language', value: '\"en,fr\"' }
                      ]
                  });
                  this.oSipSessionRegister.register();
              }
              catch (e) {
                  console.log("<b>1:" + e + "</b>");
                  //btnRegister.disabled = false;
              }
              break;
          }
      case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
          {
              var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
              this.oSipStack = null;
              this.oSipSessionRegister = null;
              this.oSipSessionCall = null;

              //uiOnConnectionEvent(false, false);

             //this.stopRingbackTone();
             // this.stopRingTone();

              //uiVideoDisplayShowHide(false);
              //divCallOptions.style.opacity = 0;

              //txtCallStatus.innerHTML = '';
              console.log(bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>")


              break;
          }

      case 'i_new_call':
          {
              if (this.oSipSessionCall) {
                  // do not accept the incoming call if we're already 'in call'
                  e.newSession.hangup(); // comment this line for multi-line support
              }
              else {


                  this.oSipSessionCall = e.newSession;
                  // start listening for events
                  console.log(e);
                  console.log("aqui fue");
                  console.log(e.o_event.o_message.o_hdr_From.s_display_name);
                  this.oSipSessionCall.setConfiguration(this.oConfigCall);
                  console.log("Answer / Reject")
                  this.uiBtnCallSetText('Answer');
                  //btnHangUp.value = 'Reject';
                  //btnCall.disabled = false;
                  //tnHangUp.disabled = false;
                  //this.startRingTone();
                  var sRemoteNumber = (this.oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                  alert(e.o_event.o_message.o_hdr_From.s_display_name+"  lo esta llamando su numero es = "+sRemoteNumber);
                  //showNotifICall(sRemoteNumber);
              }
              break;
          }

      case 'm_permission_requested':
          {
              //divGlassPanel.style.visibility = 'visible';
              break;
          }
      case 'm_permission_accepted':
      case 'm_permission_refused':
          {
              //divGlassPanel.style.visibility = 'hidden';
              if (e.type == 'm_permission_refused') {
                  //uiCallTerminated('Media stream permission denied');
              }
              break;
          }

      case 'starting': default: break;
  }
}
onSipEventSession = (e) =>{
  console.log('==session event = ' + e.type);

  switch (e.type) {
      case 'connecting': case 'connected':
          {
              var bConnected = (e.type == 'connected');
              if (e.session == this.oSipSessionRegister) {
                  //uiOnConnectionEvent(bConnected, !bConnected);
                  console.log("<i>" + e.description + "</i>");
              }
              else if (e.session == this.oSipSessionCall) {
                  //btnHangUp.value = 'HangUp';
                  //btnCall.disabled = true;
                  //btnHangUp.disabled = false;
                  //btnTransfer.disabled = false;
                  //if (window.btnBFCP) window.btnBFCP.disabled = false;

                  if (bConnected) {
                      this.stopRingbackTone();
                      this.stopRingTone();

                      if (this.oNotifICall) {
                          this.oNotifICall.cancel();
                          this.oNotifICall = null;
                      }
                  }

                  console.log("<i>" + e.description + "</i>");
                  //divCallOptions.style.opacity = bConnected ? 1 : 0;

                  if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                      //uiVideoDisplayEvent(false, true);
                      //uiVideoDisplayEvent(true, true);
                  }
              }
              break;
          } // 'connecting' | 'connected'
      case 'terminating': case 'terminated':
          {
              if (e.session == this.oSipSessionRegister) {
                  //uiOnConnectionEvent(false, false);

                  this.oSipSessionCall = null;
                  this.oSipSessionRegister = null;

                  console.log("<i>" + e.description + "</i>");
              }
              else if (e.session == this.oSipSessionCall) {
                  //uiCallTerminated(e.description);
              }
              break;
          } // 'terminating' | 'terminated'

      case 'm_stream_video_local_added':
          {
              if (e.session == this.oSipSessionCall) {
                  //uiVideoDisplayEvent(true, true);
              }
              break;
          }
      case 'm_stream_video_local_removed':
          {
              if (e.session == this.oSipSessionCall) {
                  //uiVideoDisplayEvent(true, false);
              }
              break;
          }
      case 'm_stream_video_remote_added':
          {
              if (e.session == this.oSipSessionCall) {
                  //uiVideoDisplayEvent(false, true);
              }
              break;
          }
      case 'm_stream_video_remote_removed':
          {
              if (e.session == this.oSipSessionCall) {
                  //uiVideoDisplayEvent(false, false);
              }
              break;
          }

      case 'm_stream_audio_local_added':
      case 'm_stream_audio_local_removed':
      case 'm_stream_audio_remote_added':
      case 'm_stream_audio_remote_removed':
          {
              break;
          }

      case 'i_ect_new_call':
          {
              this.oSipSessionTransferCall = e.session;
              break;
          }

      case 'i_ao_request':
          {
              if (e.session == this.oSipSessionCall) {
                  var iSipResponseCode = e.getSipResponseCode();
                  if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                      this.startRingbackTone();
                      console.log('<i>Remote ringing...</i>');
                  }
              }
              break;
          }

      case 'm_early_media':
          {
              if (e.session == this.oSipSessionCall) {
                  this.stopRingbackTone();
                  this.stopRingTone();
                  console.log('<i>Early media started</i>');
              }
              break;
          }

      case 'm_local_hold_ok':
          {
              if (e.session == this.oSipSessionCall) {
                  if (this.oSipSessionCall.bTransfering) {
                      this.oSipSessionCall.bTransfering = false;
                      // this.AVSession.TransferCall(this.transferUri);
                  }
                  //btnHoldResume.value = 'Resume';
                  //btnHoldResume.disabled = false;
                  //txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
                  this.oSipSessionCall.bHeld = true;
              }
              break;
          }
      case 'm_local_hold_nok':
          {
              if (e.session == this.oSipSessionCall) {
                  this.oSipSessionCall.bTransfering = false;
                  //btnHoldResume.value = 'Hold';
                  //btnHoldResume.disabled = false;
                  console.log('<i>Failed to place remote party on hold</i>');
              }
              break;
          }
      case 'm_local_resume_ok':
          {
              if (e.session == this.oSipSessionCall) {
                  this.oSipSessionCall.bTransfering = false;
                  //btnHoldResume.value = 'Hold';
                  //btnHoldResume.disabled = false;
                  //txtCallStatus.innerHTML = '<i>Call taken off hold</i>';
                  this.oSipSessionCall.bHeld = false;

                  if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                      //uiVideoDisplayEvent(false, true);
                      //uiVideoDisplayEvent(true, true);
                  }
              }
              break;
          }
      case 'm_local_resume_nok':
          {
              if (e.session == this.oSipSessionCall) {
                  this.oSipSessionCall.bTransfering = false;
                  //btnHoldResume.disabled = false;
                  console.log('<i>Failed to unhold call</i>')
                  }
              break;
          }
      case 'm_remote_hold':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Placed on hold by remote party</i>');
              }
              break;
          }
      case 'm_remote_resume':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Taken off hold by remote party</i>');
              }
              break;
          }
      case 'm_bfcp_info':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('BFCP Info: <i>' + e.description + '</i)>');
              }
              break;
          }

      case 'o_ect_trying':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Call transfer in progress...</i>')                    }
              break;
          }
      case 'o_ect_accepted':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Call transfer accepted</i>')
              }
              break;
          }
      case 'o_ect_completed':
      case 'i_ect_completed':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Call transfer completed</i>')
                  //btnTransfer.disabled = false;
                  if (this.oSipSessionTransferCall) {
                      this.oSipSessionCall = this.oSipSessionTransferCall;
                  }
                  this.oSipSessionTransferCall = null;
              }
              break;
          }
      case 'o_ect_failed':
      case 'i_ect_failed':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log('<i>Call transfer failed</i>');
              //btnTransfer.disabled = false;
              }
              break;
          }
      case 'o_ect_notify':
      case 'i_ect_notify':
          {
              if (e.session == this.oSipSessionCall) {
                  console.log("<i>Call Transfer: <b>" + e.getSipRespo + " " + e.description + "</b></i>");
                  if (e.getSipResponseCode() >= 300) {
                      if (this.oSipSessionCall.bHeld) {
                          this.oSipSessionCall.resume();
                      }
                      //btnTransfer.disabled = false;
                  }
              }
              break;
          }
      case 'i_ect_requested':
          {
              if (e.session == this.oSipSessionCall) {
                  var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
                  if (confirm(s_message)) {
                      console.log("<i>Call transfer in progress...</i>")
                      this.oSipSessionCall.acceptTransfer();
                      break;
                  }
                  this.oSipSessionCall.rejectTransfer();
              }
              break;
          }
  }
}
uiBtnCallSetText = (s_text) =>{
  switch (s_text) {
      case "Call":
          {

              var bDisableCallBtnOptions = (window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_callbtn_options') == "true");
              this.sipCall('call-audio');

              break;
          }
      default:
          {
              this.sipCall('call-audio');
              break;
          }
  }
}
startRingTone = () => {

  try { this.ringtone.play(); }
  catch (e) { }
}
stopRingTone = () => {
  try { this.ringtone.pause(); }
  catch (e) { }
}

startRingbackTone = () => {
  try { this.ringbacktone.play(); }
  catch (e) { }
}

stopRingbackTone = () => {
  try { this.ringbacktone.pause(); }
  catch (e) { }
}

sipCall = (s_type) => {

  let audioRemote = document.getElementById("audio_remote");

  this.oConfigCall = {
      audio_remote: audioRemote,
      video_local: null,
      video_remote: null,
      screencast_window_id: 0x00000000, // entire desktop
      bandwidth: { audio: undefined, video: undefined },
      video_size: { minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
      events_listener: { events: '*', listener: this.onSipEventSession },
      sip_caps: [
                      { name: '+g.oma.sip-im' },
                      { name: 'language', value: '\"en,fr,es\"' }
      ]
  };

  if (this.oSipStack && !this.oSipSessionCall) {
      if (s_type == 'call-screenshare') {
          if (!SIPml.isScreenShareSupported()) {
              alert('Screen sharing not supported. Are you using chrome 26+?');
              return;
          }
          if (!location.protocol.match('https')) {
              if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
                  this.sipUnRegister();
                  //window.location = 'https://ns313841.ovh.net/call.htm';
              }
              return;
          }
      }
      //btnCall.disabled = true;
      //btnHangUp.disabled = false;

      if (window.localStorage) {
          //oConfigCall.bandwidth = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')); // already defined at stack-level but redifined to use latest values
          //oConfigCall.video_size = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')); // already defined at stack-level but redifined to use latest values
      }
      debugger;

      // create call session
      this.oSipSessionCall = this.oSipStack.newSession(s_type, this.oConfigCall);
      // make call
      if (this.oSipSessionCall.call(this.numberPhone.phone) != 0) {
          this.oSipSessionCall = null;
          console.log('Failed to make call');
          //btnCall.disabled = false;
          //btnHangUp.disabled = true;
          return;
      }
      //saveCallOptions();
  }
  else if (this.oSipSessionCall) {

      console.log('<i>Connecting...</i>');
      this.oSipSessionCall.accept(this.oConfigCall);
  }
}
sipUnRegister = () => {
  if (this.oSipStack) {
      this.oSipStack.stop(); // shutdown all sessions
  }
}
}
