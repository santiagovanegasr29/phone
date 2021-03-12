import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Login } from '../../entities/login';
import { PhoneNumber } from '../../entities/phoneNumber';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Contact } from 'src/app/entities/contacts';
import { Observable, timer } from 'rxjs';
import { trigger, state, style, animate, transition } from '@angular/animations';

declare let SIPml;
declare let Dexie;
// database
var db = new Dexie("contact");
db.version(1).stores({
  contacts: "++id,name,numberPhone",
  missedcall: "++id,name,call,date,time,status,tipo,callTime",
});

@Component({
  selector: 'app-views',
  templateUrl: './views.component.html',
  styleUrls: ['./views.component.css'],
  animations: [ // animaciones

    trigger('numbersAnimation', [
      state('open', style({
        opacity: 1,
        color: 'black'
      })),
      state('closed', style({
        opacity: 0.5,
        color: 'green'
      })),
      transition('open => closed', [
        animate('0.01s')
      ]),
      transition('closed => open', [
        animate('0.01s')
      ]),
    ]),
    trigger('animation1', [
      state('open', style({
        height: '1px',
      })),
      state('closed', style({
        opacity: 3,
      })),
      transition('open => closed', [

        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')

      ]),
    ]),

    trigger('muteAnimation', [
      state('open', style({
        color:"green"
      })),
      state('close', style({
        color:"red"
      })),
      transition('open => closed', [
        animate('1s')
      ]),
      transition('closed => open', [
        animate('1s')
      ]),
    ]),
  ]
})

export class ViewsComponent implements OnInit {
  @ViewChild('numberTransfer')numberTransfer:ElementRef;
  @ViewChild('audio_remote')audio_remote:ElementRef;
  audioRemote;
  formContact: Contact;
  formContactEdit: Contact;
  closeResult = '';
  allContacts;
  callAll;
  numberShow = true;
  public conta: any = [];
  public calls: any = [];
  dataform: Login;
  logout = false;
  calling = false;
  text = true;
  conected;
  login = true;
  audiocall;
  incomingcall;
  numberPhone: PhoneNumber;
  sTransferNumber;
  oRingTone;
  oRingbackTone;
  oSipStack;
  oSipSessionRegister;
  oSipSessionCall;
  oSipSessionTransferCall;

  bFullScreen = false;
  oNotifICall;
  bDisableVideo = false;
  viewLocalScreencast; // <video> (webrtc) or <div> (webrtc4all)
  oConfigCall;
  oReadyStateTimer;
  ringtone;//new Audio('../assets/js/sounds/ringing.mp3');
  ringbacktone; //new Audio('../assets/js/sounds/calling.mp3');
  txtCallStatus;
  uiCallTerminated;
  historyCalls = false;
  listContacts = true;
  recent;
  statusCalls;
  numbers = new Observable<number>();
  time;
  callTime;
  isOpen = true;
  slash= true;
  loading=false;
  copyNumber;
  range;
  callName;
  btnNumberTransfer;
  transferBnt=false;


  constructor(public modalService: NgbModal,private removeClass: ElementRef) {
    this.dataform = new Login();
    this.numberPhone = new PhoneNumber();
    this.formContact = new Contact();
    this.conta = [];
    this.calls = [];

  }

  ngOnInit(): void {
    this.getContacts();
    this.getHistoryCalls();
    this.ringtone = document.getElementById("ringtone");
    this.ringbacktone = document.getElementById("ringbacktone");
  }
  open(content) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

    });
  }

  //copy number
  copy(){

    this.copyNumber = document.querySelector('#entrante');
    console.log(this.copyNumber);
    this.copyNumber.removeAttribute('disabled');
    this.copyNumber.select();
    document.execCommand('copy');
    this.copyNumber.setAttribute('disabled', 'disabled');
    document.body.removeChild(this.copyNumber);

  }
//registring user
  sipRegister = () => {

    try {
      Notification.requestPermission();
      //setTimeout(() => {}, 1000);
      // update debug level to be sure new values will be used if the user haven't updated the page
      SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");
      // create SIP stack
      this.oSipStack = new SIPml.Stack({
        realm: "asterisk.org",
        impi: this.dataform.impi,
        //impu: "sip:" + this.dataform.impi + "@" + this.dataform.impu,
        impu: "sip:"+this.dataform.impi+"@cc.uxomnitech.com",
        password: this.dataform.password,
        display_name: this.dataform.display_name,
       // websocket_proxy_url: this.dataform.websocket_proxy_url,
        websocket_proxy_url: "wss://cc.uxomnitech.com:8089/ws",
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
      }
      );
      if (this.oSipStack.start() != 0) {
        console.log('<b>Failed to start the SIP stack</b>');
      }
      else return this.oSipStack;
    }
    catch (e) {
      console.log("<b>2:" + e + "</b>");
    }
  }

  sipCall = (s_type) => {
    console.log(s_type);
//let audioRemote = document.getElementById("audio_remote");
    this.oConfigCall = {
      audio_remote: this.audio_remote,
      audi_Call: this.audiocall,
      events_listener: { events: '*', listener: this.onSipEventSession },
    }
    if (this.oSipStack && !this.oSipSessionCall) {
      if (s_type == 'call-screenshare') {
        if (!SIPml.isScreenShareSupported()) {
          alert('Screen sharing not supported. Are you using chrome 26+?');
          return;
        }
        if (!location.protocol.match('https')) {
          if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
            //this.sipUnRegister();
            //window.location = 'https://ns313841.ovh.net/call.htm';
          }
          return;
        }
      }
      // create call session
      this.oSipSessionCall = this.oSipStack.newSession(s_type, this.oConfigCall);
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
      //this.onSipEventStack('this.oSipSessionCall.call');
      this.oSipSessionCall.accept(this.oConfigCall);

    }
  }
  sipUnRegister = () => {
    if (this.oSipStack) {
      this.oSipStack.stop(); // shutdown all sessions
      this.logout = false;
      this.login = true;
    }
  }
  sipHangUp = () => {
    if (this.oSipSessionCall) {
      console.log('<i>Terminating the call...</i>');
      this.oSipSessionCall.hangup({ events_listener: { events: '*', listener: this.onSipEventSession } });

    }
  }

  sipToggleMute = () => {
    if (this.oSipSessionCall) {
      var i_ret;
      var bMute = !this.oSipSessionCall.bMute;
      //this.txtCallStatus.innerHTML = bMute ? '<i>Mute the call...</i>' : '<i>Unmute the call...</i>';
      i_ret = this.oSipSessionCall.mute('audio'/*could be 'video'*/, bMute);

      if (i_ret != 0) {
        this.txtCallStatus.innerHTML = '<i>Mute / Unmute failed</i>';
        return;
      }
      this.oSipSessionCall.bMute = bMute;
      //btnMute.value = bMute ? "Unmute" : "Mute";
    }

  }

  sipTransfer = () => {
    if (this.oSipSessionCall) {
      console.log(this.numberTransfer.nativeElement.value);
      var s_destination = this.numberTransfer.nativeElement.value;
      console.log(s_destination);
      // var s_destination = prompt('Enter destination number', '');
      //if (!tsk_string_is_null_or_empty(s_destination)) {
      //btnTransfer.disabled = true;
      if (this.oSipSessionCall.transfer(s_destination) != 0) {
        console.log('<i>Call transfer failed</i>');
        //btnTransfer.disabled = false;
        return;
      }
      console.log('<i>Transfering the call...</i>');
      //}
    }
  }

  startRingTone = () => {

    try {
      this.ringtone.play();
    }
    catch (e) { }
  }
  stopRingTone = () => {
    try { this.ringtone.pause(); }
    catch (e) { }
  }

  startRingbackTone = () => {
    try {
      this.ringbacktone.play();
    }
    catch (e) { }
  }

  stopRingbackTone = () => {
    try { this.ringbacktone.pause(); }
    catch (e) { }
  }
  onSipEventStack = (e) => {
    console.log('==stack event = ' + e.type);
    this.callTime = 0;
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
          this.stopRingbackTone();
          this.stopRingTone();

          //divCallOptions.style.opacity = 0;
          //txtCallStatus.innerHTML = '';
          console.log(bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>")
          break;
        }

      case 'i_new_call':
        {

          if (this.oSipSessionCall) {
            // do not accept the incoming call if we're already 'in call'
            this.recent = "saliente";
            this.statusCalls = "no Answer";
            this.callTime = 0;
            e.newSession.hangup(); // comment this line for multi-line support

          }
          else {
            this.oSipSessionCall = e.newSession;
            // start listening for events
            this.oSipSessionCall.setConfiguration(this.oConfigCall);
            this.calling = true;
            this.loading=false;
            this.startRingTone();
            var sRemoteNumber = (this.oSipSessionCall.getRemoteFriendlyName() || 'unknown');
            //this.incomingcall = document.getElementById("entrante");
            this.callName = e.o_event.o_message.o_hdr_From.s_display_name;
            this.incomingcall = sRemoteNumber;
            //alert(e.o_event.o_message.o_hdr_From.s_display_name+"  lo esta llamando su numero es = "+sRemoteNumber);
            //this.showNotifICall(sRemoteNumber);
            this.recent = "entrante";

          }
          break;
        }

      case 'm_permission_requested':
        {
          //divGlassPanel.style.visibility = 'visible';

          break;
        }
      case 'm_permission_accepted': {
        //this.statusCalls = "no Answer";

      }
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
  onSipEventSession = (e) => {

    console.log('==session event = ' + e.type);

    if (e.type === 'sent_request') {
      this.loading = false;
      this.statusCalls = "Answer";
      const prueba = document.querySelector('.avatar');
            console.log(prueba);
            prueba.classList.remove("avatar");
    }

    switch (e.type) {
      case 'connecting': case 'connected':
        {
          var bConnected = (e.type == 'connected');
          if (e.session == this.oSipSessionRegister) {
            //uiOnConnectionEvent(bConnected, !bConnected);
            console.log("<i>" + e.description + "</i>");

            if (e.description == "Connected") {
              this.logout = true;
              this.login = false;
              this.conected = true;
            }
          }
          else if (e.session == this.oSipSessionCall) {
            if (bConnected) {
              this.stopRingbackTone();
              this.stopRingTone();
              this.time.unsubscribe();

              if (this.oNotifICall) {
                this.oNotifICall.cancel();
                this.oNotifICall = null;
              }

            }
            if (e.description == "In Call") {

            this.incomingcall = this.numberPhone.phone;
            this.loading = false;

           }

            console.log("<i>" + e.description + "</i>");

              this.numbers = timer(1000, 1000);
              this.time = this.numbers.subscribe(x => this.callTime = x);
              console.log(this.callTime);

            if (SIPml.isWebRtc4AllSupported()) {

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
            if (e.description == "Unauthorized") {
              alert("incorrect username or password please try again");
            }

          }
          else if (e.session == this.oSipSessionCall) {
            //this.uiCallTerminated(e.description);

            this.calling = false;
            this.text = true;
            this.oSipSessionCall = null;
            this.slash = true;
            this.loading= false;
            this.postHistoryCalls();
            this.getHistoryCalls();
            this.stopRingbackTone();
            this.stopRingTone();
            this.time.unsubscribe();


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

              this.calling = true;
              this.text = false;
              this.loading = false;
              this.startRingbackTone();
              console.log('ringing...');
              this.recent = "saliente";
              this.time.unsubscribe();

            }
          }
          break;
        }

      case 'm_early_media':
        {
          if (e.session == this.oSipSessionCall) {
            const prueba = document.querySelector('.avatar');
            console.log(prueba);
            //prueba.classList.remove("avatar");
            this.stopRingbackTone();
            this.stopRingTone();
            console.log('<i>Early media started</i>');
            //this.statusCalls = "Answer";
            this.numbers = timer(1000, 1000);
            this.time = this.numbers.subscribe(x => this.callTime = x);
            console.log(this.callTime);

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
            console.log('<i>Call transfer in progress...</i>')
          }
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
  uiBtnCallSetText = (s_text) => {
    switch (s_text) {
      case "Call":
        {
          var bDisableCallBtnOptions = (window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_callbtn_options') == "true");
          this.sipCall('call-audio');
          console.log(bDisableCallBtnOptions);
          break;
        }
      default:
        {
          this.sipCall('call-audio');
          break;
        }
    }
  }

  showNotifICall = (s_number) => {
    // permission already asked when we registered
    //if (window.webkitNotifications && window.webkitNotifications.checkPermission() == 0) {
    if (this.oNotifICall) {
      this.oNotifICall.cancel();
    }
    //this.oNotifICall = Notification.createNotification('images/sipml-34x39.png', 'Incaming call', 'Incoming call from ' + s_number);
    this.oNotifICall.onclose = function () { this.oNotifICall = null; };
    this.oNotifICall.show();

    //}
  }
  pressNum(num: string) {
    if (this.numberPhone.phone === "") {
      this.numberPhone.phone = num;

    } else {
      this.numberPhone.phone = this.numberPhone.phone + num;
    }

  }
  contactCall(numberCall) {
    this.numberPhone.phone = ''+numberCall;
    this.sipCall('call-audio');
  }

  postHistoryCalls() {
    db.missedcall.add({name: this.callName, call: this.incomingcall,date: new Date().toLocaleDateString(), time: new Date().toLocaleTimeString(), tipo: this.recent, status: this.statusCalls, callTime: this.callTime }).then(() => {
      return db.missedcall.toArray();
    }).then((missedcall) => {
      console.log("calls: " + JSON.stringify(missedcall));
    }).catch((e) => {
      alert("Error: " + (e.stack || e));
    });
  }
  getHistoryCalls() {
    this.callAll = db.missedcall.toArray();
    // alert(db.contacts.get({name: this.dataform.name}));
    this.callAll.then((value) => {
      this.calls = value;
      console.log(this.calls);

    });
  }


  updateCalls(id) {

    db.missedcall.update(id, { callTime: this.callTime });
  }

  deleteHistoryCalls(id) {

    db.missedcall.delete(id);
  }

  postContacts() {

    db.contacts.add({ name: this.formContact.name, numberP: this.formContact.numberPhone }).then(() => {
      return db.contacts.toArray();
    }).then((contact) => {
      console.log("My contacts: " + JSON.stringify(contact));
    }).catch((e) => {
      alert("Error: " + (e.stack || e));
    });

  }

  getContacts() {
    this.allContacts = db.contacts.toArray();
    // alert(db.contacts.get({name: this.dataform.name}));
    this.allContacts.then((value) => {
      this.conta = value;

      console.log(this.conta);

    });
  }


  updateContact(id, name, number) {

    db.contacts.update(id, { name: name, numberP: number });


  }
  deleteContact(id) {

    db.contacts.delete(id);
  }

  openUser(contentUser) {

    this.modalService.open(contentUser, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {

    });
  }
  toggle() {
    this.isOpen = !this.isOpen;
  }
  showNumbers() {
   this.numberShow = !this.numberShow;
  }

  loadingCall(){
    this.loading = !this.loading;
    this.text = false;
  }


  historyCall() {
    this.historyCalls = true;
    this.listContacts = false;
  }

  listContact() {
    this.historyCalls = false;
    this.listContacts = true;

  }
  callSlash(){
    this.slash = !this.slash;
  }
  callSound() {
    if (this.ringtone.play() == "fulfilled") {
      this.startRingTone()

    }
    this.stopRingTone();
  }

  tranferCall(){
      this.transferBnt = !this.transferBnt;
  }



}




