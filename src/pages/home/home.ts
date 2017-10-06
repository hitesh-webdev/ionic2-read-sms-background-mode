import { Component } from '@angular/core';
import { NavController, AlertController, Platform } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import { Http } from '@angular/http';
import { BackgroundMode } from '@ionic-native/background-mode';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  smsList: any[] = [];

  constructor(public navCtrl: NavController, private alertCtrl: AlertController, private platform: Platform, private androidPermissions: AndroidPermissions, private http: Http, private backgroundMode: BackgroundMode) { }

  ionViewWillEnter()
  {
  
    // Checking if the Read SMS permission has been granted or not
    this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.READ_SMS).then(
    (success) => {
      let alert = this.alertCtrl.create({
        title: 'Permission granted',
        message: 'We can read SMS now'
      });
      alert.present();
    }).catch(
    (err) => {

      let alert = this.alertCtrl.create({
        title: 'Permission not granted',
        message: 'Asking for permission again'
      });
      alert.present();      

      // Requesting permission of not granted
      this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.READ_SMS);

    });
  
    this.androidPermissions.requestPermissions([this.androidPermissions.PERMISSION.READ_SMS]);

    this.http.get('http://slack.com/api/chat.postMessage?token=<--- Slack API Legacy Token --->&channel=<--- Slack Channel Name --->&text=Hi%20from%20Cordova&username=Cordova&as_user=false').subscribe(() => {

      let alert = this.alertCtrl.create({
        title: 'App is working',
        message: 'Message Posted on Slack'
      });
      alert.present();

    }, (err) => {

      let alert = this.alertCtrl.create({
        title: 'App is not working',
        message: JSON.stringify(err)
      });
      alert.present();

    });

  }

  ionViewDidEnter() {

    this.platform.ready().then(() => {

      // Preventing the App from being paused while in background mode
      this.backgroundMode.enable();

      // Watching for incoming messages
      (<any>window).SMS.startWatch(()=> {
        
        let alert = this.alertCtrl.create({
          title: 'Watching SMS',
          message: 'Started Watching for incoming SMS'
        });
        alert.present();
  
        // Defining the message arrival event
        document.addEventListener('onSMSArrive', (sms: any) => {

          const smsText = encodeURI(sms.data.body);

          // Posting the arrived message on Slack channel
          this.http.get(`http://slack.com/api/chat.postMessage?token=<--- Slack API Legacy Token --->&channel=<--- Slack Channel Name --->&text=${smsText}&username=Cordova&as_user=false`).subscribe(() => {

            let alert = this.alertCtrl.create({
              title: 'Message Posted',
              message: 'Received Message Posted on Slack'
            });
            alert.present();

          }, (err) => {

            let alert = this.alertCtrl.create({
              title: 'Received Message not posted',
              message: JSON.stringify(err)
            });
            alert.present();

          });
  
          let alert = this.alertCtrl.create({
            title: 'SMS Arrived',
            message: JSON.stringify(sms.data)
          });
          alert.present();
  
        });
  
  
      }, (err) => {
  
        let alert = this.alertCtrl.create({
          title: 'Error Watching SMS',
          message: JSON.stringify(err)
        });
        alert.present();
  
      });

    })

  }

  readSMS() {

    // Reading the last 2 SMS from inbox
    let filter = {
      box : 'inbox', // 'inbox' (default), 'sent', 'draft'
      indexFrom : 0, // start from index 0
      maxCount : 2, // count of SMS to return each time
    };

    (<any>window).SMS.listSMS(filter, (sms) => {

      let alert = this.alertCtrl.create({
        title: 'Listing Inbox SMS',
        message: JSON.stringify(sms)
      });
      alert.present();

    }, (err) => {

      let alert = this.alertCtrl.create({
        title: 'Error Listing SMS',
        message: JSON.stringify(err)
      });
      alert.present();

    });

  }

}
