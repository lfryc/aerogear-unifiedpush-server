angular.module('ngApp.intro')
  .controller('Wizard', Wizard);


class Wizard2 {

  constructor( answers ) {
    this.answers = answers;
  }

  canActivate() {
    return true;
  }
}
