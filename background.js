console.log("Loading background.js");
function violationListener(stack) {
  console.log("Add-on saw stack");
}

browser.tripwire.onViolation.addListener(violationListener);
console.log("Done loading background.js");