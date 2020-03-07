# sms

This is a tool build to extract data from sms & mms.

My input for data is an **xml backup** produced by the app ['SMS Backup & Restore' on Android](https://play.google.com/store/apps/details?id=com.riteshsahu.SMSBackupRestore).

You may need to adapt it to your use case.

## preparation

- run `yarn` to install dependencies

## xml -> json

> input: **sms.xml** (your file)
- run: `.\xml2json.ps1`

> output: **sms.json**

## json cleaning

> input: **sms.json** file

- copy `.env.sample` file into `.env` and fill it:
  - PHONE is (at least part) of the phone number of your correspondant you want to extract messages you exchanged with
  - LIMIT_SMS maximum number of sms to extract (leave empty to extract all)
  - LIMIT_MMS maximum number of mms to extract (leave empty to extract all)
  - USER_ME is how you want yourself to appear when you're the source of message (_ex:_ him)
  - USER_OTHER is how you want your correspondant (PHONE above) to appear when s·he is the source of a message (_ex:_ her)
  - DATE_FORMAT is used to format the date (using date-fns)
  - TIME_FORMAT is used to format the time (using date-fns)
  - LOCALE is also used to format the date & time  (using date-fns)
- run `yarn clean-json`

> ouput: **sms-clean.json**
