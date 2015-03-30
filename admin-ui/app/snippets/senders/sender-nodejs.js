var agSender = require( "unifiedpush-node-sender" ),
  settings = {
    url: "http://localhost:8080/ag-push",
    applicationId: "12345",
    masterSecret: "123456"
  };

agSender.Sender( settings ).send( message, options ).on( "success", function( response ) {
  console.log( "success called", response );
});
