JavaSender defaultJavaSender = new SenderClient.Builder("{{ exampleCtrl.currentLocation }}").build();
UnifiedMessage unifiedMessage = new UnifiedMessage.Builder()
        .pushApplicationId("{{ exampleCtrl.applicationId }}")
        .masterSecret("{{ exampleCtrl.application.masterSecret }}")
        .alert("Hello from Java Sender API!")
        .build();
defaultJavaSender.send(unifiedMessage, new MessageResponseCallback() {

    @Override
    public void onComplete(int statusCode) {
        //do cool stuff
    }

    @Override
    public void onError(Throwable throwable) {
        //bring out the bad news
    }
});
