# Finnbogi-API

Þetta er github repo fyrir bakendann fyrir Finnbogi, vaktaplanskerfið.

Verkefnið heyrir einnig á heroku:
https://finnbogi-api.herokuapp.com/

## Þegar repo er klónað skal keyra:
- npm install
- npm run dev

Til þess að upphafsstilla gagnagrunn þarf að keyra
- npm run setup

(Til þess að gera þetta þarf að setja inn postgres grunn inn í .env skrá)

## vefþjónustan uppfyllir eftirfarandi skipanir:

### AUTHENTICATION
post /users/login
- req.body: username, password

post /users/logout

### USERS
Get /users/info => sækir alla users joinað við userinfo

Get /users/info/:id => sækir user með id joinað við userinfo

Get /users => sækir alla users

Get /users/:id => sækir user með id

Post /users/register => býr til nýjan user venslað við tómt userinfo með bara ssn
- req.body: username, password, role, ssn, admin

Patch /users/info/:id => breytir userinfo
- req.body: firstname, surname, address, email, phonenumber

Delete /users/:id => eyðir user og userinfo venslað við þann user

### SHIFTS
Get /shifts => sækir öll shift

Get /shifts/:shiftId => sækir shift með shiftId

Post /shifts => býr til nýtt shift
- req.body: role, startTime, endTime

Get/shifts/user/:userId => sækir öll shift fyrir userId

Delete /shifts/:shiftId => eyðir shift með shiftId

Patch /shifts/:shiftId/set/:userId => setur userId á shift með shiftId



### NOTIFICATIONS
Get /notifications => sækir öll notification

Get /notifications/:id => sækir notification með id

Get /notifications/user/:userId => sækir öll notification fyrir user

Patch /notifications/:userid/read/:notificationId => read = true fyrir notificationUser

Post /notifications => býr til nýtt notification
- req.body: title, text, userIds (fylki af int)

### Shiftexchange
Get /shiftexchanges => sækir öll shiftexchange

Get /shiftexchanges/:id => sækir shiftexchange með id

Get /shiftexchanges/confirmable => sækir shiftexchange sem eru confirmable

Delete /shiftexchanges/:id => eyðir shiftexchange með id

Post /shiftexchanges/=> býr til nýtt shiftexchange sem er upforgrabs
- req.body => employeeid, shiftid

Patch /shiftexchanges/setpending/:id => setur coworkershiftid og ‘pending’
- req.body => coworkerShiftId

Patch /shiftexchanges/declinepending/:id => setur coworkershiftid sem null og ‘upforgrabs’

Patch /shiftexchanges/approvepending/:id => setur ‘confirmable’

Patch /shiftexchanges/confirm/:id => skiptir á userum og eyðir shiftexchange
