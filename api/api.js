console.log("parent.js is executing");

class API extends ExtensionAPI {
  getAPI(context) {
  	return {
	  tripwire: {
	  	onViolation: new EventManager(context, "experiments.tripwire", fire => {
	  	  let observer = msg => {
	  	  	console.log("Recording violation");
	  	  	fire.async(stack);
	  	  };
	  	  console.log("Adding observer");
	  	  Services.ppmm.addMessageListener("Tripwire:opp-violation", observer);
	      return () => {
	      	console.log("Removing observer");
	      	Services.ppmm.removeMessageListener("Tripwire:opp-violation", observer);
	      }
	  	}).api()
	  }
  	}
  }
}

console.log("parent.js finished executing");